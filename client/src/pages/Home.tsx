import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertCircle as Alert
} from 'lucide-react';
import { useState, useEffect } from 'react';
import QuizQuestion from '@/components/quizzes/quiz-question';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert as AlertComponent, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

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

  // Fetch questions from Supabase docdot_mcqs table
  const fetchQuestionsFromSupabase = async (category: string) => {
    try {
      setIsLoadingQuestions(true);
      
      const { data, error } = await supabase
        .from('docdot_mcqs')
        .select('*')
        .eq('category', category)
        .order('id');

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Failed to load questions from database.",
          variant: "destructive",
        });
        return [];
      }

      // Randomize the questions
      const shuffledQuestions = data?.sort(() => Math.random() - 0.5) || [];
      return shuffledQuestions.slice(0, 20); // Limit to 20 questions
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to database.",
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

    // Fetch questions from Supabase
    const questions = await fetchQuestionsFromSupabase(subcategory);
    
    if (questions.length === 0) {
      toast({
        title: "No questions found",
        description: `No questions available for ${subcategory} category.`,
        variant: "destructive",
      });
      setActiveQuiz(null);
      return;
    }

    // Transform Supabase data to match our question format
    const transformedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question || q.text || '',
      options: q.options || [],
      correctAnswer: q.correct_answer || q.answer || '',
      explanation: q.explanation || '',
      ai_explanation: q.ai_explanation || '',
      reference_data: q.reference_data || '',
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
                <p style={{ color: '#2E2E2E' }}>Loading questions from database...</p>
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
        <QuizSection />
      </div>
    </div>
  );
}