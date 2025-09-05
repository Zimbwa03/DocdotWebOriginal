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
  speechRecognition: any; // Web Speech API recognition instance
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
    audioChunks: [],
    speechRecognition: null
  });

  // Lecture metadata
  const [lectureMetadata, setLectureMetadata] = useState({
    title: '',
    module: '',
    topic: '',
    lecturer: ''
  });

  // Speech recognition language
  const [speechLanguage, setSpeechLanguage] = useState('en-ZW'); // English (Zimbabwe)

  // UI state
  const [activeTab, setActiveTab] = useState<'record' | 'notes' | 'history'>('record');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [loadingLectureId, setLoadingLectureId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveNotes, setLiveNotes] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [noteGenerationTimeout, setNoteGenerationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showGenerateButton, setShowGenerateButton] = useState(false);

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

  // Real-time transcription using Web Speech API
  const startRealTimeTranscription = () => {
    setIsTranscribing(true);
    setLiveTranscript('');
    
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Web Speech API not supported in this browser');
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari."
      });
      setIsTranscribing(false);
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition settings
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show interim results
    recognition.lang = speechLanguage; // Use selected language
    recognition.maxAlternatives = 1;
    
    // Start recognition
    recognition.start();
    console.log('🎤 Real-time speech recognition started');
    
    // Handle results
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update live transcript - keep all previous content and add new
      const newTranscript = liveTranscript + finalTranscript;
      setLiveTranscript(newTranscript + interimTranscript);
      
      // Debug: Log transcript content
      console.log('📝 Final transcript added:', finalTranscript);
      console.log('📝 Total transcript length:', newTranscript.length);
      console.log('📝 Current transcript preview:', newTranscript.substring(0, 200));
      
      // Show generate button when we have substantial content
      if (newTranscript.trim().length > 100) {
        setShowGenerateButton(true);
      }

      // Auto-save transcript periodically (every 500 characters of new content)
      if (finalTranscript.trim().length > 0 && newTranscript.length % 500 === 0) {
        const currentLecture = lectures.find(l => l.status === 'recording');
        if (currentLecture) {
          saveLectureData(currentLecture.id, newTranscript, liveNotes);
        }
      }
    };
    
    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error occurred';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
      }
      
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: errorMessage
      });
      
      setIsTranscribing(false);
    };
    
    // Handle end of recognition
    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsTranscribing(false);
    };
    
    // Store recognition instance for stopping
    setRecordingState(prev => ({ ...prev, speechRecognition: recognition }));
  };

  // Manual transcript input for testing (temporary)
  const handleManualTranscript = (transcript: string) => {
    setLiveTranscript(transcript);
    if (transcript.trim()) {
      generateLiveNotes(transcript);
    }
  };

  // Handle viewing a lecture
  const handleViewLecture = async (lectureId: string) => {
    setLoadingLectureId(lectureId);
    try {
      // Fetch lecture details, transcript, and notes
      const [lectureResponse, transcriptResponse, notesResponse] = await Promise.all([
        fetch(`/api/lectures/${lectureId}`),
        fetch(`/api/lectures/${lectureId}/transcript`),
        fetch(`/api/lectures/${lectureId}/notes`)
      ]);

      if (lectureResponse.ok && transcriptResponse.ok && notesResponse.ok) {
        const lecture = await lectureResponse.json();
        const transcript = await transcriptResponse.json();
        const notes = await notesResponse.json();

        // Set the data to display in the current view
        setLiveTranscript(transcript.transcript || '');
        setLiveNotes(notes.notes || '');
        setLectureMetadata({
          title: lecture.title,
          module: lecture.module,
          topic: lecture.topic || '',
          lecturer: lecture.lecturer || ''
        });

        // Switch to notes tab to show the content
        setActiveTab('notes');
        
        toast({
          title: "Lecture Loaded",
          description: `Viewing lecture: ${lecture.title}`
        });
      } else {
        throw new Error('Failed to fetch lecture data');
      }
    } catch (error) {
      console.error('Error viewing lecture:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lecture details"
      });
    } finally {
      setLoadingLectureId(null);
    }
  };

  // Handle downloading lecture notes
  const handleDownloadLecture = async (lectureId: string, lectureTitle: string) => {
    try {
      const [transcriptResponse, notesResponse] = await Promise.all([
        fetch(`/api/lectures/${lectureId}/transcript`),
        fetch(`/api/lectures/${lectureId}/notes`)
      ]);

      if (transcriptResponse.ok && notesResponse.ok) {
        const transcript = await transcriptResponse.json();
        const notes = await notesResponse.json();

        // Create downloadable content
        const content = `
# ${lectureTitle}

## Transcript
${transcript.transcript || 'No transcript available'}

## Notes
${notes.notes || 'No notes available'}

## Key Points
${notes.keyPoints ? notes.keyPoints.map((point: string) => `- ${point}`).join('\n') : 'No key points available'}

## Medical Terms
${notes.medicalTerms ? notes.medicalTerms.map((term: string) => `- ${term}`).join('\n') : 'No medical terms available'}

---
Generated by Docdot Lecture Assistant
Date: ${new Date().toLocaleDateString()}
        `.trim();

        // Create and download file
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lectureTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Download Started",
          description: "Lecture notes are being downloaded"
        });
      } else {
        throw new Error('Failed to fetch lecture data');
      }
    } catch (error) {
      console.error('Error downloading lecture:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download lecture notes"
      });
    }
  };

  // Handle deleting a lecture
  const handleDeleteLecture = async (lectureId: string, lectureTitle: string) => {
    // Use a more user-friendly confirmation
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lectureTitle}"?\n\nThis will permanently remove:\n• The lecture recording\n• All transcripts\n• All generated notes\n• All processing logs\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/lectures/${lectureId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh the lectures list
        queryClient.invalidateQueries({ queryKey: ['lectures', user?.id] });
        
        toast({
          title: "Lecture Deleted",
          description: `"${lectureTitle}" has been deleted successfully`
        });
      } else {
        throw new Error('Failed to delete lecture');
      }
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete lecture. Please try again."
      });
    }
  };

  // Manual generate notes button handler
  const handleGenerateNotes = async () => {
    if (!liveTranscript.trim()) {
      toast({
        title: "No Content",
        description: "Please record some lecture content first.",
        variant: "destructive"
      });
      return;
    }

    const currentLecture = lectures.find(l => l.status === 'recording');
    if (!currentLecture) {
      toast({
        title: "No Active Lecture",
        description: "Please start recording a lecture first.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🎯 Manual generate notes triggered...');
      setIsGeneratingNotes(true);
      
      // Call backend to process the complete lecture
      const response = await fetch('/api/lectures/process-complete-lecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lectureId: currentLecture.id,
          transcript: liveTranscript,
          module: lectureMetadata.module,
          topic: lectureMetadata.topic
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notes generated successfully');
        
        // Update the live notes with the processed content
        setLiveNotes(data.processedNotes);
        
        // Save the processed notes to database
        await saveLectureData(currentLecture.id, liveTranscript, data.processedNotes);
        
        // Show success message
        toast({
          title: "Notes Generated!",
          description: "AI has created structured, well-researched notes from your lecture.",
        });
      } else {
        console.error('Failed to generate notes');
        toast({
          title: "Generation Failed",
          description: "Could not generate notes. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating notes.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Process complete lecture with AI after recording stops
  const processCompleteLecture = async (lectureId: string, transcript: string) => {
    try {
      console.log('🤖 Processing complete lecture with AI...');
      setIsProcessing(true);
      
      // Call backend to process the complete lecture
      const response = await fetch('/api/lectures/process-complete-lecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lectureId,
          transcript,
          module: lectureMetadata.module,
          topic: lectureMetadata.topic
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Complete lecture processed successfully');
        
        // Update the live notes with the processed content
        setLiveNotes(data.processedNotes);
        
        // Save the processed notes to database
        await saveLectureData(lectureId, transcript, data.processedNotes);
        
        // Show success message
        toast({
          title: "Lecture Processed!",
          description: "AI has generated structured notes from your complete lecture.",
        });
      } else {
        console.error('Failed to process complete lecture');
        toast({
          title: "Processing Failed",
          description: "Could not process lecture with AI. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing complete lecture:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the lecture.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate live notes from transcript using Gemini AI (DEPRECATED - not used during lecture)
  const generateLiveNotes = async (transcript: string) => {
    // Only generate notes if we have actual speech content
    if (!transcript || transcript.trim().length < 30) {
      console.log('Not enough transcript content to generate notes');
      return;
    }

    console.log('🎯 Generating notes from transcript:', transcript.substring(0, 100) + '...');
    setIsGeneratingNotes(true);

    try {
      const response = await fetch('/api/lectures/generate-live-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript, // Use the actual transcript content
          module: lectureMetadata.module,
          topic: lectureMetadata.topic
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI notes generated successfully');
        setLiveNotes(data.liveNotes);
        setIsGeneratingNotes(false);
        
        // Auto-save notes when generated (use full accumulated transcript)
        const currentLecture = lectures.find(l => l.status === 'recording');
        if (currentLecture) {
          saveLectureData(currentLecture.id, transcript, data.liveNotes);
        }
      } else {
        console.error('Failed to generate live notes');
        // Fallback to basic notes based on actual transcript
        const fallbackNotes = `
## Key Points from Live Lecture

### ${lectureMetadata.module}
- ${lectureMetadata.topic || 'General medical concepts discussed'}

### Transcript Summary
${transcript.substring(0, 200)}...

### Live Notes
- Real-time note generation in progress
- AI-powered content analysis
- Structured for easy revision
        `.trim();
        
        setLiveNotes(fallbackNotes);
        setIsGeneratingNotes(false);
        
        // Auto-save fallback notes too (use full accumulated transcript)
        const currentLecture = lectures.find(l => l.status === 'recording');
        if (currentLecture) {
          saveLectureData(currentLecture.id, transcript, fallbackNotes);
        }
      }
    } catch (error) {
      console.error('Error generating live notes:', error);
      // Fallback to basic notes based on actual transcript
      const fallbackNotes = `
## Key Points from Live Lecture

### ${lectureMetadata.module}
- ${lectureMetadata.topic || 'General medical concepts discussed'}

### Transcript Summary
${transcript.substring(0, 200)}...

### Live Notes
- Real-time note generation in progress
- AI-powered content analysis
- Structured for easy revision
      `.trim();
      
      setLiveNotes(fallbackNotes);
      setIsGeneratingNotes(false);
      
      // Auto-save fallback notes on error too (use full accumulated transcript)
      const currentLecture = lectures.find(l => l.status === 'recording');
      if (currentLecture) {
        saveLectureData(currentLecture.id, transcript, fallbackNotes);
      }
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

      // Start real-time transcription
      startRealTimeTranscription();
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
      
      // Stop speech recognition
      if (recordingState.speechRecognition) {
        recordingState.speechRecognition.stop();
      }

      // Clear note generation timeout
      if (noteGenerationTimeout) {
        clearTimeout(noteGenerationTimeout);
        setNoteGenerationTimeout(null);
      }
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        mediaRecorder: null,
        speechRecognition: null
      }));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Stop transcription simulation
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
      }
      setIsTranscribing(false);

      // Stop recording on backend and save transcript/notes
      const currentLecture = lectures.find(l => l.status === 'recording');
      if (currentLecture) {
        // Save the complete accumulated transcript first
        await saveLectureData(currentLecture.id, liveTranscript, '');
        
        // Stop recording in database
        await stopRecordingMutation.mutateAsync(currentLecture.id);
        
        // Show success message
        toast({
          title: "Recording Stopped",
          description: "Lecture recorded successfully. Click 'Generate Notes' to process with AI.",
        });
      }
    }
  };

  // Save lecture transcript and notes to database
  const saveLectureData = async (lectureId: string, transcript: string, notes: string) => {
    try {
      // Save transcript
      if (transcript.trim()) {
        await fetch(`/api/lectures/${lectureId}/save-transcript`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: transcript,
            languageDetected: speechLanguage,
            confidence: 0.9
          }),
        });
      }

      // Save notes
      if (notes.trim()) {
        await fetch(`/api/lectures/${lectureId}/save-notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            liveNotes: notes,
            processingStatus: 'completed'
          }),
        });
      }

      console.log('✅ Lecture data saved successfully');
    } catch (error) {
      console.error('❌ Error saving lecture data:', error);
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
                  
                  <div>
                    <Label htmlFor="language">Speech Recognition Language</Label>
                    <select
                      id="language"
                      value={speechLanguage}
                      onChange={(e) => setSpeechLanguage(e.target.value)}
                      disabled={recordingState.isRecording}
                      className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="en-ZW">English (Zimbabwe)</option>
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="en-AU">English (Australia)</option>
                      <option value="en-ZA">English (South Africa)</option>
                      <option value="en-NG">English (Nigeria)</option>
                      <option value="en-KE">English (Kenya)</option>
                      <option value="en-GH">English (Ghana)</option>
                      <option value="en-TZ">English (Tanzania)</option>
                      <option value="en-UG">English (Uganda)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select the language that best matches your lecture. English (Zimbabwe) is optimized for mixed Shona-English content.
                    </p>
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
                            
                            {/* Real-time speech recognition status */}
                            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                  Real-time Speech Recognition Active
                                </span>
                              </div>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                Speak clearly into your microphone. The system will transcribe your speech in real-time and accumulate the full lecture content. Click "Generate Notes" when ready to process with AI.
                              </p>
                              {liveTranscript && (
                                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                  <strong>Live Transcript:</strong> {liveTranscript.length} characters
                                  <span className="ml-2 text-green-600">✓ Transcribing lecture content</span>
                                </div>
                              )}
                              
                              {showGenerateButton && (
                                <div className="mt-3">
                                  <button
                                    onClick={handleGenerateNotes}
                                    disabled={isGeneratingNotes}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                                  >
                                    {isGeneratingNotes ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Generating AI Notes...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>🤖</span>
                                        <span>Generate Notes with AI</span>
                                      </>
                                    )}
                                  </button>
                                  <p className="text-xs text-gray-500 mt-1 text-center">
                                    AI will organize, structure, and research your lecture content
                                  </p>
                                </div>
                              )}
                            </div>
                                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border max-h-96 overflow-y-auto">
                    <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[200px]">
                      {liveTranscript || (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>Listening for speech... Speak into your microphone</span>
                        </div>
                      )}
                      {isTranscribing && liveTranscript && (
                        <span className="text-blue-500 animate-pulse">|</span>
                      )}
                    </div>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewLecture(lecture.id)}
                            disabled={loadingLectureId === lecture.id}
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
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
