import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  TrendingUp,
  BarChart3,
  Timer,
  Trophy,
  Target,
  RefreshCw
} from 'lucide-react';

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
  
  // Quiz states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/quiz/categories'],
    enabled: !!user
  });

  // Fetch user analytics
  const { data: analytics, refetch: refetchAnalytics } = useQuery<UserAnalytics>({
    queryKey: [`/api/quiz/analytics/${user?.id}`],
    enabled: !!user && showAnalytics
  });

  // Start quiz mutation
  const startQuizMutation = useMutation({
    mutationFn: async (category: string) => {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category, 
          userId: user?.id,
          questionCount: 10
        })
      });
      if (!response.ok) throw new Error('Failed to start quiz');
      return response.json();
    },
    onSuccess: (data: QuizSession) => {
      setCurrentSession(data);
      setCurrentQuestion(data.currentQuestion);
      setStartTime(Date.now());
      setShowResult(false);
      setLastResult(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Quiz Error",
        description: "Failed to start quiz. Please try again."
      });
    }
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ answer }: { answer: string }) => {
      if (!currentSession || !currentQuestion) throw new Error('No active session');
      
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      const response = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.sessionId,
          userId: user?.id,
          questionId: currentQuestion.id,
          userAnswer: answer,
          timeSpent
        })
      });
      if (!response.ok) throw new Error('Failed to submit answer');
      return response.json();
    },
    onSuccess: (data: QuizResult) => {
      setLastResult(data);
      setShowResult(true);
      
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
      }
      
      if (data.isComplete) {
        toast({
          title: "Quiz Complete!",
          description: `You scored ${data.progress.accuracy}% accuracy`
        });
        refetchAnalytics();
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Submit Error",
        description: "Failed to submit answer. Please try again."
      });
    }
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    startQuizMutation.mutate(category);
  };

  const handleAnswer = (answer: string) => {
    setStartTime(Date.now()); // Reset timer for next question
    submitAnswerMutation.mutate({ answer });
  };

  const handleNextQuestion = () => {
    setShowResult(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentSession(null);
    setCurrentQuestion(null);
    setShowResult(false);
    setLastResult(null);
  };

  // Show analytics view
  if (showAnalytics) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Quiz Analytics</h1>
            <Button onClick={() => setShowAnalytics(false)} variant="outline">
              Back to Quiz
            </Button>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Total Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>{analytics.totalQuestions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Overall Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>{analytics.overallAccuracy}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Categories Attempted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>{analytics.categoriesAttempted}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Sessions Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>{analytics.sessionsCompleted}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {analytics?.categoryPerformance && analytics.categoryPerformance.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 style={{ color: '#3399FF' }} size={24} />
                  <span style={{ color: '#1C1C1C' }}>Category Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryPerformance.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: '#1C1C1C' }}>{category.category}</span>
                        <span style={{ color: '#2E2E2E' }}>{category.accuracy}% ({category.correctAnswers}/{category.questionsAttempted})</span>
                      </div>
                      <Progress value={category.accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show quiz interface
  if (currentSession && currentQuestion) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>{currentSession.category} Quiz</h1>
              <p style={{ color: '#2E2E2E' }}>Question {currentQuestion.questionNumber} of {currentSession.totalQuestions}</p>
            </div>
            <Button onClick={handleBackToCategories} variant="outline">
              Back to Categories
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress 
              value={(currentQuestion.questionNumber / currentSession.totalQuestions) * 100} 
              className="h-3"
            />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: '#1C1C1C' }}>
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showResult ? (
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleAnswer('True')}
                    disabled={submitAnswerMutation.isPending}
                    className="flex-1 h-16 text-lg"
                    style={{ backgroundColor: '#28a745', color: 'white' }}
                  >
                    {submitAnswerMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-6 h-6 mr-2" />}
                    True
                  </Button>
                  <Button
                    onClick={() => handleAnswer('False')}
                    disabled={submitAnswerMutation.isPending}
                    className="flex-1 h-16 text-lg"
                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                  >
                    {submitAnswerMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-6 h-6 mr-2" />}
                    False
                  </Button>
                </div>
              ) : lastResult && (
                <div className="space-y-6">
                  {/* Result indicator */}
                  <div className={`p-4 rounded-lg ${lastResult.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {lastResult.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <span className={`font-semibold ${lastResult.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    {!lastResult.isCorrect && (
                      <p style={{ color: '#2E2E2E' }}>
                        The correct answer is: <strong>{lastResult.correctAnswer}</strong>
                      </p>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>Explanation:</h4>
                      <p style={{ color: '#2E2E2E' }}>{lastResult.explanation}</p>
                    </div>
                    
                    {lastResult.aiExplanation && (
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>Detailed Explanation:</h4>
                        <p style={{ color: '#2E2E2E' }}>{lastResult.aiExplanation}</p>
                      </div>
                    )}

                    {lastResult.references && (
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>References:</h4>
                        <div className="text-sm" style={{ color: '#2E2E2E' }}>
                          {typeof lastResult.references === 'string' ? (
                            <p>{lastResult.references}</p>
                          ) : (
                            <pre className="whitespace-pre-wrap">{JSON.stringify(lastResult.references, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress stats */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold" style={{ color: '#1C1C1C' }}>{lastResult.progress.current}</div>
                      <div className="text-sm" style={{ color: '#2E2E2E' }}>of {lastResult.progress.total}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold" style={{ color: '#1C1C1C' }}>{lastResult.progress.accuracy}%</div>
                      <div className="text-sm" style={{ color: '#2E2E2E' }}>Accuracy</div>
                    </div>
                  </div>

                  {/* Continue button */}
                  {!lastResult.isComplete ? (
                    <Button onClick={handleNextQuestion} className="w-full" style={{ backgroundColor: '#3399FF' }}>
                      Next Question
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Quiz Complete!</h3>
                        <p style={{ color: '#2E2E2E' }}>Final accuracy: {lastResult.progress.accuracy}%</p>
                      </div>
                      <div className="flex space-x-4">
                        <Button onClick={handleBackToCategories} variant="outline" className="flex-1">
                          Try Another Category
                        </Button>
                        <Button onClick={() => setShowAnalytics(true)} className="flex-1" style={{ backgroundColor: '#3399FF' }}>
                          View Analytics
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show category selection
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Medical MCQ Quiz</h1>
          <p className="text-xl mb-4" style={{ color: '#2E2E2E' }}>Test your knowledge with True/False questions</p>
          <div className="flex justify-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800">
              Instant Feedback
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              Detailed Explanations
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              Performance Analytics
            </Badge>
          </div>
        </div>

        {/* Analytics Button */}
        <div className="text-center mb-8">
          <Button 
            onClick={() => setShowAnalytics(true)} 
            variant="outline"
            className="mr-4"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData?.categories?.map((category: QuizCategory) => (
            <Card 
              key={category.name}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-blue-400"
              onClick={() => handleCategorySelect(category.name)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                    <Brain style={{ color: '#3399FF' }} size={32} />
                  </div>
                  <Badge variant="secondary">{category.count} questions</Badge>
                </div>
                <CardTitle className="text-lg" style={{ color: '#1C1C1C' }}>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  size="sm" 
                  className="w-full"
                  style={{ backgroundColor: '#3399FF', color: 'white' }}
                  disabled={startQuizMutation.isPending}
                >
                  {startQuizMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Target className="w-4 h-4 mr-2" />
                  )}
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}