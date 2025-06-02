import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format, isToday } from 'date-fns';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Bookmark, 
  BookmarkCheck,
  ArrowLeft, 
  CheckCircle,
  Target,
  Brain,
  Activity,
  Heart,
  Pill,
  Microscope,
  ChevronRight,
  User,
  Trophy,
  Calendar as CalendarIcon,
  PlayCircle,
  Search,
  Download,
  ExternalLink,
  FileText,
  Video,
  Library,
  GraduationCap,
  Lightbulb,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Music,
  Users,
  MessageCircle,
  Settings,
  Flame
} from 'lucide-react';

interface StudySection {
  id: number;
  title: string;
  description: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

interface StudyTopic {
  id: number;
  section_id: number;
  title: string;
  content: string;
  difficulty_level: string;
  estimated_read_time: number;
  tags: string[];
  order_index: number;
  completion_percentage: number;
  is_bookmarked: boolean;
  notes?: string;
  last_accessed?: string;
  section_title?: string;
}

interface UserProgress {
  topics_started: number;
  topics_completed: number;
  bookmarked_topics: number;
  average_progress: number;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}

interface StudyResource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'textbook' | 'video' | 'article' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  downloadUrl?: string;
  estimatedTime?: number;
}

// Schema for study session form
const sessionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export default function StudyGuide() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Study Guide State
  const [location] = useLocation();
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('timer');

  // Reset component state when navigating back to StudyGuide
  useEffect(() => {
    if (location === '/study-guide') {
      // Reset all state variables to default values
      setSelectedSection(null);
      setSelectedTopic(null);
      setUserNotes('');
      setReadingProgress(0);
      setSearchQuery('');
      setActiveTab('timer');
      // Reset timer state
      setIsRunning(false);
      setTimeLeft(studyGoal * 60);
      setIsBreak(false);
      setTimerNotes('');
      // Clear any running timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [location, studyGoal]);

  // Study Planner State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Study Timer State
  const [studyGoal, setStudyGoal] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(studyGoal * 60);
  const [isPomodoroMode, setIsPomodoroMode] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [timerNotes, setTimerNotes] = useState("");
  const [totalTimeStudied, setTotalTimeStudied] = useState(0);
  const [isBackgroundMusicOn, setIsBackgroundMusicOn] = useState(false);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState("");
  const [masterVolume, setMasterVolume] = useState(50);
  const [audioVolume, setAudioVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Study Groups State
  const [studyGroups, setStudyGroups] = useState([]);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupMeetingLink, setNewGroupMeetingLink] = useState('');
  const [newGroupScheduledTime, setNewGroupScheduledTime] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState(10);

  // Background audio tracks
  const audioTracks = [
    {
      id: "focus1",
      name: "Deep Focus Music",
      description: "Calming instrumental music for concentration",
      youtubeId: "qQzf-xzZO7M"
    },
    {
      id: "nature1", 
      name: "Nature Sounds",
      description: "Relaxing nature sounds for study",
      youtubeId: "lkkGlVWvkLk"
    },
    {
      id: "lofi1",
      name: "Lo-Fi Hip Hop",
      description: "Chill lo-fi beats for studying",
      youtubeId: "b_DcQHbJIfE"
    },
    {
      id: "classical1",
      name: "Classical Piano",
      description: "Peaceful classical piano music",
      youtubeId: "WPni755-Krg"
    },
    {
      id: "ambient1",
      name: "Ambient Study",
      description: "Atmospheric ambient sounds",
      youtubeId: "7pmxO9fHBHk"
    },
    {
      id: "rain1",
      name: "Rain & Thunder",
      description: "Relaxing rain sounds with distant thunder",
      youtubeId: "hlWiI4xVXKY"
    },
    {
      id: "cafe1",
      name: "Coffee Shop",
      description: "Cozy coffee shop ambiance",
      youtubeId: "iL2psQTS-lw"
    },
    {
      id: "forest1",
      name: "Forest Sounds",
      description: "Peaceful forest atmosphere",
      youtubeId: "kag0aJqQsGo"
    }
  ];

  // Study session form
  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      startTime: "",
      endTime: "",
      status: "scheduled",
      isRecurring: false,
      recurringPattern: "",
    },
  });

  // Timer effects
  useEffect(() => {
    setTimeLeft(studyGoal * 60);
  }, [studyGoal]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (isPomodoroMode) {
        if (!isBreak) {
          setIsBreak(true);
          setTimeLeft(breakTime * 60);
        } else {
          setIsBreak(false);
          setTimeLeft(studyGoal * 60);
        }
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, studyGoal, breakTime, isPomodoroMode, isBreak]);

  // Audio control functions - Mobile-friendly implementation
  const playBackgroundAudio = () => {
    if (selectedAudioTrack && !isMuted) {
      const track = audioTracks.find(t => t.id === selectedAudioTrack);
      if (track) {
        // Calculate final volume (master volume * audio volume / 100)
        const finalVolume = (masterVolume * audioVolume) / 10000;
        
        // Remove existing audio
        const existingFrame = document.getElementById('background-audio-frame');
        if (existingFrame) {
          existingFrame.remove();
        }
        
        // For mobile browsers, we need to use a different approach
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For mobile devices, we need user interaction to start audio
          // Create a mobile-friendly YouTube embed with user prompt
          showMobileAudioPrompt(track);
        } else {
          // Desktop: Use YouTube iframe
          const audioUrl = `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&loop=1&playlist=${track.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&volume=${Math.round(finalVolume * 100)}`;
          
          const iframe = document.createElement('iframe');
          iframe.id = 'background-audio-frame';
          iframe.src = audioUrl;
          iframe.style.display = 'none';
          iframe.allow = 'autoplay; encrypted-media';
          iframe.style.opacity = finalVolume.toString();
          document.body.appendChild(iframe);
        }
      }
    }
  };

  // Mobile audio prompt function
  const showMobileAudioPrompt = (track: any) => {
    // Remove any existing overlay
    const existingOverlay = document.getElementById('mobile-audio-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Calculate final volume
    const finalVolume = (masterVolume * audioVolume) / 10000;
    
    // Create a user-friendly prompt overlay
    const overlay = document.createElement('div');
    overlay.id = 'mobile-audio-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: system-ui;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px; background: #1a1a1a; border-radius: 10px; margin: 20px; max-width: 90vw;">
        <h3 style="margin-bottom: 10px;">🎵 Enable Background Music</h3>
        <p style="margin-bottom: 15px;">Play "${track.title}" during your study session?</p>
        <p style="margin-bottom: 20px; font-size: 14px; opacity: 0.8;">Mobile browsers require user interaction to play audio</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="enable-audio-btn" style="
            background: #3399FF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
          ">Start Music</button>
          <button id="skip-audio-btn" style="
            background: #666;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
          ">Skip Audio</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Handle start music button
    const startButton = document.getElementById('enable-audio-btn');
    startButton?.addEventListener('click', () => {
      // Create Web Audio API context for mobile-compatible sound generation
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create different types of ambient sounds based on track selection
      const createAmbientSound = (type: string) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure sound based on track type
        switch (type) {
          case 'rain':
            // White noise for rain effect
            const bufferSize = audioContext.sampleRate * 2;
            const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              output[i] = Math.random() * 2 - 1;
            }
            const whiteNoise = audioContext.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;
            
            const rainFilter = audioContext.createBiquadFilter();
            rainFilter.type = 'lowpass';
            rainFilter.frequency.value = 2000;
            
            whiteNoise.connect(rainFilter);
            rainFilter.connect(gainNode);
            gainNode.gain.value = finalVolume * 0.3;
            whiteNoise.start();
            break;
            
          case 'ambient':
          case 'forest':
            // Low frequency ambient drone
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 4);
            oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 8);
            filter.frequency.value = 400;
            gainNode.gain.value = finalVolume * 0.2;
            oscillator.start();
            break;
            
          case 'lofi':
          case 'classical':
            // Gentle sine wave with modulation
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 6);
            oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 12);
            gainNode.gain.value = finalVolume * 0.15;
            oscillator.start();
            break;
            
          case 'coffee':
          default:
            // Brown noise for coffee shop ambiance
            const brownNoiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
            const brownOutput = brownNoiseBuffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < brownOutput.length; i++) {
              const white = Math.random() * 2 - 1;
              brownOutput[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = brownOutput[i];
              brownOutput[i] *= 3.5;
            }
            const brownNoise = audioContext.createBufferSource();
            brownNoise.buffer = brownNoiseBuffer;
            brownNoise.loop = true;
            brownNoise.connect(gainNode);
            gainNode.gain.value = finalVolume * 0.25;
            brownNoise.start();
            break;
        }
        
        // Store reference for cleanup
        (window as any).currentAudioContext = audioContext;
        (window as any).currentAudioNodes = { oscillator, gainNode, filter };
      };
      
      // Start the ambient sound
      createAmbientSound(track.id);
      
      // Create a visual indicator that audio is playing
      const audioIndicator = document.createElement('div');
      audioIndicator.id = 'background-audio-frame';
      audioIndicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: #3399FF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        z-index: 1000;
        animation: pulse 2s infinite;
        cursor: pointer;
      `;
      audioIndicator.innerHTML = '🎵';
      audioIndicator.title = `Playing: ${track.title}`;
      
      // Add click to stop audio
      audioIndicator.addEventListener('click', () => {
        if ((window as any).currentAudioContext) {
          (window as any).currentAudioContext.close();
          audioIndicator.remove();
        }
      });
      
      document.body.appendChild(audioIndicator);
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `;
      document.head.appendChild(style);
      
      overlay.remove();
    });
    
    // Handle skip audio button
    const skipButton = document.getElementById('skip-audio-btn');
    skipButton?.addEventListener('click', () => {
      overlay.remove();
    });
    
    // Auto-remove overlay after 15 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 15000);
  };

  // Volume control functions
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopBackgroundAudio();
    } else if (isRunning && selectedAudioTrack) {
      playBackgroundAudio();
    }
  };

  const updateVolume = () => {
    if (isRunning && selectedAudioTrack && !isMuted) {
      playBackgroundAudio(); // Restart with new volume
    }
  };

  // Study Groups helper functions
  const detectMeetingType = (link: string): 'zoom' | 'meet' | 'unknown' => {
    if (link.includes('zoom.us') || link.includes('zoom.com')) return 'zoom';
    if (link.includes('meet.google.com')) return 'meet';
    return 'unknown';
  };

  const isActive = (scheduledTime: string): boolean => {
    const now = new Date();
    const meetingTime = new Date(scheduledTime);
    const timeDiff = now.getTime() - meetingTime.getTime();
    // Meeting is considered active from start time to 2 hours after
    return timeDiff >= 0 && timeDiff <= 2 * 60 * 60 * 1000;
  };

  const createStudyGroup = () => {
    const meetingType = detectMeetingType(newGroupMeetingLink);
    if (meetingType === 'unknown') {
      alert('Please provide a valid Zoom or Google Meet link');
      return;
    }

    const newGroup = {
      id: Date.now(),
      title: newGroupTitle,
      description: newGroupDescription,
      meetingLink: newGroupMeetingLink,
      meetingType,
      scheduledTime: newGroupScheduledTime,
      maxMembers: newGroupMaxMembers,
      currentMembers: 1,
      category: newGroupCategory,
      creator: user?.email || 'You',
      members: [{ id: user?.id, email: user?.email, hasJoined: false }]
    };

    setStudyGroups([...studyGroups, newGroup]);
    
    // Reset form
    setNewGroupTitle('');
    setNewGroupDescription('');
    setNewGroupMeetingLink('');
    setNewGroupScheduledTime('');
    setNewGroupCategory('');
    setNewGroupMaxMembers(10);
    setShowCreateGroupDialog(false);
  };

  const joinGroup = (groupId: number) => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    const scheduledTime = new Date(group.scheduledTime);
    const now = new Date();

    if (isActive(group.scheduledTime)) {
      // Meeting is active - increment member count and open meeting
      setStudyGroups(studyGroups.map(g => 
        g.id === groupId 
          ? { ...g, currentMembers: g.currentMembers + 1 }
          : g
      ));
      window.open(group.meetingLink, '_blank');
    } else if (scheduledTime > now) {
      // Meeting is in future - set reminder
      const reminderTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000); // 30 minutes before
      alert(`Reminder set! You'll receive an email notification 30 minutes before the meeting starts.`);
      
      // In a real implementation, this would call an API to set up the email reminder
      console.log('Setting reminder for:', reminderTime, 'for meeting:', group.meetingLink);
    }
  };

  const stopBackgroundAudio = () => {
    const existingFrame = document.getElementById('background-audio-frame');
    if (existingFrame) {
      existingFrame.remove();
    }
  };

  // Timer functions
  const startTimer = () => {
    setIsRunning(true);
    if (isBackgroundMusicOn && selectedAudioTrack) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile, show immediate prompt when timer starts
        const track = audioTracks.find(t => t.id === selectedAudioTrack);
        if (track) {
          showMobileAudioPrompt(track);
        }
      } else {
        // Desktop can autoplay
        playBackgroundAudio();
      }
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (isBackgroundMusicOn) {
      stopBackgroundAudio();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(studyGoal * 60);
    setIsBreak(false);
    if (isBackgroundMusicOn) {
      stopBackgroundAudio();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Study session functions
  const onSubmit = (data: SessionFormData) => {
    console.log('Session data:', data);
    toast({
      title: "Study Session Created",
      description: `Session "${data.title}" has been scheduled successfully.`,
    });
    setIsDialogOpen(false);
    form.reset();
  };

  const getSessionsForDate = (date: Date) => {
    // Mock sessions for demonstration
    const sessions = [
      {
        id: 1,
        title: "Anatomy Review",
        startTime: "09:00",
        endTime: "10:30",
        category: "Anatomy",
        status: "scheduled"
      },
      {
        id: 2,
        title: "Physiology Practice",
        startTime: "14:00",
        endTime: "15:30",
        category: "Physiology",
        status: "completed"
      }
    ];
    
    return isToday(date) ? sessions : [];
  };

  // Fetch study guide sections
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['/api/study-guide/sections'],
    queryFn: async () => {
      const response = await fetch('/api/study-guide/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      return response.json();
    },
  });

  // Fetch topics for selected section
  const { data: topics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ['/api/study-guide/topics', selectedSection, user?.id],
    queryFn: async () => {
      if (!selectedSection) return [];
      const response = await fetch(`/api/study-guide/topics/${selectedSection}?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      return response.json();
    },
    enabled: !!selectedSection && !!user?.id,
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ['/api/study-guide/user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/study-guide/user-progress/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user progress');
      return response.json();
    },
    enabled: !!user?.id,
  }) as { data: UserProgress | undefined };

  // Fetch resources/books from drive
  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch('/api/resources/books');
      if (!res.ok) {
        throw new Error('Failed to fetch books');
      }
      return res.json() as Promise<DriveFile[]>;
    }
  });

  // Static study resources and tips
  const studyTips = [
    {
      id: '1',
      title: 'Active Recall Technique',
      description: 'Test yourself frequently rather than just re-reading notes',
      category: 'Study Methods',
      type: 'article' as const,
      difficulty: 'beginner' as const,
      estimatedTime: 10
    },
    {
      id: '2', 
      title: 'Spaced Repetition',
      description: 'Review material at increasing intervals for better retention',
      category: 'Memory',
      type: 'practice' as const,
      difficulty: 'intermediate' as const,
      estimatedTime: 15
    },
    {
      id: '3',
      title: 'Medical Mnemonics',
      description: 'Memory aids for complex medical terminology and processes',
      category: 'Memory',
      type: 'article' as const,
      difficulty: 'beginner' as const,
      estimatedTime: 20
    },
    {
      id: '4',
      title: 'Gray\'s Anatomy Guide',
      description: 'Essential anatomical structures and clinical correlations',
      category: 'Anatomy',
      type: 'textbook' as const,
      difficulty: 'advanced' as const,
      estimatedTime: 120
    }
  ];

  const onlineResources = [
    {
      id: 'osmosis',
      title: 'Osmosis.org',
      description: 'Interactive medical education platform with videos and practice questions',
      url: 'https://www.osmosis.org',
      category: 'Online Platform'
    },
    {
      id: 'kenhub',
      title: 'Kenhub.com', 
      description: 'Comprehensive anatomy learning platform with 3D models',
      url: 'https://www.kenhub.com',
      category: 'Anatomy'
    },
    {
      id: 'teachme',
      title: 'TeachMeAnatomy.info',
      description: 'Free anatomy education resource with detailed explanations',
      url: 'https://teachmeanatomy.info',
      category: 'Anatomy'
    }
  ];

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { 
      topicId: number; 
      completionPercentage: number; 
      notes?: string; 
      isBookmarked?: boolean 
    }) => {
      const response = await fetch('/api/study-guide/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...data
        })
      });
      if (!response.ok) throw new Error('Failed to update progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-guide/topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-guide/user-progress'] });
    },
  });

  // Load topic content
  const loadTopic = async (topicId: number) => {
    try {
      const response = await fetch(`/api/study-guide/topic/${topicId}?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      const topic = await response.json();
      setSelectedTopic(topic);
      setUserNotes(topic.notes || '');
      setReadingProgress(topic.completion_percentage || 0);
    } catch (error) {
      console.error('Error loading topic:', error);
    }
  };

  // Handle bookmark toggle
  const toggleBookmark = () => {
    if (!selectedTopic) return;
    
    const newBookmarkStatus = !selectedTopic.is_bookmarked;
    updateProgressMutation.mutate({
      topicId: selectedTopic.id,
      completionPercentage: readingProgress,
      notes: userNotes,
      isBookmarked: newBookmarkStatus
    });
    
    setSelectedTopic(prev => prev ? { ...prev, is_bookmarked: newBookmarkStatus } : null);
  };

  // Handle progress update
  const updateProgress = (progress: number) => {
    if (!selectedTopic) return;
    
    setReadingProgress(progress);
    updateProgressMutation.mutate({
      topicId: selectedTopic.id,
      completionPercentage: progress,
      notes: userNotes,
      isBookmarked: selectedTopic.is_bookmarked
    });
  };

  // Handle notes save
  const saveNotes = () => {
    if (!selectedTopic) return;
    
    updateProgressMutation.mutate({
      topicId: selectedTopic.id,
      completionPercentage: readingProgress,
      notes: userNotes,
      isBookmarked: selectedTopic.is_bookmarked
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'anatomy': return Heart;
      case 'physiology': return Activity;
      case 'pathology': return Microscope;
      case 'clinical': return User;
      case 'pharmacology': return Pill;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingSections) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Topic Detail View
  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTopic(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedTopic.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {selectedTopic.section_title}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedTopic.estimated_read_time} min read
                  </span>
                  <Badge className={getDifficultyColor(selectedTopic.difficulty_level)}>
                    {selectedTopic.difficulty_level}
                  </Badge>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={toggleBookmark}
                className={selectedTopic.is_bookmarked ? 'bg-yellow-50 border-yellow-300' : ''}
              >
                {selectedTopic.is_bookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reading Progress</h3>
                <span className="text-sm text-gray-600">{readingProgress}% complete</span>
              </div>
              <Progress value={readingProgress} className="mb-4" />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateProgress(25)}
                  disabled={readingProgress >= 25}
                >
                  25%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateProgress(50)}
                  disabled={readingProgress >= 50}
                >
                  50%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateProgress(75)}
                  disabled={readingProgress >= 75}
                >
                  75%
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateProgress(100)}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={readingProgress >= 100}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedTopic.content}
                </div>
              </div>
              
              {selectedTopic.tags && selectedTopic.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Notes</CardTitle>
              <CardDescription>
                Add your own notes and insights about this topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Write your notes here..."
                className="min-h-[120px] mb-4"
              />
              <Button onClick={saveNotes} disabled={updateProgressMutation.isPending}>
                {updateProgressMutation.isPending ? 'Saving...' : 'Save Notes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Topics List View
  if (selectedSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSection(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sections
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {sections.find((s: StudySection) => s.id === selectedSection)?.title}
            </h1>
            <p className="text-gray-600">
              {sections.find((s: StudySection) => s.id === selectedSection)?.description}
            </p>
          </div>

          {loadingTopics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic: StudyTopic) => (
                <Card 
                  key={topic.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => loadTopic(topic.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {topic.title}
                      </h3>
                      {topic.is_bookmarked && (
                        <BookmarkCheck className="w-5 h-5 text-yellow-500 ml-2" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {topic.estimated_read_time} min
                      </span>
                      <Badge className={getDifficultyColor(topic.difficulty_level)}>
                        {topic.difficulty_level}
                      </Badge>
                    </div>

                    {topic.completion_percentage > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{topic.completion_percentage}%</span>
                        </div>
                        <Progress value={topic.completion_percentage} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {topic.tags?.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {topic.tags?.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{topic.tags.length - 2} more
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Helper functions
  const filteredBooks = books?.filter(book => 
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDownload = async (fileId: string) => {
    try {
      const res = await fetch(`/api/resources/books/${fileId}/download`);
      if (!res.ok) {
        throw new Error('Failed to generate download URL');
      }
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'textbook': return BookOpen;
      case 'video': return Video;
      case 'article': return FileText;
      case 'practice': return Target;
      default: return FileText;
    }
  };

  // Main Sections View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Study Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive study materials, resources, and interactive content for medical education
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Study Timer
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Study Planner
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Study Tips
            </TabsTrigger>
          </TabsList>

          {/* Study Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            {/* User Progress Overview */}
            {userProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Your Study Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userProgress.topics_started}
                      </div>
                      <div className="text-sm text-gray-600">Topics Started</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userProgress.topics_completed}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {userProgress.bookmarked_topics}
                      </div>
                      <div className="text-sm text-gray-600">Bookmarked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(userProgress.average_progress || 0)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Study Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section: StudySection) => {
                const IconComponent = getCategoryIcon(section.category);
                return (
                  <Card 
                    key={section.id} 
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {section.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {section.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm">
                        {section.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="group-hover:bg-blue-50 group-hover:border-blue-300"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Start Learning
                        </Button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Study Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Study Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Study Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Schedule Study Session</DialogTitle>
                        <DialogDescription>
                          Create a new study session for {format(selectedDate, 'MMMM d, yyyy')}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Session Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter session title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="anatomy">Anatomy</SelectItem>
                                    <SelectItem value="physiology">Physiology</SelectItem>
                                    <SelectItem value="pathology">Pathology</SelectItem>
                                    <SelectItem value="pharmacology">Pharmacology</SelectItem>
                                    <SelectItem value="biochemistry">Biochemistry</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="startTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="endTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Add session details..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit">Create Session</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Daily Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Schedule for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSessionsForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No study sessions scheduled for this date</p>
                        <p className="text-sm">Click "Add Study Session" to get started</p>
                      </div>
                    ) : (
                      getSessionsForDate(selectedDate).map((session: any) => (
                        <Card key={session.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                  {session.startTime} - {session.endTime}
                                </span>
                                <h4 className="font-medium">{session.title}</h4>
                                <Badge variant="secondary" className="w-fit mt-1">
                                  {session.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={session.status === "completed" ? "default" : "outline"}>
                                {session.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timer */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Study Timer
                  </CardTitle>
                  <CardDescription>
                    {isBreak ? "Break Time!" : "Focus on your studies"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer Display */}
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-4">
                      {formatTime(timeLeft)}
                    </div>
                    {isPomodoroMode && (
                      <Badge variant={isBreak ? "destructive" : "default"} className="text-sm">
                        {isBreak ? "Break Time" : "Study Time"}
                      </Badge>
                    )}
                  </div>

                  {/* Timer Controls */}
                  <div className="flex justify-center space-x-4">
                    {!isRunning ? (
                      <Button onClick={startTimer} size="lg">
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} size="lg" variant="secondary">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetTimer} size="lg" variant="outline">
                      <SkipForward className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {/* Timer Settings */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="study-duration">Study Duration (minutes)</Label>
                        <span className="text-sm text-gray-500">{studyGoal}min</span>
                      </div>
                      <Slider
                        id="study-duration"
                        min={5}
                        max={120}
                        step={5}
                        value={[studyGoal]}
                        onValueChange={(value) => setStudyGoal(value[0])}
                        disabled={isRunning}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pomodoro-mode"
                        checked={isPomodoroMode}
                        onCheckedChange={setIsPomodoroMode}
                        disabled={isRunning}
                      />
                      <Label htmlFor="pomodoro-mode">Pomodoro Mode</Label>
                    </div>

                    {isPomodoroMode && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                          <span className="text-sm text-gray-500">{breakTime}min</span>
                        </div>
                        <Slider
                          id="break-duration"
                          min={5}
                          max={30}
                          step={5}
                          value={[breakTime]}
                          onValueChange={(value) => setBreakTime(value[0])}
                          disabled={isRunning}
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="background-music"
                          checked={isBackgroundMusicOn}
                          onCheckedChange={setIsBackgroundMusicOn}
                        />
                        <Label htmlFor="background-music">Background Music</Label>
                        <Music className="w-4 h-4 text-gray-400" />
                      </div>

                      {isBackgroundMusicOn && (
                        <div className="space-y-2 ml-6">
                          <Label htmlFor="audio-track">Select Audio Track</Label>
                          <Select value={selectedAudioTrack} onValueChange={setSelectedAudioTrack}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose background audio" />
                            </SelectTrigger>
                            <SelectContent>
                              {audioTracks.map((track) => (
                                <SelectItem key={track.id} value={track.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{track.name}</span>
                                    <span className="text-xs text-gray-500">{track.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedAudioTrack && (
                            <div className="text-xs text-gray-500 mt-1">
                              Audio will play when timer starts
                            </div>
                          )}
                        </div>
                      )}

                      {/* Volume Control Section */}
                      {isBackgroundMusicOn && (
                        <div className="space-y-4 mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Volume Control & Mixing</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleMute}
                              className="h-8 w-8 p-0"
                            >
                              {isMuted ? <Volume2 className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                          </div>

                          {/* Master Volume */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="master-volume" className="text-sm">Master Volume</Label>
                              <span className="text-xs text-gray-500">{masterVolume}%</span>
                            </div>
                            <Slider
                              id="master-volume"
                              min={0}
                              max={100}
                              step={5}
                              value={[masterVolume]}
                              onValueChange={(value) => {
                                setMasterVolume(value[0]);
                                updateVolume();
                              }}
                              disabled={isMuted}
                              className="w-full"
                            />
                          </div>

                          {/* Audio Track Volume */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="audio-volume" className="text-sm">Background Audio</Label>
                              <span className="text-xs text-gray-500">{audioVolume}%</span>
                            </div>
                            <Slider
                              id="audio-volume"
                              min={0}
                              max={100}
                              step={5}
                              value={[audioVolume]}
                              onValueChange={(value) => {
                                setAudioVolume(value[0]);
                                updateVolume();
                              }}
                              disabled={isMuted}
                              className="w-full"
                            />
                          </div>

                          {/* Volume Mixing Info */}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                              <span>Final Volume:</span>
                              <span>{Math.round((masterVolume * audioVolume) / 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className={isMuted ? "text-red-500" : "text-green-500"}>
                                {isMuted ? "Muted" : "Active"}
                              </span>
                            </div>
                          </div>

                          {/* Quick Volume Presets */}
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Quick Presets</Label>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMasterVolume(25);
                                  setAudioVolume(20);
                                  updateVolume();
                                }}
                                className="text-xs"
                              >
                                Quiet
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMasterVolume(50);
                                  setAudioVolume(30);
                                  updateVolume();
                                }}
                                className="text-xs"
                              >
                                Normal
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMasterVolume(75);
                                  setAudioVolume(50);
                                  updateVolume();
                                }}
                                className="text-xs"
                              >
                                Loud
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Session Notes */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Session Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="study-category">Study Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anatomy">Anatomy</SelectItem>
                        <SelectItem value="physiology">Physiology</SelectItem>
                        <SelectItem value="pathology">Pathology</SelectItem>
                        <SelectItem value="pharmacology">Pharmacology</SelectItem>
                        <SelectItem value="biochemistry">Biochemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-notes">Notes</Label>
                    <Textarea
                      id="session-notes"
                      placeholder="What are you studying today?"
                      value={timerNotes}
                      onChange={(e) => setTimerNotes(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Today</p>
                          <p className="font-medium">{Math.floor(totalTimeStudied / 60)}m</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">Streak</p>
                          <p className="font-medium">5 days</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* My Groups */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Study Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        name: "Anatomy Study Group",
                        members: 8,
                        category: "Anatomy",
                        nextSession: "Today 2:00 PM",
                        isActive: true
                      },
                      {
                        id: 2,
                        name: "USMLE Step 1 Prep",
                        members: 15,
                        category: "General",
                        nextSession: "Tomorrow 10:00 AM",
                        isActive: true
                      },
                      {
                        id: 3,
                        name: "Physiology Discussion",
                        members: 6,
                        category: "Physiology",
                        nextSession: "Friday 3:00 PM",
                        isActive: false
                      }
                    ].map((group) => (
                      <Card key={group.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{group.name}</h4>
                              <Badge variant="secondary">{group.category}</Badge>
                              {group.isActive && (
                                <Badge variant="default" className="bg-green-500">Live</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {group.members} members
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {group.nextSession}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                            <Button size="sm">
                              Join Session
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Group Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Group
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Find Groups
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Group Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Study Sessions</CardTitle>
                <CardDescription>Join ongoing study sessions in your groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      id: 1,
                      group: "Anatomy Study Group",
                      topic: "Cardiovascular System",
                      participants: 5,
                      duration: "45 minutes",
                      isLive: true
                    },
                    {
                      id: 2,
                      group: "USMLE Step 1 Prep",
                      topic: "Practice Questions",
                      participants: 12,
                      duration: "2 hours",
                      isLive: true
                    }
                  ].map((session) => (
                    <Card key={session.id} className="p-4 border-green-200 bg-green-50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="default" className="bg-green-500">LIVE</Badge>
                          <span className="text-xs text-gray-500">{session.duration}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{session.group}</h4>
                          <p className="text-sm text-gray-600">{session.topic}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {session.participants} participants
                          </span>
                          <Button size="sm">Join Now</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books & Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search books and resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingBooks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight line-clamp-2">
                            {book.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Updated: {new Date(book.modifiedTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Size: {formatFileSize(parseInt(book.size))}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleDownload(book.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Study Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studyTips.map((tip) => {
                const IconComponent = getTypeIcon(tip.type);
                return (
                  <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tip.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getDifficultyColor(tip.difficulty)}>
                              {tip.difficulty}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {tip.estimatedTime} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{tip.description}</p>
                      <Badge variant="outline">{tip.category}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Study Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Essential Study Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Memory Techniques</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use active recall and spaced repetition</li>
                      <li>• Create mind maps for complex topics</li>
                      <li>• Use mnemonics for difficult lists</li>
                      <li>• Practice retrieval before reviewing</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Study Organization</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Break study sessions into 25-50 min blocks</li>
                      <li>• Take regular breaks to avoid burnout</li>
                      <li>• Review material multiple times</li>
                      <li>• Test yourself frequently</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Online Resources Tab */}
          <TabsContent value="online" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {onlineResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {resource.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <Button 
                      onClick={() => window.open(resource.url, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Recommended Study Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Textbooks</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Gray's Anatomy for Students</li>
                      <li>• Guyton and Hall Textbook of Medical Physiology</li>
                      <li>• Netter's Atlas of Human Anatomy</li>
                      <li>• BRS Physiology</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Online Platforms</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Osmosis.org - Interactive medical education</li>
                      <li>• Kenhub.com - Anatomy learning platform</li>
                      <li>• TeachMeAnatomy.info - Free anatomy resource</li>
                      <li>• Anki - Spaced repetition flashcards</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}