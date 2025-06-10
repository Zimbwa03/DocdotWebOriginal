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
import { useStudyState } from "@/contexts/StudyStateContext";
import { apiRequest } from "@/lib/queryClient";

const MUSIC_TRACKS = [
  { name: "Focus Music for Reading", url: "https://youtu.be/WPni755-Krg", genre: "Ambient Study", duration: "Extended" },
  { name: "Deep Study Focus Music", url: "https://youtu.be/0NzMAHxWzII", genre: "Focus Music", duration: "Long" },
  { name: "Relaxing Study Music", url: "https://youtu.be/lkkGlVWvkLk", genre: "Relaxing", duration: "Extended" },
  { name: "Music for Concentration", url: "https://youtu.be/SjiSEvh6fJs", genre: "Focus Music", duration: "Extended" },
];

const MOTIVATIONAL_QUOTES = [
  "Great things never come from comfort zones.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Don't watch the clock; do what it does. Keep going.",
  "Education is the most powerful weapon you can use to change the world.",
];

export default function StudyTimer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { timerState, setTimerState } = useStudyState();

  // Local states for UI
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [dailyGoal, setDailyGoal] = useState(120);
  const [isBackgroundMusicOn, setIsBackgroundMusicOn] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['/api/note-categories'],
  });

  // Calculate time left based on current state
  const getCurrentDuration = () => {
    if (timerState.isBreak) {
      return timerState.session % 4 === 0 ? 15 * 60 : 5 * 60; // Long break every 4th session
    }
    return 25 * 60; // Study session
  };

  const timeLeft = (timerState.minutes * 60) + timerState.seconds;
  const totalDuration = getCurrentDuration();
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Initialize motivational quote
  useEffect(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setMotivationalQuote(randomQuote);
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerState.isRunning) {
      timerRef.current = setInterval(() => {
        setTimerState(prevState => {
          let newMinutes = prevState.minutes;
          let newSeconds = prevState.seconds;

          if (newSeconds > 0) {
            newSeconds--;
          } else if (newMinutes > 0) {
            newMinutes--;
            newSeconds = 59;
          } else {
            // Timer finished
            handleTimerComplete();
            return {
              ...prevState,
              isRunning: false,
              minutes: 0,
              seconds: 0
            };
          }

          return {
            ...prevState,
            minutes: newMinutes,
            seconds: newSeconds
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerState.isRunning]);

  const handleTimerComplete = () => {
    // Play notification sound
    if (notificationAudioRef.current) {
      notificationAudioRef.current.play().catch(console.error);
    }

    setTimerState(prevState => {
      if (prevState.isBreak) {
        // Break ended, start new study session
        toast({
          title: "Break Complete!",
          description: "Ready for your next study session?",
        });
        return {
          ...prevState,
          isBreak: false,
          minutes: 25,
          seconds: 0,
          isRunning: false
        };
      } else {
        // Study session ended, start break
        const newSession = prevState.session + 1;
        const isLongBreak = newSession % 4 === 0;
        const breakDuration = isLongBreak ? 15 : 5;
        
        toast({
          title: "Study Session Complete!",
          description: isLongBreak ? "Time for a long break!" : "Time for a short break!",
        });

        return {
          ...prevState,
          isBreak: true,
          session: newSession,
          minutes: breakDuration,
          seconds: 0,
          isRunning: false,
          totalStudyTime: prevState.totalStudyTime + 25
        };
      }
    });
  };

  const startTimer = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setTimerState(prevState => ({ ...prevState, isRunning: true }));
  }, [setTimerState]);

  const pauseTimer = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setTimerState(prevState => ({ ...prevState, isRunning: false }));
  }, [setTimerState]);

  const resetTimer = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setTimerState({
      minutes: 25,
      seconds: 0,
      isRunning: false,
      isBreak: false,
      session: 1,
      totalStudyTime: timerState.totalStudyTime
    });
  }, [setTimerState, timerState.totalStudyTime]);

  const skipToNextPhase = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    handleTimerComplete();
  }, []);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const saveStudySessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      return apiRequest('/api/study-sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Study session saved!",
        description: "Your progress has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
    },
    onError: (error) => {
      console.error('Error saving study session:', error);
      toast({
        title: "Error",
        description: "Failed to save study session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSession = () => {
    if (!user) return;

    const sessionData = {
      userId: user.id,
      duration: 25 - timerState.minutes,
      category: selectedCategory || 'General',
      notes: notes,
      completedAt: new Date().toISOString(),
    };

    saveStudySessionMutation.mutate(sessionData);
  };

  return (
    <div className="space-y-6">
      {/* Main Timer Display */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            {timerState.isBreak ? <Coffee className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
            {timerState.isBreak ? 'Break Time' : 'Study Session'} #{timerState.session}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-6xl font-mono font-bold text-primary">
            {formatTime(timerState.minutes, timerState.seconds)}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!timerState.isRunning ? (
              <Button onClick={startTimer} size="lg" className="px-8">
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} size="lg" className="px-8" variant="secondary">
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
            <Button onClick={skipToNextPhase} variant="outline" size="lg">
              <SkipForward className="w-5 h-5 mr-2" />
              Skip
            </Button>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{timerState.session}</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{timerState.totalStudyTime}</div>
              <div className="text-sm text-muted-foreground">Minutes Studied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round((timerState.totalStudyTime / dailyGoal) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Daily Goal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Notes and Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Study Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Study Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anatomy">Anatomy</SelectItem>
                <SelectItem value="physiology">Physiology</SelectItem>
                <SelectItem value="pathology">Pathology</SelectItem>
                <SelectItem value="pharmacology">Pharmacology</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              placeholder="What are you studying today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {user && (
            <Button 
              onClick={handleSaveSession} 
              disabled={saveStudySessionMutation.isPending}
              className="w-full"
            >
              {saveStudySessionMutation.isPending ? "Saving..." : "Save Session"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Motivational Quote */}
      <Card>
        <CardContent className="pt-6">
          <blockquote className="text-center italic text-muted-foreground">
            "{motivationalQuote}"
          </blockquote>
        </CardContent>
      </Card>

      {/* Background Music */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Study Music
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch
              checked={isBackgroundMusicOn}
              onCheckedChange={setIsBackgroundMusicOn}
            />
            <span>Enable background music</span>
          </div>

          {isBackgroundMusicOn && (
            <div className="space-y-4">
              <Select value={currentTrack.toString()} onValueChange={(value) => setCurrentTrack(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_TRACKS.map((track, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {track.name} - {track.genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{isMuted ? 0 : volume}%</span>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">{MUSIC_TRACKS[currentTrack].name}</p>
                <p className="text-xs text-muted-foreground">
                  {MUSIC_TRACKS[currentTrack].genre} • {MUSIC_TRACKS[currentTrack].duration}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open(MUSIC_TRACKS[currentTrack].url, '_blank')}
                  className="p-0 h-auto"
                >
                  Open in YouTube
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}