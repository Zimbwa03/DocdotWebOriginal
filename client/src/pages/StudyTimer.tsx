import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Music, 
  VolumeX, 
  Volume2, 
  Coffee, 
  Brain, 
  Target,
  Trophy,
  Flame,
  Clock,
  Settings,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

// Music tracks for different study environments
const MUSIC_TRACKS = [
  { name: "Lo-Fi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", genre: "Lo-Fi" },
  { name: "Rain Sounds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", genre: "Nature" },
  { name: "Forest Ambience", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", genre: "Nature" },
  { name: "Piano Focus", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", genre: "Classical" },
  { name: "Café Ambience", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", genre: "Ambient" },
];

const MOTIVATIONAL_QUOTES = [
  "Great things never come from comfort zones.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Don't watch the clock; do what it does. Keep going.",
  "Education is the most powerful weapon you can use to change the world.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Study while others are sleeping; work while others are loafing.",
  "Your limitation—it's only your imagination.",
];

export default function StudyTimer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Timer states
  const [studyGoal, setStudyGoal] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(studyGoal * 60);
  const [isPomodoroMode, setIsPomodoroMode] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [totalTimeStudied, setTotalTimeStudied] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(120); // minutes
  const [streakCount, setStreakCount] = useState(0);

  // Music and sound states
  const [isBackgroundMusicOn, setIsBackgroundMusicOn] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [showProgress, setShowProgress] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['/api/note-categories'],
  });

  // Initialize audio and motivational quote
  useEffect(() => {
    // Initialize background music
    audioRef.current = new Audio(MUSIC_TRACKS[currentTrack].url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    // Initialize notification sound
    notificationAudioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIcBjiS2O7Pcz+LJpzS8Nnz+LLI1dnS+6fO1LLVzPK1+rK9z8/OvPawye7t+7C+zLu9");

    // Set initial motivational quote
    setMotivationalQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (notificationAudioRef.current) {
        notificationAudioRef.current.src = "";
      }
    };
  }, []);

  // Update audio track when currentTrack changes
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = MUSIC_TRACKS[currentTrack].url;
      audioRef.current.volume = volume / 100;
      if (wasPlaying && isBackgroundMusicOn) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Reset timer when settings change
  useEffect(() => {
    if (!isRunning) {
      const duration = getCurrentPhaseDuration();
      setTimeLeft(duration * 60);
    }
  }, [studyGoal, shortBreak, longBreak, currentPhase, isRunning]);

  // Timer countdown logic with enhanced features
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handlePhaseComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Functions
  const getCurrentPhaseDuration = () => {
    switch (currentPhase) {
      case 'study': return studyGoal;
      case 'shortBreak': return shortBreak;
      case 'longBreak': return longBreak;
      default: return studyGoal;
    }
  };

  const handlePhaseComplete = () => {
    setIsRunning(false);
    
    // Play notification sound
    if (notificationAudioRef.current) {
      notificationAudioRef.current.play().catch(console.error);
    }

    if (isPomodoroMode) {
      if (currentPhase === 'study') {
        const newCount = pomodoroCount + 1;
        setPomodoroCount(newCount);
        setTotalTimeStudied(prev => prev + studyGoal);
        setStreakCount(prev => prev + 1);

        // Determine next phase
        if (newCount % 4 === 0) {
          setCurrentPhase('longBreak');
          setTimeLeft(longBreak * 60);
          toast({
            title: "Excellent Work!",
            description: `You've completed ${newCount} Pomodoros! Time for a long break.`,
          });
        } else {
          setCurrentPhase('shortBreak');
          setTimeLeft(shortBreak * 60);
          toast({
            title: "Pomodoro Complete!",
            description: `Great focus! Take a short break. Pomodoros: ${newCount}`,
          });
        }
      } else {
        // Break finished
        setCurrentPhase('study');
        setTimeLeft(studyGoal * 60);
        // Set new motivational quote
        setMotivationalQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
        toast({
          title: "Ready to Focus!",
          description: "Break's over! Let's get back to productive studying.",
        });
      }
    } else {
      setTotalTimeStudied(prev => prev + studyGoal);
      setStreakCount(prev => prev + 1);
      toast({
        title: "Session Complete!",
        description: `Excellent! You studied for ${studyGoal} minutes.`,
      });
    }
  };

  // Control functions
  const startTimer = () => {
    setIsRunning(true);
    if (isBackgroundMusicOn && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPomodoroCount(0);
    setCurrentPhase('study');
    const duration = getCurrentPhaseDuration();
    setTimeLeft(duration * 60);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const skipPhase = () => {
    if (isPomodoroMode) {
      handlePhaseComplete();
    } else {
      resetTimer();
    }
  };

  const toggleMusic = () => {
    setIsBackgroundMusicOn(!isBackgroundMusicOn);
    if (!isBackgroundMusicOn) {
      if (isRunning && audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % MUSIC_TRACKS.length);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'study': return <Brain className="w-5 h-5" />;
      case 'shortBreak': return <Coffee className="w-5 h-5" />;
      case 'longBreak': return <Coffee className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'study': return '#3399FF';
      case 'shortBreak': return '#10B981';
      case 'longBreak': return '#8B5CF6';
      default: return '#3399FF';
    }
  };

  const progressPercentage = ((getCurrentPhaseDuration() * 60 - timeLeft) / (getCurrentPhaseDuration() * 60)) * 100;
  const dailyProgressPercentage = (totalTimeStudied / dailyGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Stats */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Study Timer
          </h1>
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Streak: {streakCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Pomodoros: {pomodoroCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Today: {totalTimeStudied}min</span>
            </div>
          </div>
        </div>

        {/* Main Timer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Display */}
          <Card className="lg:col-span-2">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {getPhaseIcon()}
                <CardTitle style={{ color: getPhaseColor() }}>
                  {currentPhase === 'study' ? 'Focus Time' : 
                   currentPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </CardTitle>
              </div>
              {motivationalQuote && (
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{motivationalQuote}"
                </p>
              )}
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Circular Progress Timer */}
              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getPhaseColor()}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 2.827} 283`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor(progressPercentage)}% complete
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={isRunning ? pauseTimer : startTimer}
                  size="lg"
                  className="px-8"
                  style={{ backgroundColor: getPhaseColor() }}
                >
                  {isRunning ? (
                    <><Pause className="w-5 h-5 mr-2" /> Pause</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" /> Start</>
                  )}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" /> Reset
                </Button>
                {isPomodoroMode && (
                  <Button onClick={skipPhase} variant="outline" size="lg">
                    <SkipForward className="w-5 h-5 mr-2" /> Skip
                  </Button>
                )}
              </div>

              {/* Daily Progress */}
              {showProgress && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>Daily Goal Progress</span>
                    <span>{totalTimeStudied}/{dailyGoal} minutes</span>
                  </div>
                  <Progress value={dailyProgressPercentage} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings and Music Panel */}
          <div className="space-y-6">
            {/* Music Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="w-5 h-5" />
                  <span>Background Music</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Music</Label>
                  <Switch checked={isBackgroundMusicOn} onCheckedChange={toggleMusic} />
                </div>
                
                {isBackgroundMusicOn && (
                  <>
                    <div className="space-y-2">
                      <Label>Current Track</Label>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{MUSIC_TRACKS[currentTrack].name}</p>
                          <p className="text-xs text-gray-500">{MUSIC_TRACKS[currentTrack].genre}</p>
                        </div>
                        <Button onClick={nextTrack} variant="outline" size="sm">
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Volume</Label>
                        <Button
                          onClick={() => setIsMuted(!isMuted)}
                          variant="ghost"
                          size="sm"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        max={100}
                        step={5}
                        disabled={isMuted}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timer Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Timer Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pomodoro Mode</Label>
                  <Switch checked={isPomodoroMode} onCheckedChange={setIsPomodoroMode} />
                </div>

                <div className="space-y-2">
                  <Label>Study Duration: {studyGoal} minutes</Label>
                  <Slider
                    value={[studyGoal]}
                    onValueChange={(value) => setStudyGoal(value[0])}
                    min={1}
                    max={120}
                    step={1}
                    disabled={isRunning}
                  />
                </div>

                {isPomodoroMode && (
                  <>
                    <div className="space-y-2">
                      <Label>Short Break: {shortBreak} minutes</Label>
                      <Slider
                        value={[shortBreak]}
                        onValueChange={(value) => setShortBreak(value[0])}
                        min={1}
                        max={30}
                        step={1}
                        disabled={isRunning}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Long Break: {longBreak} minutes</Label>
                      <Slider
                        value={[longBreak]}
                        onValueChange={(value) => setLongBreak(value[0])}
                        min={5}
                        max={60}
                        step={1}
                        disabled={isRunning}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Daily Goal: {dailyGoal} minutes</Label>
                  <Slider
                    value={[dailyGoal]}
                    onValueChange={(value) => setDailyGoal(value[0])}
                    min={30}
                    max={600}
                    step={30}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Study Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Study Session Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Study Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {categories && Array.isArray(categories) && categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes</Label>
              <Textarea
                id="notes"
                placeholder="What are you studying today? Track your progress and thoughts..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}