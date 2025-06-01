import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Brain, CheckCircle, XCircle, RotateCcw, TrendingUp, FileText, Image, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface QuizCategory {
  name: string;
  count: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  questionNumber: number;
}

interface QuizSession {
  sessionId: string;
  category: string;
  totalQuestions: number;
  currentQuestion: QuizQuestion;
}

interface QuizResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  aiExplanation?: string;
  references?: any;
  isComplete: boolean;
  nextQuestion?: QuizQuestion;
  progress: {
    current: number;
    total: number;
    accuracy: number;
  };
}

interface UserAnalytics {
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
  categoriesAttempted: number;
  sessionsCompleted: number;
  categoryPerformance: Array<{
    category: string;
    accuracy: number;
    questionsAttempted: number;
    correctAnswers: number;
  }>;
  recentSessions: Array<{
    sessionId: string;
    category: string;
    accuracy: number;
    questionsAnswered: number;
    completedAt: string;
  }>;
}

export default function Quiz() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Original quiz states
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("14:32");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState("5");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // MCQ quiz states
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMCQSection, setShowMCQSection] = useState(false);

  // Original quiz queries
  const { data: quizzes = [], isLoading: loadingQuizzes, error: quizzesError } = useQuery({
    queryKey: ['/api/quizzes'],
  });
  
  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: [`/api/quiz-questions/${activeQuiz}`],
    enabled: !!activeQuiz
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/note-categories']
  });

  // MCQ quiz queries
  const { data: mcqCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ['/api/quiz/categories'],
    enabled: showMCQSection
  });

  const { data: userAnalytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['/api/quiz/analytics', user?.id],
    enabled: !!user && showMCQSection
  });

  // MCQ quiz mutations
  const startQuizMutation = useMutation({
    mutationFn: async (data: { category: string; questionCount: number }) => {
      const response = await apiRequest("POST", "/api/quiz/start", {
        ...data,
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: (data: QuizSession) => {
      setCurrentSession(data);
      setCurrentAnswer("");
      setShowResult(false);
      setLastResult(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive",
      });
    }
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { sessionId: string; answer: string }) => {
      const response = await apiRequest("POST", "/api/quiz/submit", {
        ...data,
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: (data: QuizResult) => {
      setLastResult(data);
      setShowResult(true);
      setCurrentAnswer("");
      
      if (data.isComplete) {
        queryClient.invalidateQueries({ queryKey: ['/api/quiz/analytics'] });
        setTimeout(() => {
          setCurrentSession(null);
          setShowResult(false);
          setLastResult(null);
        }, 3000);
      } else if (data.nextQuestion) {
        setCurrentSession(prev => prev ? {
          ...prev,
          currentQuestion: data.nextQuestion!
        } : null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Original quiz functions
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleEndQuiz = async () => {
    if (!user || !activeQuiz || !questions) return;
    
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          quizId: activeQuiz,
          score,
          totalQuestions: questions.length,
          timeTaken: 900
        }),
      });
      
      setActiveQuiz(null);
      setCurrentQuestion(0);
      setSelectedAnswers({});
    } catch (error) {
      console.error('Failed to submit quiz attempt:', error);
    }
  };

  // MCQ quiz functions
  const handleStartMCQQuiz = (category: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to take quizzes.",
        variant: "destructive",
      });
      return;
    }
    
    startQuizMutation.mutate({ category, questionCount: 10 });
  };

  const handleSubmitAnswer = () => {
    if (!currentSession || !currentAnswer.trim()) return;
    
    setIsSubmitting(true);
    submitAnswerMutation.mutate({
      sessionId: currentSession.sessionId,
      answer: currentAnswer.toLowerCase()
    });
    setIsSubmitting(false);
  };

  const handleNextMCQQuestion = () => {
    setShowResult(false);
    setLastResult(null);
    setCurrentAnswer("");
  };

  if (activeQuiz && questions) {
    // Original quiz interface
    return (
      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {quizzes?.find(q => q.id === activeQuiz)?.title || 'Quiz'}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-white dark:bg-gray-800">
              {loadingQuestions ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {questions[currentQuestion]?.question}
                  </h4>
                  <div className="space-y-2">
                    {questions[currentQuestion]?.options?.map((option: string, index: number) => (
                      <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name={`question-${questions[currentQuestion].id}`}
                          value={option}
                          checked={selectedAnswers[questions[currentQuestion].id] === option}
                          onChange={() => handleAnswerSelect(questions[currentQuestion].id, option)}
                          className="text-blue-600"
                        />
                        <span className="text-gray-900 dark:text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button 
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Time remaining</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{timeRemaining}</div>
                </div>
                <div>
                  <Button 
                    variant="secondary" 
                    onClick={handleEndQuiz}
                  >
                    End Quiz
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (currentSession && showMCQSection) {
    // MCQ quiz interface
    return (
      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentSession.category} Quiz
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Question {currentSession.currentQuestion.questionNumber} of {currentSession.totalQuestions}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentSession(null);
                    setShowResult(false);
                    setLastResult(null);
                  }}
                >
                  Exit Quiz
                </Button>
              </div>
              
              <Progress 
                value={(currentSession.currentQuestion.questionNumber / currentSession.totalQuestions) * 100} 
                className="w-full"
              />
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {currentSession.currentQuestion.question}
                </h4>
                
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <Button
                      variant={currentAnswer === "true" ? "default" : "outline"}
                      onClick={() => setCurrentAnswer("true")}
                      disabled={showResult}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      True
                    </Button>
                    <Button
                      variant={currentAnswer === "false" ? "default" : "outline"}
                      onClick={() => setCurrentAnswer("false")}
                      disabled={showResult}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      False
                    </Button>
                  </div>
                </div>
              </div>
              
              {!showResult && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                  </Button>
                </div>
              )}
              
              {showResult && lastResult && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center mb-3">
                    {lastResult.isCorrect ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Incorrect</span>
                      </div>
                    )}
                    <Badge variant="secondary" className="ml-auto">
                      Accuracy: {lastResult.progress.accuracy}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correct Answer: {lastResult.correctAnswer}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lastResult.explanation}
                      </p>
                    </div>
                    
                    {lastResult.aiExplanation && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Detailed Explanation:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lastResult.aiExplanation}
                        </p>
                      </div>
                    )}
                    
                    {lastResult.references && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          References:
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {Object.entries(JSON.parse(lastResult.references)).map(([book, chapter]) => (
                            <p key={book}>{book}: {chapter}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!lastResult.isComplete && (
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handleNextMCQQuestion}>
                        Next Question
                      </Button>
                    </div>
                  )}
                  
                  {lastResult.isComplete && (
                    <div className="mt-4 text-center">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Quiz Complete! Final Accuracy: {lastResult.progress.accuracy}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main quiz selection interface
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Test Your Knowledge</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Comprehensive Quizzes
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            Challenge yourself with thousands of MCQs, image-based questions, and timed exams.
          </p>
        </div>

        <div className="mt-10">
          {/* Toggle between original and MCQ sections */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <Button
                variant={!showMCQSection ? "default" : "outline"}
                onClick={() => setShowMCQSection(false)}
              >
                Topic Quizzes
              </Button>
              <Button
                variant={showMCQSection ? "default" : "outline"}
                onClick={() => setShowMCQSection(true)}
              >
                MCQ Questions
              </Button>
            </div>
          </div>

          {!showMCQSection ? (
            /* Original quiz interface */
            <>
              {loadingQuizzes ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                  </div>
                </div>
              ) : quizzesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load quizzes. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                    <Card className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                                Topic Quizzes
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                  {quizzes?.length || 0}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <div className="text-sm">
                          <Button variant="link" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 p-0">
                            Browse topics →
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                            <Image className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                                Image Quizzes
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                  20+
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <div className="text-sm">
                          <Button variant="link" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 p-0">
                            Practice with images →
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                                Timed Exams
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                  12
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <div className="text-sm">
                          <Button variant="link" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 p-0">
                            Test yourself →
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  {quizzes && quizzes.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Available Quizzes</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {quizzes.map((quiz: any) => (
                          <Card key={quiz.id} className="bg-white dark:bg-gray-800 shadow">
                            <div className="p-4">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{quiz.title}</h4>
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{quiz.description}</p>
                              <div className="mt-4">
                                <Button
                                  onClick={() => setActiveQuiz(quiz.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Start Quiz
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* MCQ Questions section */
            <div className="space-y-8">
              {/* User Analytics */}
              {user && userAnalytics && (
                <Card className="bg-white dark:bg-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{userAnalytics.totalQuestions}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Questions Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{userAnalytics.overallAccuracy}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Overall Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{userAnalytics.categoriesAttempted}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Categories Attempted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{userAnalytics.sessionsCompleted}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Quizzes Completed</div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* MCQ Categories */}
              {loadingCategories ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : mcqCategories?.categories ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medical MCQ Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mcqCategories.categories.map((category: QuizCategory) => (
                      <Card key={category.name} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                            <Badge variant="secondary">{category.count} questions</Badge>
                          </div>
                          <Button
                            onClick={() => handleStartMCQQuiz(category.name)}
                            disabled={startQuizMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {startQuizMutation.isPending ? "Starting..." : "Start Quiz"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No MCQ categories available at the moment.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}