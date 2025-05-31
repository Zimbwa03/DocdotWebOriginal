import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Stethoscope, 
  BookOpen, 
  Brain, 
  Calendar, 
  Trophy, 
  Zap, 
  Target,
  LogOut,
  Play,
  BookOpenCheck,
  Bot,
  CreditCard,
  User,
  Settings,
  BarChart3,
  Users,
  Menu,
  X,
  MessageSquare,
  FileText,
  Clock,
  Heart,
  Activity,
  Plus,
  Bell,
  Image,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import QuizQuestion from '@/components/quizzes/quiz-question';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

// QuizSection Component
function QuizSection() {
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("14:32");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
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

  // Sample quizzes for demonstration
  const mockQuizzes = [
    {
      id: 1,
      title: "Head and Neck Cadaver Quiz",
      description: "Identify anatomical structures in head and neck cadaver specimens",
      questionCount: 15,
      difficulty: "medium",
      questionType: "cadaver" as const,
      category: "Anatomy",
      subcategory: "Head and Neck"
    },
    {
      id: 2,
      title: "Thorax Histology Quiz", 
      description: "Identify tissues and cellular structures in thoracic specimens",
      questionCount: 20,
      difficulty: "hard" as const,
      questionType: "histology" as const,
      category: "Anatomy",
      subcategory: "Thorax"
    },
    {
      id: 3,
      title: "Cardiovascular System Quiz",
      description: "Comprehensive cardiovascular physiology assessment", 
      questionCount: 25,
      difficulty: "easy" as const,
      questionType: "text" as const,
      category: "Physiology",
      subcategory: "Cardiovascular System"
    },
    {
      id: 4,
      title: "Respiratory Physiology Quiz",
      description: "Test your knowledge of respiratory system functions",
      questionCount: 18,
      difficulty: "medium" as const,
      questionType: "text" as const,
      category: "Physiology", 
      subcategory: "Respiration"
    },
    {
      id: 5,
      title: "Upper Limb Anatomy Quiz",
      description: "Identify muscles, bones, and nerves of the upper limb",
      questionCount: 22,
      difficulty: "medium" as const,
      questionType: "cadaver" as const,
      category: "Anatomy",
      subcategory: "Upper Limb"
    },
    {
      id: 6,
      title: "Neuroanatomy Histology Quiz",
      description: "Microscopic examination of nervous system tissues",
      questionCount: 16,
      difficulty: "hard" as const,
      questionType: "histology" as const,
      category: "Anatomy",
      subcategory: "Neuroanatomy"
    }
  ];

  const mockQuestions = [
    {
      id: 1,
      question: "Identify the structure pointed to by the arrow in this cadaver specimen:",
      options: ["Left ventricle", "Right atrium", "Aortic arch", "Pulmonary trunk"],
      correctAnswer: "Aortic arch",
      explanation: "The aortic arch is the curved portion of the aorta that gives rise to the major vessels supplying the head, neck, and upper extremities.",
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      questionType: "cadaver" as const,
      difficulty: "medium" as const
    },
    {
      id: 2,
      question: "What type of tissue is shown in this histological section?",
      options: ["Simple squamous epithelium", "Stratified squamous epithelium", "Simple columnar epithelium", "Pseudostratified columnar epithelium"],
      correctAnswer: "Stratified squamous epithelium",
      explanation: "Stratified squamous epithelium consists of multiple layers of flattened cells and is found in areas subject to wear and tear, such as the skin and oral cavity.",
      imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop",
      questionType: "histology" as const,
      difficulty: "hard" as const
    }
  ];

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (mockQuestions && currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleEndQuiz = async () => {
    if (!activeQuiz || !mockQuestions) return;
    
    let score = 0;
    mockQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    
    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}/${mockQuestions.length} (${Math.round((score / mockQuestions.length) * 100)}%)`,
    });
    
    setActiveQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
  };

  const startQuiz = (quizId: number) => {
    setActiveQuiz(quizId);
    setCurrentQuestion(0);
    setSelectedAnswers({});
  };

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
        <div>
          <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Medical Quizzes</h3>
          <p className="text-lg mt-2" style={{ color: '#2E2E2E' }}>Test your knowledge with comprehensive medical quizzes</p>
        </div>
        
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#3399FF' }}>
              <Plus size={20} className="mr-2" />
              Generate AI Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Quiz with AI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Cardiovascular System"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedSubcategory(""); // Reset subcategory when category changes
                }}>
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

      {activeQuiz && mockQuestions ? (
        <Card style={{ backgroundColor: '#F7FAFC' }}>
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium" style={{ color: '#1C1C1C' }}>
                {mockQuizzes?.find(q => q.id === activeQuiz)?.title || 'Quiz'}
              </h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#D1E8F9', color: '#3399FF' }}>
                Question {currentQuestion + 1} of {mockQuestions.length}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <QuizQuestion 
              question={mockQuestions[currentQuestion]}
              selectedAnswer={selectedAnswers[mockQuestions[currentQuestion].id] || ''}
              onAnswerSelect={(answer) => handleAnswerSelect(mockQuestions[currentQuestion].id, answer)}
            />
            
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
                disabled={currentQuestion === mockQuestions.length - 1}
                style={{ backgroundColor: '#3399FF' }}
              >
                Next
              </Button>
            </div>
          </div>
          
          <div className="p-6 border-t" style={{ backgroundColor: '#F7FAFC' }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Time remaining</div>
                <div className="text-lg font-medium" style={{ color: '#1C1C1C' }}>{timeRemaining}</div>
              </div>
              <Button 
                variant="secondary" 
                onClick={handleEndQuiz}
              >
                End Quiz
              </Button>
            </div>
          </div>
        </Card>
      ) : (
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
                <Image className="mx-auto mb-2" style={{ color: '#3399FF' }} size={24} />
                <div className="font-medium" style={{ color: '#1C1C1C' }}>Image-Based</div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Medical imaging</div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                    <FileText style={{ color: '#3399FF' }} size={24} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm" style={{ color: '#2E2E2E' }}>Topic Quizzes</div>
                    <div className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>
                      {mockQuizzes.filter(q => q.questionType === 'text').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                    <Image style={{ color: '#3399FF' }} size={24} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm" style={{ color: '#2E2E2E' }}>Image Quizzes</div>
                    <div className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>
                      {mockQuizzes.filter(q => ['cadaver', 'histology', 'image'].includes(q.questionType)).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                    <Clock style={{ color: '#3399FF' }} size={24} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm" style={{ color: '#2E2E2E' }}>Timed Exams</div>
                    <div className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>12</div>
                  </div>
                </div>
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
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setLocation('/');
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock user stats - in production these would come from database
  const userStats = {
    xp: 2450,
    level: 12,
    streak: 7,
    subscriptionTier: 'free', // free, starter, premium
    quizzesCompleted: 24,
    averageScore: 85,
    rank: 156,
    studyTime: 42
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Premium</Badge>;
      case 'starter':
        return <Badge style={{ backgroundColor: '#3399FF', color: 'white' }}>Starter</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const navigationItems = [
    { name: 'Quiz', section: 'quiz', icon: Play },
    { name: 'Notes', section: 'notes', icon: BookOpenCheck },
    { name: 'Study Guide', section: 'study-guide', icon: Calendar },
    { name: 'AI Tools', section: 'ai-tools', icon: Bot },
    { name: 'Ask AI', section: 'ask-ai', icon: MessageSquare },
    { name: 'Leaderboard', section: 'leaderboard', icon: Trophy },
  ];

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7FAFC' }}>
      {/* Enhanced Navigation Header */}
      <nav style={{ backgroundColor: '#D1E8F9' }} className="shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                <Stethoscope className="text-white" size={20} />
              </div>
              <span className="ml-3 text-2xl font-bold" style={{ color: '#1C1C1C' }}>Docdot</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.section;
                return (
                  <button 
                    key={item.name} 
                    onClick={() => handleNavClick(item.section)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white hover:bg-opacity-50 ${
                      isActive ? 'bg-white bg-opacity-30' : ''
                    }`} 
                    style={{ color: isActive ? '#3399FF' : '#2E2E2E' }}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {getTierBadge(userStats.subscriptionTier)}
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                      <User size={16} style={{ color: '#3399FF' }} />
                    </div>
                    <span style={{ color: '#2E2E2E' }}>{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <Link href="/pricing">
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Upgrade Plan</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200" style={{ backgroundColor: '#D1E8F9' }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.section;
                return (
                  <button 
                    key={item.name} 
                    onClick={() => handleNavClick(item.section)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-white hover:bg-opacity-50 ${
                      isActive ? 'bg-white bg-opacity-30' : ''
                    }`} 
                    style={{ color: isActive ? '#3399FF' : '#2E2E2E' }}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl border-0 rounded-xl overflow-hidden">
          <CardContent className="p-8">
            {/* User Profile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                  <span className="text-white font-semibold text-xl">
                    {getInitials(getUserDisplayName())}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>{getUserDisplayName()}</h2>
                  <p style={{ color: '#2E2E2E' }}>{user?.email}</p>
                  <div className="mt-2">
                    {getTierBadge(userStats.subscriptionTier)}
                  </div>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#D1E8F9' }}>
                <div className="text-3xl font-bold" style={{ color: '#3399FF' }}>
                  {userStats.quizzesCompleted}
                </div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Quizzes</div>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#D1E8F9' }}>
                <div className="text-3xl font-bold" style={{ color: '#3399FF' }}>
                  {userStats.averageScore}%
                </div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Avg Score</div>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#D1E8F9' }}>
                <div className="text-3xl font-bold" style={{ color: '#3399FF' }}>
                  {userStats.streak}
                </div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Day Streak</div>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#D1E8F9' }}>
                <div className="text-3xl font-bold" style={{ color: '#3399FF' }}>
                  #{userStats.rank}
                </div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>Ranking</div>
              </div>
            </div>

            {/* Dynamic Section Content */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Welcome to Docdot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F7FAFC' }} onClick={() => setActiveSection('quiz')}>
                    <div className="flex items-center space-x-3 mb-3">
                      <Play style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Take Quiz</h4>
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Test your knowledge with medical quizzes</p>
                  </div>
                  
                  <div className="p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F7FAFC' }} onClick={() => setActiveSection('notes')}>
                    <div className="flex items-center space-x-3 mb-3">
                      <BookOpenCheck style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Study Notes</h4>
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Browse topic notes by category</p>
                  </div>
                  
                  <div className="p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F7FAFC' }} onClick={() => setActiveSection('study-guide')}>
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Study Guide</h4>
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Interactive study planner with calendar</p>
                  </div>
                  
                  <div className="p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F7FAFC' }} onClick={() => setActiveSection('ai-tools')}>
                    <div className="flex items-center space-x-3 mb-3">
                      <Bot style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>AI Tools</h4>
                      {userStats.subscriptionTier === 'free' && (
                        <Badge variant="outline" className="text-xs">Premium</Badge>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Flashcards & Mnemonics Generator</p>
                  </div>
                  
                  <div className="p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F7FAFC' }} onClick={() => setActiveSection('ask-ai')}>
                    <div className="flex items-center space-x-3 mb-3">
                      <MessageSquare style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Ask AI</h4>
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Chat with AI tutor for explanations</p>
                  </div>
                  
                  <div className="p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F7FAFC' }} onClick={() => setActiveSection('leaderboard')}>
                    <div className="flex items-center space-x-3 mb-3">
                      <Trophy style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Leaderboard</h4>
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Compare your progress with peers</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#1C1C1C' }}>Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                          <Brain style={{ color: '#3399FF' }} size={16} />
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#1C1C1C' }}>Cardiology Quiz</div>
                          <div className="text-sm" style={{ color: '#2E2E2E' }}>Completed 2 hours ago</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold" style={{ color: '#3399FF' }}>85%</div>
                        <div className="text-sm" style={{ color: '#2E2E2E' }}>15 questions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'ai-tools' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>AI Tools</h3>
                  {userStats.subscriptionTier === 'free' && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Premium Feature</Badge>
                  )}
                </div>
                
                {userStats.subscriptionTier === 'free' ? (
                  <div className="p-8 rounded-xl border-2 border-dashed border-gray-300 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                      <Bot style={{ color: '#3399FF' }} size={32} />
                    </div>
                    <h4 className="text-lg font-semibold mb-2" style={{ color: '#1C1C1C' }}>Upgrade to Premium</h4>
                    <p className="mb-4" style={{ color: '#2E2E2E' }}>
                      Access AI-powered flashcard generation and mnemonics assistance with Premium
                    </p>
                    <Button style={{ backgroundColor: '#3399FF' }}>
                      Upgrade Now
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                          <CreditCard style={{ color: '#3399FF' }} size={24} />
                        </div>
                        <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Flashcard Generator</h4>
                      </div>
                      <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>
                        AI converts your notes and questions into Q&A flashcard format
                      </p>
                      <div className="space-y-3">
                        <textarea 
                          placeholder="Paste your notes or topic here..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                        />
                        <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>
                          Generate Flashcards
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                          <Brain style={{ color: '#3399FF' }} size={24} />
                        </div>
                        <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Mnemonics Assistant</h4>
                      </div>
                      <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>
                        AI suggests custom mnemonics for tough medical topics
                      </p>
                      <div className="space-y-3">
                        <input 
                          type="text"
                          placeholder="Enter topic (e.g., cranial nerves)"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>
                          Create Mnemonic
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {userStats.subscriptionTier !== 'free' && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4" style={{ color: '#1C1C1C' }}>Recent AI Generations</h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium" style={{ color: '#1C1C1C' }}>Cranial Nerves Flashcards</div>
                            <div className="text-sm" style={{ color: '#2E2E2E' }}>Generated 12 flashcards • 2 hours ago</div>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium" style={{ color: '#1C1C1C' }}>Heart Chambers Mnemonic</div>
                            <div className="text-sm" style={{ color: '#2E2E2E' }}>Created mnemonic • Yesterday</div>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'quiz' && (
              <QuizSection />
            )}

            {activeSection === 'notes' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Study Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Anatomy Notes</h4>
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Comprehensive anatomy study materials</p>
                  </div>
                  <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText style={{ color: '#3399FF' }} size={24} />
                      <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Physiology Notes</h4>
                    </div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Body systems and functions</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'study-guide' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Study Guide & Planner</h3>
                  <Button style={{ backgroundColor: '#3399FF' }}>
                    <Plus size={16} className="mr-2" />
                    Add Study Session
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                      <h4 className="font-semibold mb-4" style={{ color: '#1C1C1C' }}>Weekly Study Calendar</h4>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-sm font-medium p-2" style={{ color: '#2E2E2E' }}>
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }, (_, i) => {
                          const day = i - 6;
                          const isToday = day === 15;
                          const hasSession = [12, 15, 18, 22].includes(day);
                          return (
                            <div
                              key={i}
                              className={`h-12 p-1 rounded cursor-pointer transition-colors ${
                                isToday ? 'bg-blue-500 text-white' : 
                                hasSession ? 'bg-blue-100' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className="text-sm">{day > 0 && day <= 31 ? day : ''}</div>
                              {hasSession && !isToday && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                      <h4 className="font-semibold mb-3" style={{ color: '#1C1C1C' }}>Today's Schedule</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                          <Clock style={{ color: '#3399FF' }} size={16} />
                          <div>
                            <div className="font-medium text-sm" style={{ color: '#1C1C1C' }}>Cardiology Review</div>
                            <div className="text-xs" style={{ color: '#2E2E2E' }}>9:00 AM - 10:30 AM</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                          <Clock style={{ color: '#3399FF' }} size={16} />
                          <div>
                            <div className="font-medium text-sm" style={{ color: '#1C1C1C' }}>Anatomy Quiz</div>
                            <div className="text-xs" style={{ color: '#2E2E2E' }}>2:00 PM - 3:00 PM</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                      <h4 className="font-semibold mb-3" style={{ color: '#1C1C1C' }}>Study Progress</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: '#2E2E2E' }}>This Week</span>
                            <span style={{ color: '#2E2E2E' }}>12/15 hours</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ backgroundColor: '#3399FF', width: '80%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: '#2E2E2E' }}>Monthly Goal</span>
                            <span style={{ color: '#2E2E2E' }}>45/60 hours</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ backgroundColor: '#3399FF', width: '75%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#1C1C1C' }}>Upcoming Study Sessions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium" style={{ color: '#1C1C1C' }}>Physiology Deep Dive</h5>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Tomorrow</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#2E2E2E' }}>Cardiovascular System - 2 hours</p>
                      <div className="flex items-center space-x-4 text-xs" style={{ color: '#2E2E2E' }}>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>10:00 AM</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bell size={12} />
                          <span>Reminder set</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium" style={{ color: '#1C1C1C' }}>Anatomy Review</h5>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Thu</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#2E2E2E' }}>Nervous System - 1.5 hours</p>
                      <div className="flex items-center space-x-4 text-xs" style={{ color: '#2E2E2E' }}>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>3:00 PM</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bell size={12} />
                          <span>Reminder set</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'ask-ai' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Ask AI Tutor</h3>
                <p className="text-lg" style={{ color: '#2E2E2E' }}>Get personalized explanations for any medical topic</p>
                
                <div className="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg">
                        <p className="text-sm" style={{ color: '#1C1C1C' }}>
                          Hello! I'm your AI tutor. I can help explain complex medical concepts, answer questions about anatomy, physiology, pathology, and much more. What would you like to learn about today?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <input 
                    type="text" 
                    placeholder="Ask about anatomy, physiology, pathology..."
                    className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button className="px-6" style={{ backgroundColor: '#3399FF' }}>
                    <MessageSquare size={20} className="mr-2" />
                    Send
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors" style={{ backgroundColor: '#F7FAFC' }}>
                    <h5 className="font-medium mb-2" style={{ color: '#1C1C1C' }}>Quick Questions</h5>
                    <div className="space-y-2">
                      <button className="text-left text-sm w-full p-2 rounded hover:bg-white transition-colors" style={{ color: '#2E2E2E' }}>
                        "Explain the cardiac cycle"
                      </button>
                      <button className="text-left text-sm w-full p-2 rounded hover:bg-white transition-colors" style={{ color: '#2E2E2E' }}>
                        "What are the cranial nerves?"
                      </button>
                      <button className="text-left text-sm w-full p-2 rounded hover:bg-white transition-colors" style={{ color: '#2E2E2E' }}>
                        "How does kidney filtration work?"
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC' }}>
                    <h5 className="font-medium mb-2" style={{ color: '#1C1C1C' }}>Recent Conversations</h5>
                    <div className="space-y-2">
                      <div className="text-sm p-2 bg-white rounded">
                        <div className="font-medium" style={{ color: '#1C1C1C' }}>Blood Pressure Regulation</div>
                        <div className="text-xs" style={{ color: '#2E2E2E' }}>2 hours ago</div>
                      </div>
                      <div className="text-sm p-2 bg-white rounded">
                        <div className="font-medium" style={{ color: '#1C1C1C' }}>Muscle Contraction</div>
                        <div className="text-xs" style={{ color: '#2E2E2E' }}>Yesterday</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC' }}>
                    <h5 className="font-medium mb-2" style={{ color: '#1C1C1C' }}>AI Features</h5>
                    <div className="space-y-2 text-sm" style={{ color: '#2E2E2E' }}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Personalized explanations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Visual diagrams</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Step-by-step breakdowns</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Memory techniques</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Learning Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl" style={{ backgroundColor: '#F7FAFC' }}>
                    <h4 className="font-semibold mb-4" style={{ color: '#1C1C1C' }}>Study Progress</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: '#2E2E2E' }}>Cardiology</span>
                          <span style={{ color: '#2E2E2E' }}>85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ backgroundColor: '#3399FF', width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: '#2E2E2E' }}>Anatomy</span>
                          <span style={{ color: '#2E2E2E' }}>72%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ backgroundColor: '#3399FF', width: '72%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-xl" style={{ backgroundColor: '#F7FAFC' }}>
                    <h4 className="font-semibold mb-4" style={{ color: '#1C1C1C' }}>Weekly Stats</h4>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#3399FF' }}>12hrs</div>
                      <div className="text-sm" style={{ color: '#2E2E2E' }}>Study time this week</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'leaderboard' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Leaderboard</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#FFD700' }}>1</div>
                      <span style={{ color: '#1C1C1C' }}>Sarah Johnson</span>
                    </div>
                    <span style={{ color: '#3399FF' }}>2,450 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#C0C0C0' }}>2</div>
                      <span style={{ color: '#1C1C1C' }}>Michael Chen</span>
                    </div>
                    <span style={{ color: '#3399FF' }}>2,380 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white border-2" style={{ borderColor: '#3399FF' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#3399FF' }}>{userStats.rank}</div>
                      <span style={{ color: '#1C1C1C' }}>{getUserDisplayName()} (You)</span>
                    </div>
                    <span style={{ color: '#3399FF' }}>{userStats.xp} XP</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
