import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  TrendingUp, 
  Star,
  Play,
  Brain,
  FileText,
  Heart,
  Activity,
  Image,
  Zap,
  Calendar,
  Award,
  BarChart3,
  MessageSquare,
  Settings,
  User,
  Search,
  Filter,
  ChevronRight,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Lightbulb,
  Sparkles,
  BookMarked,
  PenTool,
  Globe,
  Download,
  Share2,
  Bell,
  Image as ImageIcon,
  AlertCircle as Alert,
  Eye,
  Timer,
  Bookmark,
  ArrowRight,
  Mic,
  Video,
  Headphones,
  Coffee,
  Moon,
  Sun,
  Flame,
  LineChart,
  PieChart,
  Newspaper,
  Rss,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useState, useEffect } from 'react';
import QuizQuestion from '@/components/quizzes/quiz-question';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert as AlertComponent, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';

// QuizSection Component
function QuizSection() {
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState("5");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizType, setQuizType] = useState<'text' | 'cadaver' | 'histology' | 'image'>('text');
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubcategory, setCurrentSubcategory] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [supabaseQuestions, setSupabaseQuestions] = useState<any[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);

  // Categories and subcategories as specified
  const categories = {
    "Anatomy": [
      "Head and Neck",
      "Upper Limb",
      "Thorax",
      "Lower Limb",
      "Pelvis and Perineum",
      "Neuroanatomy",
      "Abdomen"
    ],
    "Physiology": [
      "Cell",
      "Nerve and Muscle",
      "Blood",
      "Endocrine",
      "Reproductive",
      "Gastrointestinal Tract",
      "Renal",
      "Cardiovascular System",
      "Respiration",
      "Medical Genetics",
      "Neurophysiology"
    ]
  };

  // Mock quiz data for non-text quizzes
  const mockQuizzes = [
    {
      id: 1,
      title: "Head and Neck Cadaver Quiz",
      description: "Identify anatomical structures in cadaver specimens",
      questionCount: 15,
      difficulty: "medium" as const,
      questionType: "cadaver" as const,
      questions: [
        {
          id: 1,
          question: "Identify the highlighted structure in this cadaver image:",
          options: ["Parotid gland", "Submandibular gland", "Thyroid gland", "Lymph node"],
          correctAnswer: "Parotid gland",
          explanation: "The parotid gland is the largest salivary gland.",
          imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
          questionType: "cadaver" as const,
          difficulty: "medium" as const
        }
      ]
    },
    {
      id: 2,
      title: "Thorax Histology Quiz",
      description: "Microscopic anatomy of thoracic structures",
      questionCount: 12,
      difficulty: "hard" as const,
      questionType: "histology" as const,
      questions: [
        {
          id: 2,
          question: "What type of tissue is shown in this histological slide?",
          options: ["Simple squamous epithelium", "Stratified squamous epithelium", "Pseudostratified epithelium", "Transitional epithelium"],
          correctAnswer: "Pseudostratified epithelium",
          explanation: "Pseudostratified ciliated columnar epithelium lines the respiratory tract.",
          imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop",
          questionType: "histology" as const,
          difficulty: "hard" as const
        }
      ]
    }
  ];

  // Fetch questions from local JSON file
  const fetchQuestionsFromJSON = async (category: string) => {
    try {
      setIsLoadingQuestions(true);
      
      const response = await fetch('/docdot-questions.json');
      if (!response.ok) {
        throw new Error('Failed to load questions file');
      }
      
      const data = await response.json();
      
      // Filter questions by category
      const filtered = data.filter((q: any) => q.category === category);
      
      if (filtered.length === 0) {
        toast({
          title: "No questions found",
          description: `No questions available for ${category} category.`,
          variant: "destructive",
        });
        return [];
      }

      // Randomize the questions
      const shuffledQuestions = filtered.sort(() => Math.random() - 0.5);
      return shuffledQuestions.slice(0, 20); // Limit to 20 questions
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions from local file.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const startCategoryQuiz = async (category: string, subcategory: string) => {
    setCurrentCategory(category);
    setCurrentSubcategory(subcategory);
    setActiveQuiz(999); // Special ID for category quiz
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setScore(0);
    setTotalAnswered(0);

    // Fetch questions from local JSON file
    const questions = await fetchQuestionsFromJSON(subcategory);
    
    if (questions.length === 0) {
      toast({
        title: "No questions found",
        description: `No questions available for ${subcategory} category.`,
        variant: "destructive",
      });
      setActiveQuiz(null);
      return;
    }

    // Transform JSON data to match our question format
    const transformedQuestions = questions.map((q: any) => ({
      id: q.id,
      question: q.question || '',
      options: typeof q.answer === 'boolean' ? ['True', 'False'] : (q.options || []),
      correctAnswer: typeof q.answer === 'boolean' ? (q.answer ? 'True' : 'False') : (q.answer || ''),
      explanation: q.explanation || '',
      ai_explanation: q.ai_explanation || '',
      reference_data: q.reference_json ? JSON.stringify(q.reference_json) : '',
      questionType: 'text' as const,
      difficulty: q.difficulty || 'medium' as const
    }));

    setSupabaseQuestions(transformedQuestions);
  };

  const startQuiz = (quizId: number) => {
    setActiveQuiz(quizId);
    setCurrentQuestion(0);
    setSelectedAnswers({});
  };

  const generateQuizWithAI = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for generating quiz questions.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Category required", 
        description: "Please select a category for the quiz.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSubcategory) {
      toast({
        title: "Subcategory required", 
        description: "Please select a subcategory for the quiz.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      toast({
        title: "Quiz generated",
        description: `Successfully generated a ${selectedCategory} - ${selectedSubcategory} quiz about ${aiTopic}.`,
      });
      setAiDialogOpen(false);
      setAiTopic("");
      setSelectedCategory("");
      setSelectedSubcategory("");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Medical Quizzes</h2>
        
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#3399FF' }}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Quiz with AI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="Enter a medical topic..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categories).map((categoryName) => (
                      <SelectItem key={categoryName} value={categoryName}>
                        {categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCategory && (
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[selectedCategory as keyof typeof categories]?.map((subcategoryName) => (
                        <SelectItem key={subcategoryName} value={subcategoryName}>
                          {subcategoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="count">Number of Questions</Label>
                <Select value={aiQuestionCount} onValueChange={setAiQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={generateQuizWithAI}
                disabled={isGenerating}
                className="w-full"
                style={{ backgroundColor: '#3399FF' }}
              >
                {isGenerating ? "Generating..." : "Generate Quiz"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Quiz Display */}
      {activeQuiz && (
        <Card style={{ backgroundColor: '#F7FAFC' }}>
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium" style={{ color: '#1C1C1C' }}>
                {activeQuiz === 999 ? `${currentCategory} - ${currentSubcategory} Quiz` : (mockQuizzes?.find(q => q.id === activeQuiz)?.title || 'Quiz')}
              </h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#D1E8F9', color: '#3399FF' }}>
                Question {currentQuestion + 1} of {activeQuiz === 999 ? supabaseQuestions.length : mockQuizzes.find(q => q.id === activeQuiz)?.questions?.length || 0}
              </span>
            </div>
          </div>
          
          {isLoadingQuestions ? (
            <div className="p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p style={{ color: '#2E2E2E' }}>Loading questions from local database...</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {(() => {
                const currentQuestions = activeQuiz === 999 ? supabaseQuestions : mockQuizzes.find(q => q.id === activeQuiz)?.questions || [];
                const currentQ = currentQuestions[currentQuestion];
                
                if (!currentQ) return null;

                return (
                  <>
                    <QuizQuestion 
                      question={currentQ}
                      selectedAnswer={selectedAnswers[currentQ.id] || ''}
                      onAnswerSelect={(answer) => {
                        setSelectedAnswers(prev => ({
                          ...prev,
                          [currentQ.id]: answer
                        }));

                        // For Supabase questions, show immediate feedback
                        if (activeQuiz === 999) {
                          const isCorrect = answer === currentQ.correctAnswer;
                          setCurrentAnswer({
                            answer: isCorrect ? 'Correct' : 'Incorrect',
                            explanation: currentQ.explanation || 'No explanation available',
                            ai_explanation: currentQ.ai_explanation || 'No AI explanation available',
                            reference_data: currentQ.reference_data || 'No reference data available'
                          });
                          setShowQuizResult(true);
                          
                          if (isCorrect) {
                            setScore(prev => prev + 1);
                          }
                          setTotalAnswered(prev => prev + 1);
                        }
                      }}
                      showExplanation={showQuizResult && activeQuiz === 999}
                    />

                    {/* Answer Feedback for Supabase Questions */}
                    {showQuizResult && currentAnswer && activeQuiz === 999 && (
                      <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: '#F0F8FF', borderColor: '#D1E8F9' }}>
                        <h4 className="font-semibold mb-3" style={{ color: '#1C1C1C' }}>Answer Details:</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium" style={{ color: '#2E2E2E' }}>Result: </span>
                            <span className={currentAnswer.answer === 'Correct' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {currentAnswer.answer}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium" style={{ color: '#2E2E2E' }}>Explanation: </span>
                            <span style={{ color: '#2E2E2E' }}>{currentAnswer.explanation}</span>
                          </div>
                          <div>
                            <span className="font-medium" style={{ color: '#2E2E2E' }}>AI Explanation: </span>
                            <span style={{ color: '#2E2E2E' }}>{currentAnswer.ai_explanation}</span>
                          </div>
                          <div>
                            <span className="font-medium" style={{ color: '#2E2E2E' }}>Reference Data: </span>
                            <span style={{ color: '#2E2E2E' }}>{currentAnswer.reference_data}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentQuestion(prev => prev - 1);
                          setShowQuizResult(false);
                          setCurrentAnswer(null);
                        }}
                        disabled={currentQuestion === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setActiveQuiz(null);
                          setSupabaseQuestions([]);
                          setCurrentAnswer(null);
                          setShowQuizResult(false);
                          setScore(0);
                          setTotalAnswered(0);
                        }}
                        style={{ borderColor: '#dc2626', color: '#dc2626' }}
                      >
                        Exit Quiz
                      </Button>
                      <Button 
                        onClick={() => {
                          if (currentQuestion < currentQuestions.length - 1) {
                            setCurrentQuestion(prev => prev + 1);
                            setShowQuizResult(false);
                            setCurrentAnswer(null);
                          } else {
                            // Quiz completed
                            toast({
                              title: "Quiz Completed!",
                              description: activeQuiz === 999 ? `Final Score: ${score}/${totalAnswered} (${Math.round((score/totalAnswered)*100)}%)` : "You have completed the quiz.",
                            });
                            setActiveQuiz(null);
                            setSupabaseQuestions([]);
                            setShowQuizResult(false);
                            setCurrentAnswer(null);
                            setScore(0);
                            setTotalAnswered(0);
                          }
                        }}
                        disabled={!selectedAnswers[currentQ.id]}
                        style={{ backgroundColor: '#3399FF' }}
                      >
                        {currentQuestion === currentQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {!activeQuiz && (
        <>
          {/* Quiz Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className={`cursor-pointer border-2 transition-all ${quizType === 'text' ? 'border-blue-500' : 'border-gray-200'}`} 
                  onClick={() => setQuizType('text')}>
              <CardContent className="p-4 text-center">
                <FileText className="mx-auto mb-2" style={{ color: '#3399FF' }} size={24} />
                <div className="font-medium" style={{ color: '#1C1C1C' }}>Text-Based</div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Traditional MCQs</div>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer border-2 transition-all ${quizType === 'cadaver' ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => setQuizType('cadaver')}>
              <CardContent className="p-4 text-center">
                <Heart className="mx-auto mb-2" style={{ color: '#3399FF' }} size={24} />
                <div className="font-medium" style={{ color: '#1C1C1C' }}>Cadaver</div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Anatomy specimens</div>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer border-2 transition-all ${quizType === 'histology' ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => setQuizType('histology')}>
              <CardContent className="p-4 text-center">
                <Activity className="mx-auto mb-2" style={{ color: '#3399FF' }} size={24} />
                <div className="font-medium" style={{ color: '#1C1C1C' }}>Histology</div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Microscope slides</div>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer border-2 transition-all ${quizType === 'image' ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => setQuizType('image')}>
              <CardContent className="p-4 text-center">
                <ImageIcon className="mx-auto mb-2" style={{ color: '#3399FF' }} size={24} />
                <div className="font-medium" style={{ color: '#1C1C1C' }}>Image-Based</div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Visual identification</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories and Subcategories Display */}
          {quizType === 'text' ? (
            <div className="space-y-6">
              <h4 className="text-xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Select Category</h4>
              
              {Object.entries(categories).map(([categoryName, subcategories]) => (
                <div key={categoryName} className="space-y-4">
                  <h5 className="text-lg font-semibold" style={{ color: '#1C1C1C' }}>{categoryName}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subcategories.map((subcategory) => (
                      <Card 
                        key={subcategory} 
                        className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300" 
                        style={{ backgroundColor: '#F7FAFC' }}
                        onClick={() => startCategoryQuiz(categoryName, subcategory)}
                      >
                        <CardContent className="p-4">
                          <div className="text-center">
                            <h6 className="font-medium" style={{ color: '#1C1C1C' }}>{subcategory}</h6>
                            <p className="text-sm mt-2" style={{ color: '#2E2E2E' }}>
                              {categoryName} Quiz
                            </p>
                            <div className="mt-3">
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                MCQ Questions
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Available {quizType.charAt(0).toUpperCase() + quizType.slice(1)} Quizzes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockQuizzes
                  .filter(quiz => ['cadaver', 'histology', 'image'].includes(quiz.questionType))
                  .map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow cursor-pointer" style={{ backgroundColor: '#F7FAFC' }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg" style={{ color: '#1C1C1C' }}>{quiz.title}</h5>
                        {quiz.questionType === 'cadaver' && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            Cadaver
                          </span>
                        )}
                        {quiz.questionType === 'histology' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            Histology
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>{quiz.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {quiz.questionCount} questions
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800 capitalize">
                          {quiz.difficulty}
                        </span>
                      </div>
                      <Button 
                        className="w-full"
                        style={{ backgroundColor: '#3399FF' }}
                        onClick={() => startQuiz(quiz.id)}
                      >
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user/${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Study timer state
  const [studyTimer, setStudyTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Quick quiz state
  const [isQuickQuizOpen, setIsQuickQuizOpen] = useState(false);
  const [quickQuizQuestions, setQuickQuizQuestions] = useState<any[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quickQuizScore, setQuickQuizScore] = useState(0);

  // AI chat state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  // Get display name for user
  const getDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `Dr. ${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile?.firstName) {
      return `Dr. ${userProfile.firstName}`;
    }
    if (userProfile?.fullName) {
      return `Dr. ${userProfile.fullName}`;
    }
    return `Dr. ${user?.email?.split('@')[0] || 'User'}`;
  };

  // Timer functions
  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      const interval = setInterval(() => {
        setStudyTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      toast({
        title: "Study Timer Started",
        description: "Focus mode activated. Good luck with your studies!"
      });
    }
  };

  const stopTimer = () => {
    if (isTimerRunning && timerInterval) {
      setIsTimerRunning(false);
      clearInterval(timerInterval);
      setTimerInterval(null);
      toast({
        title: "Study Session Complete",
        description: `Great work! You studied for ${Math.floor(studyTimer / 60)} minutes.`
      });
    }
  };

  const resetTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setIsTimerRunning(false);
    setStudyTimer(0);
    setTimerInterval(null);
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Start quick quiz
  const startQuickQuiz = async () => {
    try {
      const response = await fetch('/docdot-questions.json');
      if (!response.ok) {
        throw new Error('Failed to load questions file');
      }
      
      const data = await response.json();
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 5);
      
      if (shuffled.length > 0) {
        // Transform questions for quick quiz
        const transformedQuestions = shuffled.map((q: any) => ({
          id: q.id,
          question: q.question || '',
          options: typeof q.answer === 'boolean' ? ['True', 'False'] : (q.options || []),
          correctAnswer: typeof q.answer === 'boolean' ? (q.answer ? 'True' : 'False') : (q.answer || ''),
          explanation: q.explanation || '',
          ai_explanation: q.ai_explanation || '',
          reference_data: q.reference_json ? JSON.stringify(q.reference_json) : '',
          questionType: 'text' as const,
          difficulty: q.difficulty || 'medium' as const
        }));
        
        setQuickQuizQuestions(transformedQuestions);
        setCurrentQuizQuestion(0);
        setQuickQuizScore(0);
        setIsQuickQuizOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "No Questions Available",
          description: "Please try again later."
        });
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      toast({
        variant: "destructive",
        title: "Quiz Load Failed",
        description: "Unable to load quiz questions from local file."
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header Section */}
      <div className="px-8 py-12" style={{ backgroundColor: '#D1E8F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1C1C1C' }}>
              Master Medical Knowledge with <span style={{ color: '#3399FF' }}>Docdot</span>
            </h1>
            <p className="text-xl mb-6" style={{ color: '#2E2E2E' }}>
              Interactive quizzes, comprehensive study materials, and AI-powered learning tools for medical students and professionals.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" style={{ backgroundColor: '#3399FF' }}>
                <Play className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline" style={{ borderColor: '#3399FF', color: '#3399FF' }}>
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Courses
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Welcome Section with Personalization */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#1C1C1C' }}>
                Good morning, {getDisplayName()}! 👨‍⚕️
              </h1>
              <p className="text-lg" style={{ color: '#2E2E2E' }}>
                Ready to advance your medical knowledge today?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm" style={{ color: '#2E2E2E' }}>
                  Study streak: {userProfile?.streak || 0} days
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="today">Today's Plan</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Performance Highlights */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>Performance Dashboard</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Last 7 days</Badge>
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card style={{ backgroundColor: '#F7FAFC' }} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>Current Level</p>
                        <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>25</p>
                        <div className="flex items-center mt-2">
                          <Progress value={75} className="w-16 h-2 mr-2" />
                          <span className="text-xs" style={{ color: '#2E2E2E' }}>75% to 26</span>
                        </div>
                      </div>
                      <Trophy className="w-8 h-8" style={{ color: '#3399FF' }} />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">+2 this week</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#F7FAFC' }} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>Overall Accuracy</p>
                        <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>84.7%</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-xs text-green-500">+3.2% improvement</span>
                        </div>
                      </div>
                      <Target className="w-8 h-8" style={{ color: '#3399FF' }} />
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#F7FAFC' }} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>Study Streak</p>
                        <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>12</p>
                        <div className="flex items-center mt-2">
                          <Flame className="w-4 h-4 text-orange-500 mr-1" />
                          <span className="text-xs" style={{ color: '#2E2E2E' }}>days in a row</span>
                        </div>
                      </div>
                      <Zap className="w-8 h-8" style={{ color: '#3399FF' }} />
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#F7FAFC' }} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>Total XP</p>
                        <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>3,847</p>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-xs" style={{ color: '#2E2E2E' }}>+240 today</span>
                        </div>
                      </div>
                      <Award className="w-8 h-8" style={{ color: '#3399FF' }} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Learning Path */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card style={{ backgroundColor: '#F7FAFC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center" style={{ color: '#1C1C1C' }}>
                      <Activity className="w-5 h-5 mr-2" style={{ color: '#3399FF' }} />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          <div>
                            <p className="font-medium text-sm">Anatomy Quiz Completed</p>
                            <p className="text-xs text-gray-600">Cardiovascular System - 9/10 correct</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <BookOpen className="w-5 h-5 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium text-sm">Study Session</p>
                            <p className="text-xs text-gray-600">Pharmacology - 45 minutes</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">4h ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-purple-500 mr-3" />
                          <div>
                            <p className="font-medium text-sm">Achievement Unlocked</p>
                            <p className="text-xs text-gray-600">Anatomy Expert Badge earned</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">1d ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#F7FAFC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between" style={{ color: '#1C1C1C' }}>
                      <div className="flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2" style={{ color: '#3399FF' }} />
                        Personalized Learning Path
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-blue-600">1</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Review Weak Areas</p>
                            <p className="text-xs text-gray-600">Focus on Neuroanatomy</p>
                          </div>
                        </div>
                        <Badge variant="outline">30 min</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-green-600">2</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">New Topic Introduction</p>
                            <p className="text-xs text-gray-600">Histology Basics</p>
                          </div>
                        </div>
                        <Badge variant="outline">45 min</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-purple-600">3</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Practice Quiz</p>
                            <p className="text-xs text-gray-600">Mixed Topics Assessment</p>
                          </div>
                        </div>
                        <Badge variant="outline">20 min</Badge>
                      </div>

                      <Button className="w-full mt-4" style={{ backgroundColor: '#3399FF' }}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="today" className="space-y-6">
            {/* Today's Schedule */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between" style={{ color: '#1C1C1C' }}>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" style={{ color: '#3399FF' }} />
                    Today's Study Schedule
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Session
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: '#1C1C1C' }}>Scheduled Sessions</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                        <Clock className="w-5 h-5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Anatomy Review</p>
                            <Badge variant="secondary">9:00 - 10:30 AM</Badge>
                          </div>
                          <p className="text-sm text-gray-600">Cardiovascular System Deep Dive</p>
                        </div>
                      </div>

                      <div className="flex items-center p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                        <Brain className="w-5 h-5 text-green-500 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Quiz Practice</p>
                            <Badge variant="secondary">2:00 - 2:30 PM</Badge>
                          </div>
                          <p className="text-sm text-gray-600">Physiology Mixed Questions</p>
                        </div>
                      </div>

                      <div className="flex items-center p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                        <Users className="w-5 h-5 text-purple-500 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Study Group</p>
                            <Badge variant="secondary">7:00 - 8:30 PM</Badge>
                          </div>
                          <p className="text-sm text-gray-600">Case Study Discussion</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: '#1C1C1C' }}>Study Goals Today</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-sm">Complete 20 quiz questions</span>
                        </div>
                        <Badge variant="secondary">15/20</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Target className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm">Study for 2 hours</span>
                        </div>
                        <Badge variant="outline">1.3/2.0h</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm">Review 3 topics</span>
                        </div>
                        <Badge variant="outline">1/3</Badge>
                      </div>
                    </div>

                    <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>
                      <Timer className="w-4 h-4 mr-2" />
                      Start Study Timer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Progress Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: '#1C1C1C' }}>
                    <LineChart className="w-5 h-5 mr-2" style={{ color: '#3399FF' }} />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
                    <p style={{ color: '#2E2E2E' }}>Interactive progress charts will appear here</p>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: '#1C1C1C' }}>
                    <PieChart className="w-5 h-5 mr-2" style={{ color: '#3399FF' }} />
                    Subject Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Anatomy</span>
                      <div className="flex items-center">
                        <Progress value={75} className="w-20 h-2 mr-2" />
                        <span className="text-sm">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Physiology</span>
                      <div className="flex items-center">
                        <Progress value={60} className="w-20 h-2 mr-2" />
                        <span className="text-sm">60%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pharmacology</span>
                      <div className="flex items-center">
                        <Progress value={45} className="w-20 h-2 mr-2" />
                        <span className="text-sm">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pathology</span>
                      <div className="flex items-center">
                        <Progress value={30} className="w-20 h-2 mr-2" />
                        <span className="text-sm">30%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* AI-Powered Insights */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#1C1C1C' }}>
                  <Sparkles className="w-5 h-5 mr-2" style={{ color: '#3399FF' }} />
                  AI Learning Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your learning patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: '#1C1C1C' }}>Strengths & Opportunities</h4>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="font-medium text-green-800">Strong Performance</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Excellent grasp of cardiovascular anatomy. Your quiz scores in this area consistently exceed 90%.
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="font-medium text-yellow-800">Focus Area</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Neuroanatomy concepts need attention. Consider reviewing cranial nerves and brain regions.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="font-medium text-blue-800">Study Tip</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Your performance peaks between 9-11 AM. Schedule challenging topics during this time.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium" style={{ color: '#1C1C1C' }}>Recommended Actions</h4>
                    
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Brain className="w-4 h-4 mr-2" />
                        Take Neuroanatomy Focus Quiz
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <Video className="w-4 h-4 mr-2" />
                        Watch Cranial Nerves Video
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Review Brain Atlas
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Join Anatomy Study Group
                      </Button>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <h5 className="font-medium mb-2" style={{ color: '#1C1C1C' }}>Weekly Challenge</h5>
                      <p className="text-sm mb-3" style={{ color: '#2E2E2E' }}>
                        Complete 50 questions on your weak topics to earn the "Improvement Expert" badge.
                      </p>
                      <Progress value={32} className="h-2" />
                      <p className="text-xs mt-1 text-gray-600">16/50 questions completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer" style={{ backgroundColor: '#F7FAFC' }}>
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>Quick Quiz</h3>
              <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>5-minute knowledge check</p>
              <Button size="sm" onClick={startQuickQuiz} style={{ backgroundColor: '#3399FF' }}>
                Start Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" style={{ backgroundColor: '#F7FAFC' }}>
            <CardContent className="p-6 text-center">
              <Timer className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>Study Timer</h3>
              <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>Focus session tracker</p>
              <Button 
                size="sm" 
                onClick={isTimerRunning ? stopTimer : startTimer}
                style={{ backgroundColor: isTimerRunning ? '#ef4444' : '#3399FF' }}
              >
                {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" style={{ backgroundColor: '#F7FAFC' }}>
            <CardContent className="p-6 text-center">
              <Bookmark className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>Saved Resources</h3>
              <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>Your bookmarked content</p>
              <Button size="sm" style={{ backgroundColor: '#3399FF' }}>
                View All
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" style={{ backgroundColor: '#F7FAFC' }}>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>AI Tutor</h3>
              <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>Get instant help</p>
              <Button size="sm" style={{ backgroundColor: '#3399FF' }}>
                Ask Question
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Quiz Dialog */}
      <Dialog open={isQuickQuizOpen} onOpenChange={setIsQuickQuizOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Quick Quiz - Medical Knowledge Check</DialogTitle>
          </DialogHeader>
          {quickQuizQuestions.length > 0 && currentQuizQuestion < quickQuizQuestions.length && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Question {currentQuizQuestion + 1} of {quickQuizQuestions.length}
                </span>
                <span className="text-sm text-gray-600">
                  Score: {quickQuizScore}/{currentQuizQuestion}
                </span>
              </div>
              <QuizQuestion
                question={quickQuizQuestions[currentQuizQuestion]}
                onAnswer={(isCorrect) => {
                  if (isCorrect) setQuickQuizScore(prev => prev + 1);
                  setTimeout(() => {
                    if (currentQuizQuestion + 1 < quickQuizQuestions.length) {
                      setCurrentQuizQuestion(prev => prev + 1);
                    } else {
                      toast({
                        title: "Quiz Complete!",
                        description: `You scored ${quickQuizScore + (isCorrect ? 1 : 0)}/${quickQuizQuestions.length}`
                      });
                      setIsQuickQuizOpen(false);
                    }
                  }, 1500);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Tutor Chat Dialog */}
      <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}>
        <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Medical Tutor</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Ask me anything about medical topics!</p>
                  <p className="text-sm mt-2">I can help with anatomy, physiology, pathology, and more.</p>
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-4">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask your medical question..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && currentMessage.trim()) {
                    setChatMessages(prev => [...prev, { role: 'user', content: currentMessage }]);
                    // Simulate AI response
                    setTimeout(() => {
                      setChatMessages(prev => [...prev, { 
                        role: 'ai', 
                        content: `I understand you're asking about "${currentMessage}". This is a complex medical topic that requires detailed explanation. Would you like me to break it down into specific areas or provide study resources?`
                      }]);
                    }, 1000);
                    setCurrentMessage('');
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (currentMessage.trim()) {
                    setChatMessages(prev => [...prev, { role: 'user', content: currentMessage }]);
                    setTimeout(() => {
                      setChatMessages(prev => [...prev, { 
                        role: 'ai', 
                        content: `I understand you're asking about "${currentMessage}". This is a complex medical topic that requires detailed explanation. Would you like me to break it down into specific areas or provide study resources?`
                      }]);
                    }, 1000);
                    setCurrentMessage('');
                  }
                }}
                style={{ backgroundColor: '#3399FF' }}
              >
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}