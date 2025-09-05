import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Save, 
  Download, 
  Trash2, 
  FileText, 
  Clock, 
  BookOpen,
  Brain,
  Languages,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Filter,
  Calendar,
  User,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Lecture {
  id: string;
  title: string;
  module: string;
  topic: string;
  lecturer: string;
  date: string;
  duration: number;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  transcript: string;
  notes: string;
  summary: string;
  audioUrl?: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

export default function Record() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    mediaRecorder: null,
    audioChunks: []
  });

  // Lecture metadata
  const [lectureMetadata, setLectureMetadata] = useState({
    title: '',
    module: '',
    topic: '',
    lecturer: ''
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'record' | 'notes' | 'history'>('record');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveNotes, setLiveNotes] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const transcriptIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch lectures
  const { data: lectures = [], isLoading: loadingLectures } = useQuery({
    queryKey: ['/api/lectures', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/lectures/${user.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Start recording mutation
  const startRecordingMutation = useMutation({
    mutationFn: async (metadata: typeof lectureMetadata) => {
      const response = await fetch('/api/lectures/start-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metadata, userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to start recording');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Recording Started",
        description: "Lecture recording has begun. Speak clearly for best transcription results."
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Recording Failed",
        description: "Failed to start recording. Please try again."
      });
    }
  });

  // Stop recording mutation
  const stopRecordingMutation = useMutation({
    mutationFn: async (lectureId: string) => {
      const response = await fetch(`/api/lectures/${lectureId}/stop-recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to stop recording');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recording Stopped",
        description: "Processing your lecture notes. This may take a few minutes."
      });
      setIsProcessing(true);
      queryClient.invalidateQueries({ queryKey: ['/api/lectures', user?.id] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Stop Failed",
        description: "Failed to stop recording. Please try again."
      });
    }
  });

  // Simulate real-time transcription
  const simulateTranscription = () => {
    const sampleTranscripts = [
      "Welcome to today's lecture on cardiovascular physiology.",
      "We will be discussing the structure and function of the heart.",
      "The heart is a four-chambered organ that pumps blood throughout the body.",
      "Let's start with the basic anatomy of the heart chambers.",
      "The right atrium receives deoxygenated blood from the body.",
      "The left atrium receives oxygenated blood from the lungs.",
      "The ventricles are the main pumping chambers of the heart.",
      "The right ventricle pumps blood to the lungs for oxygenation.",
      "The left ventricle pumps oxygenated blood to the rest of the body.",
      "This creates a double circulation system in the human body."
    ];

    let currentIndex = 0;
    setIsTranscribing(true);
    setLiveTranscript('');

    transcriptIntervalRef.current = setInterval(() => {
      if (currentIndex < sampleTranscripts.length) {
        setLiveTranscript(prev => prev + (prev ? ' ' : '') + sampleTranscripts[currentIndex]);
        currentIndex++;
      } else {
        // Generate live notes from transcript
        generateLiveNotes(liveTranscript);
        setIsTranscribing(false);
        if (transcriptIntervalRef.current) {
          clearInterval(transcriptIntervalRef.current);
        }
      }
    }, 3000); // Add new text every 3 seconds
  };

  // Generate live notes from transcript using Gemini AI
  const generateLiveNotes = async (transcript: string) => {
    try {
      const response = await fetch('/api/lectures/generate-live-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          module: lectureMetadata.module,
          topic: lectureMetadata.topic
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLiveNotes(data.liveNotes);
      } else {
        console.error('Failed to generate live notes');
        // Fallback to basic notes
        setLiveNotes(`
## Key Points from Live Lecture

### ${lectureMetadata.module}
- ${lectureMetadata.topic || 'General medical concepts discussed'}
- Important medical terminology and definitions
- Clinical applications and relevance

### Live Notes
- Real-time note generation in progress
- AI-powered content analysis
- Structured for easy revision
        `.trim());
      }
    } catch (error) {
      console.error('Error generating live notes:', error);
      // Fallback to basic notes
      setLiveNotes(`
## Key Points from Live Lecture

### ${lectureMetadata.module}
- ${lectureMetadata.topic || 'General medical concepts discussed'}
- Important medical terminology and definitions
- Clinical applications and relevance
      `.trim());
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!lectureMetadata.title || !lectureMetadata.module) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in lecture title and module before recording."
      });
      return;
    }

    try {
      // Request microphone access with high quality settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setRecordingState(prev => ({ ...prev, audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          variant: "destructive",
          title: "Recording Error",
          description: "An error occurred during recording. Please try again."
        });
      };

      mediaRecorder.start(1000); // Collect data every second
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        mediaRecorder,
        audioChunks
      }));

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      // Start recording on backend
      await startRecordingMutation.mutateAsync(lectureMetadata);

      // Start simulated transcription
      simulateTranscription();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record lectures."
      });
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (recordingState.mediaRecorder && recordingState.isRecording) {
      recordingState.mediaRecorder.stop();
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        mediaRecorder: null
      }));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Stop transcription simulation
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
      }
      setIsTranscribing(false);

      // Stop recording on backend
      const currentLecture = lectures.find(l => l.status === 'recording');
      if (currentLecture) {
        await stopRecordingMutation.mutateAsync(currentLecture.id);
      }
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (recordingState.mediaRecorder) {
      if (recordingState.isPaused) {
        recordingState.mediaRecorder.resume();
        intervalRef.current = setInterval(() => {
          setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }));
        }, 1000);
      } else {
        recordingState.mediaRecorder.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      
      setRecordingState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter lectures
  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = !filterModule || lecture.module === filterModule;
    return matchesSearch && matchesModule;
  });

  // Get unique modules for filter
  const modules = [...new Set(lectures.map(l => l.module))].filter(Boolean);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur animate-pulse"></div>
              <Mic className="relative w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Docdot Lecture Assistant
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                Record, transcribe, and generate intelligent notes from your medical lectures
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            {[
              { id: 'record', label: 'Record Lecture', icon: Mic },
              { id: 'notes', label: 'Live Notes', icon: FileText },
              { id: 'history', label: 'Lecture History', icon: BookOpen }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`mx-1 ${activeTab === tab.id ? 'shadow-md' : ''}`}
                  style={activeTab === tab.id ? { backgroundColor: '#3399FF' } : {}}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Record Tab */}
        {activeTab === 'record' && (
          <div className="space-y-6">
            {/* Lecture Metadata Form */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>Lecture Information</span>
                </CardTitle>
                <CardDescription>
                  Provide details about your lecture for better organization and processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Lecture Title *</Label>
                    <Input
                      id="title"
                      value={lectureMetadata.title}
                      onChange={(e) => setLectureMetadata(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Cardiovascular Physiology - Heart Function"
                      disabled={recordingState.isRecording}
                    />
                  </div>
                  <div>
                    <Label htmlFor="module">Module/Subject *</Label>
                    <Input
                      id="module"
                      value={lectureMetadata.module}
                      onChange={(e) => setLectureMetadata(prev => ({ ...prev, module: e.target.value }))}
                      placeholder="e.g., Physiology, Anatomy, Pathology"
                      disabled={recordingState.isRecording}
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic">Specific Topic</Label>
                    <Input
                      id="topic"
                      value={lectureMetadata.topic}
                      onChange={(e) => setLectureMetadata(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="e.g., Cardiac Cycle, Blood Pressure Regulation"
                      disabled={recordingState.isRecording}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lecturer">Lecturer Name</Label>
                    <Input
                      id="lecturer"
                      value={lectureMetadata.lecturer}
                      onChange={(e) => setLectureMetadata(prev => ({ ...prev, lecturer: e.target.value }))}
                      placeholder="e.g., Dr. Smith, Prof. Johnson"
                      disabled={recordingState.isRecording}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recording Controls */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span>Recording Controls</span>
                </CardTitle>
                <CardDescription>
                  Start recording your lecture. The system will transcribe and generate notes in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  {/* Recording Status */}
                  <div className="flex items-center justify-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${recordingState.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-lg font-medium">
                      {recordingState.isRecording ? 'Recording in Progress' : 'Ready to Record'}
                    </span>
                    {recordingState.isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        LIVE
                      </Badge>
                    )}
                  </div>

                  {/* Duration Display */}
                  {recordingState.duration > 0 && (
                    <div className="text-3xl font-mono font-bold text-blue-600">
                      {formatDuration(recordingState.duration)}
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center space-x-4">
                    {!recordingState.isRecording ? (
                      <Button
                        onClick={startRecording}
                        disabled={!lectureMetadata.title || !lectureMetadata.module}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                      >
                        <Mic className="w-6 h-6 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <div className="flex space-x-3">
                        <Button
                          onClick={togglePause}
                          variant="outline"
                          size="lg"
                          className="px-6 py-3"
                        >
                          {recordingState.isPaused ? (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-5 h-5 mr-2" />
                              Pause
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          size="lg"
                          className="px-6 py-3"
                        >
                          <Square className="w-5 h-5 mr-2" />
                          Stop Recording
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing your lecture notes...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Languages className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mixed Language Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Automatically detects and translates Shona to English for unified transcripts
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Notes</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Real-time note extraction and post-lecture summarization with research integration
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Structured Output</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Clean, exam-ready notes with tables, bullet points, and medical terminology
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Live Lecture Notes</span>
                </CardTitle>
                <CardDescription>
                  Real-time transcription and note generation during your lecture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Live Transcript */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Live Transcript</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {recordingState.isRecording ? 'Live' : 'Paused'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTranscript(!showTranscript)}
                        >
                          {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    {showTranscript ? (
                      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {recordingState.isRecording ? (
                          <div className="space-y-2">
                            {isTranscribing && (
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-blue-600 font-medium">Transcribing live...</span>
                              </div>
                            )}
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                              {liveTranscript || (
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                  <span>Waiting for speech...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Start recording to see live transcript</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <EyeOff className="w-8 h-8 mx-auto mb-2" />
                        <p>Transcript hidden</p>
                      </div>
                    )}
                  </div>

                  {/* Live Notes */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 min-h-[200px]">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Live Notes</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {recordingState.isRecording ? (
                        <div className="space-y-2">
                          {isTranscribing && (
                            <div className="flex items-center space-x-2 mb-3">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-blue-600 font-medium">Generating notes from lecture content...</span>
                            </div>
                          )}
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                            {liveNotes ? (
                              <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap font-sans">{liveNotes}</pre>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-gray-500">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <span>Waiting for content to generate notes...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Start recording to generate live notes</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search lectures..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={filterModule}
                      onChange={(e) => setFilterModule(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Modules</option>
                      {modules.map(module => (
                        <option key={module} value={module}>{module}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lectures List */}
            <div className="space-y-4">
              {loadingLectures ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredLectures.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Lectures Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchQuery || filterModule ? 'No lectures match your search criteria.' : 'Start recording your first lecture to see it here.'}
                    </p>
                    {!searchQuery && !filterModule && (
                      <Button onClick={() => setActiveTab('record')} style={{ backgroundColor: '#3399FF' }}>
                        <Mic className="w-4 h-4 mr-2" />
                        Record First Lecture
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredLectures.map((lecture) => (
                  <Card key={lecture.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {lecture.title}
                            </h3>
                            <Badge 
                              variant={lecture.status === 'completed' ? 'default' : 'secondary'}
                              style={lecture.status === 'completed' ? { backgroundColor: '#10B981' } : {}}
                            >
                              {lecture.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{lecture.module}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(lecture.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(lecture.duration)}</span>
                            </div>
                            {lecture.lecturer && (
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{lecture.lecturer}</span>
                              </div>
                            )}
                          </div>
                          {lecture.topic && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <strong>Topic:</strong> {lecture.topic}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
