import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, SkipForward, Music } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export default function StudyTimer() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['/api/note-categories'],
  });

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    audioRef.current.loop = true;
    
    return () => {
      // Clean up audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Reset timer when goal changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(studyGoal * 60);
    }
  }, [studyGoal, isRunning]);

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
          return prev - 1;
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
  }, [isRunning, isBreak]);

  const handleTimerComplete = () => {
    if (isPomodoroMode) {
      if (isBreak) {
        // Break completed, start work session
        setIsBreak(false);
        setTimeLeft(studyGoal * 60);
        toast({
          title: "Break completed",
          description: "Time to get back to work!",
        });
      } else {
        // Work session completed, start break
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
        
        // Record completed work session
        if (user) {
          recordStudySession();
        }
        
        toast({
          title: "Work session completed",
          description: "Take a short break!",
        });
      }
      setIsRunning(true);
    } else {
      // Regular timer completed
      setIsRunning(false);
      
      if (user) {
        recordStudySession();
      }
      
      toast({
        title: "Study session completed",
        description: "Great job! You've completed your study goal.",
      });
    }
  };

  const recordStudySession = async () => {
    if (!user) return;
    
    try {
      const sessionData = {
        userId: user.id,
        duration: studyGoal,
        categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
        notes: notes || undefined
      };
      
      await apiRequest("POST", "/api/study-sessions", sessionData);
      
      // Update total time studied
      setTotalTimeStudied(prev => prev + studyGoal);
      
    } catch (error) {
      console.error("Failed to record study session:", error);
      toast({
        title: "Error",
        description: "Failed to record your study session.",
        variant: "destructive",
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(studyGoal * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const totalSeconds = isBreak ? breakTime * 60 : studyGoal * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  return (
    <div className="py-12 bg-white dark:bg-dark-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-10">
          <h2 className="text-base text-secondary-600 dark:text-secondary-400 font-semibold tracking-wide uppercase">Study Timer</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Focus and track your study time
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            Use the timer to stay focused and track your study sessions. Set goals and watch your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  {isBreak ? "Break Time" : "Study Timer"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-64 h-64 relative flex items-center justify-center mb-8">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 dark:text-gray-700 stroke-current"
                      strokeWidth="4"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <circle
                      className="text-primary-500 stroke-current progress-ring-circle"
                      strokeWidth="4"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - calculateProgress() / 100)}
                    />
                    <text
                      x="50"
                      y="50"
                      fontSize="16"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill="currentColor"
                      className="text-4xl font-bold"
                    >
                      {formatTime(timeLeft)}
                    </text>
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                  <Button
                    variant={isRunning ? "outline" : "default"}
                    className="col-span-2"
                    onClick={toggleTimer}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> Start
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetTimer}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="goal-slider">{isBreak ? "Break" : "Study"} Duration (minutes)</Label>
                    <span>{isBreak ? breakTime : studyGoal} min</span>
                  </div>
                  <Slider
                    id="goal-slider"
                    min={1}
                    max={60}
                    step={1}
                    value={[isBreak ? breakTime : studyGoal]}
                    onValueChange={(value) => {
                      if (isBreak) {
                        setBreakTime(value[0]);
                      } else {
                        setStudyGoal(value[0]);
                      }
                    }}
                    disabled={isRunning}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between w-full max-w-md">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pomodoro-mode"
                      checked={isPomodoroMode}
                      onCheckedChange={setIsPomodoroMode}
                      disabled={isRunning}
                    />
                    <Label htmlFor="pomodoro-mode">Pomodoro Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="background-music"
                      checked={isBackgroundMusicOn}
                      onCheckedChange={setIsBackgroundMusicOn}
                    />
                    <Label htmlFor="background-music" className="flex items-center">
                      <Music className="h-4 w-4 mr-1" /> Background Music
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  {totalTimeStudied > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total time studied today: {Math.floor(totalTimeStudied / 60)}h {totalTimeStudied % 60}m
                    </p>
                  )}
                </div>
                <div>
                  {isPomodoroMode && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mode: {isBreak ? "Break" : "Work"}
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Study Category</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                    disabled={isRunning}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Session Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="What are you studying today?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                {!user && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Login to save your study sessions and track your progress.
                  </p>
                )}
              </CardFooter>
            </Card>

            <Card className="shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Break complex topics into manageable chunks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Use active recall instead of passive reading</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Take short breaks to maintain focus (Pomodoro technique)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Stay hydrated and maintain proper posture</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}