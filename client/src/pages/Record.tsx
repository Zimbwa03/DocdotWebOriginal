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
  Calendar,
  User,
  Brain,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Loader2,
  PlusCircle,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Mic2
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
  liveTranscript?: string;
  liveNotes?: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  startTime: Date | null;
  duration: number;
  speechRecognition: any;
}

export default function Record() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    startTime: null,
    duration: 0,
    speechRecognition: null
  });

  // Lecture metadata
  const [lectureData, setLectureData] = useState({
    title: '',
    module: '',
    topic: '',
    lecturer: ''
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'record' | 'notes' | 'history'>('record');
  const [showTranscript, setShowTranscript] = useState(true);
  const [loadingLectureId, setLoadingLectureId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveNotes, setLiveNotes] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-ZW');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [noteGenerationTimeout, setNoteGenerationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout>();
  const transcriptIntervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch lectures
  const { data: lectures = [] } = useQuery({
    queryKey: ['/api/lectures', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/lectures/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch lectures');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Start recording mutation
  const startRecordingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/lectures/start-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lectureData, userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to start recording');
      return response.json();
    },
    onSuccess: (data) => {
      setRecordingState(prev => ({ ...prev, isRecording: true, startTime: new Date() }));
      startSpeechRecognition();
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
      setRecordingState(prev => ({ ...prev, isRecording: false, isPaused: false }));
      stopSpeechRecognition();
      toast({
        title: "Recording Stopped", 
        description: "Processing your lecture notes. This may take a few minutes."
      });
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

  // Speech recognition functions
  const startSpeechRecognition = () => {
    console.log('🎤 Initializing speech recognition...');
    
    setLiveTranscript('');
    setFinalTranscript('');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Web Speech API not supported in this browser');
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari."
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLanguage;
    
    recognition.onstart = () => {
      console.log('✅ Speech recognition started successfully');
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalText) {
        setFinalTranscript(prev => prev + finalText);
        setLiveTranscript('');
      } else {
        setLiveTranscript(interimTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.start();
    setRecordingState(prev => ({ ...prev, speechRecognition: recognition }));
  };

  const stopSpeechRecognition = () => {
    if (recordingState.speechRecognition) {
      recordingState.speechRecognition.stop();
      setRecordingState(prev => ({ ...prev, speechRecognition: null }));
    }
  };

  // Timer update effect
  useEffect(() => {
    if (recordingState.isRecording && !recordingState.isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => {
          if (prev.startTime) {
            const duration = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
            return { ...prev, duration };
          }
          return prev;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recordingState.isRecording, recordingState.isPaused]);

  // Handle lecture actions
  const handleViewLecture = async (lectureId: string) => {
    setLoadingLectureId(lectureId);
    try {
      // Implement view logic
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to view lecture"
      });
    } finally {
      setLoadingLectureId(null);
    }
  };

  const handleDownloadLecture = async (lectureId: string, title: string) => {
    try {
      // Implement download logic
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Download Failed",
        description: "Failed to download lecture"
      });
    }
  };

  const handleDeleteLecture = async (lectureId: string, title: string) => {
    try {
      // Implement delete logic
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed", 
        description: "Failed to delete lecture"
      });
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Filter lectures
  const filteredLectures = lectures.filter((lecture: Lecture) => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = !filterModule || lecture.module === filterModule;
    return matchesSearch && matchesModule;
  });

  // Get unique modules
  const modules = [...new Set(lectures.map((l: Lecture) => l.module))].filter(Boolean);

  // Cleanup on unmount
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
                  onClick={() => setActiveTab(tab.id as 'record' | 'notes' | 'history')}
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
          <div className="space-y-8">
            <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Mic2 className="w-8 h-8 mr-3" />
                  Lecture Recording
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Set up your lecture details and start recording
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Lecture Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter lecture title"
                        value={lectureData.title}
                        onChange={(e) => setLectureData({...lectureData, title: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="module">Module</Label>
                      <Input
                        id="module"
                        placeholder="e.g., Anatomy, Physiology"
                        value={lectureData.module}
                        onChange={(e) => setLectureData({...lectureData, module: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="topic">Topic</Label>
                      <Input
                        id="topic"
                        placeholder="Specific topic or chapter"
                        value={lectureData.topic}
                        onChange={(e) => setLectureData({...lectureData, topic: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lecturer">Lecturer</Label>
                      <Input
                        id="lecturer"
                        placeholder="Lecturer name"
                        value={lectureData.lecturer}
                        onChange={(e) => setLectureData({...lectureData, lecturer: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Recording Status: {recordingState.isRecording ? 'Recording' : 'Ready'}
                    </div>
                    {recordingState.isRecording && (
                      <div className="text-2xl font-mono text-blue-600 mb-4">
                        {Math.floor(recordingState.duration / 60)}:{(recordingState.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                    
                    <div className="flex justify-center space-x-4">
                      {!recordingState.isRecording ? (
                        <Button
                          size="lg"
                          onClick={() => startRecordingMutation.mutate()}
                          disabled={!lectureData.title || !lectureData.module || startRecordingMutation.isPending}
                          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
                        >
                          <Mic className="w-5 h-5 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setRecordingState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
                            className="px-6 py-3"
                          >
                            {recordingState.isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                            {recordingState.isPaused ? 'Resume' : 'Pause'}
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => stopRecordingMutation.mutate('current-lecture')}
                            disabled={stopRecordingMutation.isPending}
                            className="px-6 py-3 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Square className="w-5 h-5 mr-2" />
                            Stop Recording
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Transcript */}
                  {recordingState.isRecording && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Live Transcript</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTranscript(!showTranscript)}
                        >
                          {showTranscript ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                          {showTranscript ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                      
                      {showTranscript ? (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border max-h-48 overflow-y-auto">
                          <div className="text-left text-sm">
                            {finalTranscript && (
                              <div className="text-gray-900 dark:text-white">
                                {finalTranscript}
                                {liveTranscript && <span className="text-blue-500 animate-pulse ml-1">|</span>}
                              </div>
                            )}
                            {liveTranscript && (
                              <div className="text-blue-600 dark:text-blue-400">
                                {liveTranscript}
                                <span className="text-blue-500 animate-pulse ml-1">|</span>
                              </div>
                            )}
                            {!finalTranscript && !liveTranscript && (
                              <div className="flex items-center space-x-2 text-gray-500">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Listening for speech... Speak into your microphone</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <EyeOff className="w-8 h-8 mx-auto mb-2" />
                          <p>Transcript hidden</p>
                        </div>
                      )}
                    </div>
                  )}
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
                <CardTitle>Live Notes</CardTitle>
                <CardDescription>AI-generated notes from your lecture transcript</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[300px]">
                  {recordingState.isRecording ? (
                    <div className="space-y-2">
                      {isTranscribing && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-blue-600 font-medium">Generating notes from lecture content...</span>
                        </div>
                      )}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                        {isGeneratingNotes ? (
                          <div className="flex items-center space-x-2 text-orange-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                            <span>AI is organizing and researching your lecture content...</span>
                          </div>
                        ) : liveNotes ? (
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans">{liveNotes}</pre>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Click "Generate Notes" to process your lecture with AI...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center py-20">Start recording to generate live notes</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
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
                      {modules.map((module: string) => (
                        <option key={module} value={module}>{module}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Lecture Statistics */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Lectures</div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{lectures.length}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {lectures.filter((l: Lecture) => l.status === 'completed').length}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Processing</div>
                    <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                      {lectures.filter((l: Lecture) => l.status === 'processing').length}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Total Hours</div>
                    <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                      {Math.round(lectures.reduce((acc: number, l: Lecture) => acc + l.duration, 0) / 3600)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lectures List */}
            <div className="space-y-4">
              {filteredLectures.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardContent className="text-center py-20">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No lectures found</p>
                    <p className="text-sm text-gray-400">Start recording your first lecture!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredLectures.map((lecture: Lecture) => (
                  <Card key={lecture.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {lecture.title}
                            </h3>
                            <Badge variant={lecture.status === 'completed' ? 'default' : 'secondary'}>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewLecture(lecture.id)}
                            disabled={loadingLectureId === lecture.id}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            {loadingLectureId === lecture.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4 mr-1" />
                            )}
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadLecture(lecture.id, lecture.title)}
                            className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                            title="Download as PDF"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDeleteLecture(lecture.id, lecture.title)}
                            title="Delete lecture"
                          >
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