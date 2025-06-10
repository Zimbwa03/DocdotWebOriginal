import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyState } from "@/contexts/StudyStateContext";
import { Play, Pause, SkipForward, Volume2, Music } from "lucide-react";

export default function StudyTimer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { timerState, setTimerState } = useStudyState();
  
  const [studyGoal, setStudyGoal] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(studyGoal * 60);
  const [isPomodoroMode, setIsPomodoroMode] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [totalTimeStudied, setTotalTimeStudied] = useState(0);
  const [isBackgroundMusicOn, setIsBackgroundMusicOn] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTrack, setCurrentTrack] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['/api/note-categories'],
  });

  const musicTracks = [
    { name: "Focus Music", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Nature Sounds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "Classical", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  ];

  // Use persistent timer state
  useEffect(() => {
    if (timerState.isRunning !== isRunning) {
      setIsRunning(timerState.isRunning);
    }
    if (timerState.minutes !== Math.floor(timeLeft / 60) || timerState.seconds !== timeLeft % 60) {
      setTimeLeft(timerState.minutes * 60 + timerState.seconds);
    }
  }, [timerState]);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(musicTracks[currentTrack].url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;
    
    return () => {
      // Clean up audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [currentTrack, volume]);

  // Reset timer when goal changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(studyGoal * 60);
      setTimerState(prev => ({
        ...prev,
        minutes: studyGoal,
        seconds: 0
      }));
    }
  }, [studyGoal, isRunning, setTimerState]);

  // Background music control
  useEffect(() => {
    if (audioRef.current) {
      if (isBackgroundMusicOn && isRunning) {
        audioRef.current.play().catch(err => console.error("Error playing audio:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isBackgroundMusicOn, isRunning]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          const newTimeLeft = prev - 1;
          setTimerState(prevState => ({
            ...prevState,
            minutes: Math.floor(newTimeLeft / 60),
            seconds: newTimeLeft % 60
          }));
          return newTimeLeft;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isBreak, setTimerState]);

  const handleTimerComplete = () => {
    if (isPomodoroMode) {
      if (isBreak) {
        // Break completed, start work session
        setIsBreak(false);
        setTimeLeft(studyGoal * 60);
        setTimerState(prev => ({
          ...prev,
          isBreak: false,
          minutes: studyGoal,
          seconds: 0,
          isRunning: false
        }));
        toast({
          title: "Break completed",
          description: "Time to get back to work!",
        });
      } else {
        // Work session completed, start break
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
        setTotalTimeStudied(prev => prev + studyGoal);
        setTimerState(prev => ({
          ...prev,
          isBreak: true,
          minutes: breakTime,
          seconds: 0,
          isRunning: false,
          session: prev.session + 1,
          totalStudyTime: prev.totalStudyTime + studyGoal
        }));
        toast({
          title: "Work session completed",
          description: "Time for a break!",
        });
      }
    } else {
      // Single session mode
      setTotalTimeStudied(prev => prev + studyGoal);
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        session: prev.session + 1,
        totalStudyTime: prev.totalStudyTime + studyGoal
      }));
      toast({
        title: "Study session completed",
        description: `Great job! You studied for ${studyGoal} minutes.`,
      });
    }
    setIsRunning(false);
  };

  const startTimer = () => {
    setIsRunning(true);
    setTimerState(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setTimerState(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setIsRunning(false);
    const resetTime = isBreak ? breakTime * 60 : studyGoal * 60;
    setTimeLeft(resetTime);
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      minutes: isBreak ? breakTime : studyGoal,
      seconds: 0
    }));
  };

  const skipSession = () => {
    if (isPomodoroMode) {
      handleTimerComplete();
    } else {
      resetTimer();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((isBreak ? breakTime * 60 : studyGoal * 60) - timeLeft) / (isBreak ? breakTime * 60 : studyGoal * 60) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Timer</h1>
          <p className="text-gray-600">Stay focused with the Pomodoro Technique</p>
        </div>

        {/* Main Timer Card */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isBreak ? "Break Time" : "Study Session"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div className="text-8xl font-mono font-bold text-indigo-600 mb-4">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="w-full h-3" />
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg" className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseTimer} size="lg" variant="secondary" className="px-8">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={resetTimer} variant="outline" size="lg">
                Reset
              </Button>
              {isPomodoroMode && (
                <Button onClick={skipSession} variant="outline" size="lg">
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timer Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Study Duration (minutes)</Label>
                <Slider
                  value={[studyGoal]}
                  onValueChange={(value) => setStudyGoal(value[0])}
                  max={60}
                  min={5}
                  step={5}
                  className="mt-2"
                />
                <div className="text-sm text-gray-500 mt-1">{studyGoal} minutes</div>
              </div>

              {isPomodoroMode && (
                <div>
                  <Label>Break Duration (minutes)</Label>
                  <Slider
                    value={[breakTime]}
                    onValueChange={(value) => setBreakTime(value[0])}
                    max={30}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">{breakTime} minutes</div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={isPomodoroMode}
                  onCheckedChange={setIsPomodoroMode}
                />
                <Label>Pomodoro Mode</Label>
              </div>
            </CardContent>
          </Card>

          {/* Background Music */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Music className="w-5 h-5 mr-2" />
                Background Music
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isBackgroundMusicOn}
                  onCheckedChange={setIsBackgroundMusicOn}
                />
                <Label>Enable music</Label>
              </div>

              {isBackgroundMusicOn && (
                <>
                  <div>
                    <Label>Music Track</Label>
                    <Select value={currentTrack.toString()} onValueChange={(value) => setCurrentTrack(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {musicTracks.map((track, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {track.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Volume2 className="w-4 h-4" />
                      <Label>Volume</Label>
                    </div>
                    <Slider
                      value={[volume]}
                      onValueChange={(value) => setVolume(value[0])}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <div className="text-sm text-gray-500 mt-1">{volume}%</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Study Session Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Study Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Category</Label>
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
              <Label>Session Notes</Label>
              <Textarea
                placeholder="What are you studying today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-600">
              Total time studied today: {Math.round(totalTimeStudied)} minutes
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}