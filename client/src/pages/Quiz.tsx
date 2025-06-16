import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Brain, 
  Microscope, 
  BookOpen, 
  Image as ImageIcon,
  Bot,
  Send,
  Sparkles,
  Target,
  Eye,
  Hand,
  Activity,
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Play,
  Database,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  ai_explanation: string;
  reference_data: string;
  category: string;
  difficulty: string;
}

export default function Quiz() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null);
  const [selectedMCQSubject, setSelectedMCQSubject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCadaverTopic, setSelectedCadaverTopic] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // MCQ Quiz states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);

  const cadaverTopics = [
    { id: 'head-neck', name: 'Head and Neck', icon: Eye, description: 'Cranial anatomy, facial structures, cervical region' },
    { id: 'upper-limb', name: 'Upper Limb', icon: Hand, description: 'Shoulder, arm, forearm, hand anatomy' },
    { id: 'thorax', name: 'Thorax', icon: Activity, description: 'Chest cavity, heart, lungs, mediastinum' },
    { id: 'lower-limb', name: 'Lower Limb', icon: Activity, description: 'Hip, thigh, leg, foot anatomy' },
    { id: 'pelvis-perineum', name: 'Pelvis and Perineum', icon: Target, description: 'Pelvic cavity, reproductive organs, perineal structures' },
    { id: 'neuroanatomy', name: 'Neuroanatomy', icon: Brain, description: 'Central and peripheral nervous system' },
    { id: 'abdomen', name: 'Abdomen', icon: Activity, description: 'Abdominal cavity, digestive organs, retroperitoneum' }
  ];

  const anatomyCategories = [
    'Head and Neck',
    'Upper Limb', 
    'Thorax',
    'Lower Limb',
    'Pelvis and Perineum',
    'Neuroanatomy',
    'Abdomen'
  ];

  const physiologyCategories = [
    'Cell',
    'Nerve and Muscle',
    'Blood',
    'Endocrine',
    'Reproductive',
    'Gastrointestinal Tract',
    'Renal',
    'Cardiovascular System',
    'Respiration',
    'Medical Genetics',
    'Neurophysiology'
  ];

  const histologyEmbryologyCategories = [
    'Histology and Embryology'
  ];

  // Fetch questions from Supabase based on category
  const fetchQuestions = async (category: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) {
        throw new Error('Failed to load questions file');
      }

      const data = await response.json();

      // Filter questions by category
      const filtered = data.filter((q: any) => q.category === category);

      if (filtered.length > 0) {
        // Transform questions to True/False format
        const transformed = filtered.map((q: any) => ({
          ...q,
          options: ['True', 'False'],
          correct_answer: q.answer === 1 || q.answer === "True" || q.answer === true ? 'True' : 'False',
          correctAnswer: q.answer === 1 || q.answer === "True" || q.answer === true ? 'True' : 'False',
          reference_data: q.reference_json || q.reference_data || ''
        }));

        const shuffled = transformed.sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizCompleted(false);
        setSelectedAnswer('');
        setIsAnswered(false);
        setQuestionStartTime(Date.now()); // Start timing for first question
      } else {
        console.error('No questions available for this category.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    const timeSpent = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

    setIsAnswered(true);

    if (isCorrect) {
      setScore(score + 1);
    }

    // Record quiz attempt with comprehensive analytics using authenticated Supabase user
    if (!user?.id) {
      console.warn('User not authenticated, skipping analytics recording');
      return;
    }
    const userId = user.id;

    // Ensure user profile is fully initialized
    try {
      await fetch('/api/initialize-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch (initError) {
      console.error('Error ensuring user initialization:', initError);
    }

    try {
      // Calculate XP based on correctness and streak (like the Python code)
      const baseXP = isCorrect ? 10 : 2;
      const streakBonus = isCorrect ? (score * 2) : 0; // Streak bonus for correct answers
      const xpEarned = baseXP + streakBonus;

      const response = await fetch('/api/quiz/record-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
            category: selectedCategory,
            selectedAnswer: answer,
            correctAnswer: currentQuestion.correct_answer,
            isCorrect,
            timeSpent,
            xpEarned,
            difficulty: currentQuestion.difficulty || 'medium',
            questionId: currentQuestion.id,
            currentQuestionIndex: currentQuestionIndex + 1,
            totalQuestions: questions.length
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Quiz attempt recorded with XP:', result.xpEarned);

          // Force immediate refresh of all analytics data
          await queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
          await queryClient.refetchQueries({ queryKey: ['/api/user-stats', user.id] });

          // Also refresh other related queries
          queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] });
          queryClient.invalidateQueries({ queryKey: ['/api/category-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/daily-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });

        } else {
          console.error('Failed to record quiz attempt:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('Error recording quiz attempt:', error);
      }
  };

  const getRandomQuestionIndex = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * questions.length);
    } while (randomIndex === currentQuestionIndex && questions.length > 1);
    return randomIndex;
  };

  const handleSkipQuestion = () => {
    const randomIndex = getRandomQuestionIndex();
    setCurrentQuestionIndex(randomIndex);
    setSelectedAnswer('');
    setIsAnswered(false);
    setQuestionStartTime(Date.now());
  };

  const handleNextQuestionAfterAnswer = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const randomIndex = getRandomQuestionIndex();
      setCurrentQuestionIndex(randomIndex);
      setSelectedAnswer('');
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    } else {
      setQuizCompleted(true);

      // Force refresh all stats after quiz completion
      try {
        const finalScore = score + (selectedAnswer === questions[currentQuestionIndex].correct_answer ? 1 : 0);
        const totalTime = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0;

        // Force refresh all stats after quiz completion
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] });
          queryClient.invalidateQueries({ queryKey: ['/api/category-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/daily-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
        }, 1000); // Delay to ensure database has processed all attempts

      } catch (error) {
        console.error('Error updating final stats:', error);
      }
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const randomIndex = getRandomQuestionIndex(); // Randomize next question
      setCurrentQuestionIndex(randomIndex);
      setSelectedAnswer('');
      setIsAnswered(false);
      setQuestionStartTime(Date.now()); // Start timing for new question
    } else {
      setQuizCompleted(true);

      // Force refresh all stats after quiz completion
      try {
        const finalScore = score + (selectedAnswer === questions[currentQuestionIndex].correct_answer ? 1 : 0);
        const totalTime = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0;

        // Force refresh all stats after quiz completion
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] });
          queryClient.invalidateQueries({ queryKey: ['/api/category-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/daily-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
        }, 1000); // Delay to ensure database has processed all attempts

      } catch (error) {
        console.error('Error updating final stats:', error);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setStartTime(new Date());
  };

  const getScorePercentage = () => {
    return Math.round((score / questions.length) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 80) return "Great job! You're doing very well!";
    if (percentage >= 70) return "Good work! Keep it up!";
    if (percentage >= 60) return "Not bad! There's room for improvement.";
    return "Keep studying! You'll improve with practice.";
  };

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    const userMessage = { role: 'user' as const, content: aiPrompt };
    setAiMessages(prev => [...prev, userMessage]);

    try {
      console.log('Generating AI quiz for topic:', aiPrompt);

      // Generate questions using AI with better error handling
      const response = await fetch('/api/ai/quiz-generator', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          topic: aiPrompt.trim(),
          difficulty: 'medium',
          questionCount: 5
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('AI Response data:', data);

      if (data.success && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        // Set the generated questions for quiz taking
        setQuestions(data.questions);
        setSelectedCategory(aiPrompt);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizCompleted(false);
        setSelectedAnswer('');
        setIsAnswered(false);
        setStartTime(new Date());
        setQuestionStartTime(Date.now());

        const aiResponse = { 
          role: 'assistant' as const, 
          content: `🎯 **Quiz Generated Successfully!** \n\nI've created **${data.questions.length} medical questions** about "${aiPrompt}". \n\n✨ **Features:**\n• True/False format\n• Detailed explanations\n• Instant feedback\n• Progress tracking\n\n🚀 **Ready to start?** Your personalized quiz is loaded and ready to go! Click "Start Quiz" below to begin practicing.`
        };
        setAiMessages(prev => [...prev, aiResponse]);

        toast({
          title: "🎉 Quiz Generated!",
          description: `Successfully created ${data.questions.length} questions about ${aiPrompt}`,
        });
      } else {
        console.error('Invalid response format:', data);
        throw new Error('No questions were generated. Please try a different topic.');
      }
    } catch (error: any) {
      console.error('AI Quiz Generation Error:', error);

      let errorMessage = "Failed to generate quiz. Please try again.";
      if (error.message?.includes('503')) {
        errorMessage = "AI service is not configured. Please check DeepSeek API key.";
      } else if (error.message?.includes('500')) {
        errorMessage = "Server error. Please try again in a moment.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please try a shorter topic.";
      }

      const errorResponse = { 
        role: 'assistant' as const, 
        content: `❌ **Sorry, I couldn't generate the quiz.** \n\n**Error:** ${errorMessage}\n\nPlease try:\n\n• **Different topic**: Try a more specific medical topic\n• **Simpler request**: Use clear, medical terminology\n• **Check connection**: Ensure you have internet access\n\n💡 **Example topics:**\n• "Cardiovascular anatomy"\n• "Diabetes pathophysiology"\n• "Respiratory physiology"\n• "Cell biology basics"`
      };
      setAiMessages(prev => [...prev, errorResponse]);

      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }

    setAiPrompt('');
  };

  const renderQuizTypeSelection = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">Medical Quizzes</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300">Choose your learning path and start practicing</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-3 sm:px-4">
        {/* AI Generator */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-600"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('ai-generator')}
        >
          <CardHeader className="text-center p-4 sm:p-6">
            <Bot className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">AI Generator</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Create personalized questions using advanced AI technology
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
              <Badge variant="secondary" className="text-xs">Personalized</Badge>
              <Badge variant="secondary" className="text-xs">Adaptive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cadaver Quiz */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-600"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('cadaver')}
        >
          <CardHeader className="text-center p-4 sm:p-6">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Cadaver Quiz</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Visual anatomy with real cadaver images and structures
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant="secondary" className="text-xs">Real Images</Badge>
              <Badge variant="secondary" className="text-xs">7 Topics</Badge>
              <Badge variant="secondary" className="text-xs">Interactive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Histology Slide Quiz */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-600"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('histology')}
        >
          <CardHeader className="text-center p-4 sm:p-6">
            <Microscope className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Histology Slide Quiz</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Microscopic anatomy and histological structures
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant="secondary" className="text-xs">Microscopic Images</Badge>
              <Badge variant="secondary" className="text-xs">Histology</Badge>
              <Badge variant="secondary" className="text-xs">Detailed</Badge>
            </div>
          </CardContent>
        </Card>

        {/* MCQ Questions */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-600"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('mcq')}
        >
          <CardHeader className="text-center p-4 sm:p-6">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">MCQ Questions</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Multiple choice questions from our comprehensive question bank
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant="secondary" className="text-xs">Anatomy & Physiology</Badge>
              <Badge variant="secondary" className="text-xs">Categorized</Badge>
              <Badge variant="secondary">Instant Feedback</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMCQSubjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>MCQ Questions</h2>
          <p style={{ color: '#2E2E2E' }}>Choose a subject to start practicing</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedQuizType(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quiz Types
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Anatomy */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedMCQSubject('anatomy')}
        >
          <CardHeader className="text-center">
            <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Anatomy</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Structural organization of the human body
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">7 Categories</Badge>
              <Badge variant="secondary">Body Systems</Badge>
              <Badge variant="secondary">Structures</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Physiology */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedMCQSubject('physiology')}
        >
          <CardHeader className="text-center">
            <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Physiology</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Functions and processes of the human body
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">11 Categories</Badge>
              <Badge variant="secondary">Body Functions</Badge>
              <Badge variant="secondary">Processes</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Histology and Embryology */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedMCQSubject('histology-embryology')}
        >
          <CardHeader className="text-center">
            <Microscope className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Histology & Embryology</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Microscopic anatomy and developmental biology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Microscopic Structure</Badge>
              <Badge variant="secondary">Development</Badge>
              <Badge variant="secondary">Cell Biology</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMCQCategories = () => {
    let categories, subjectTitle;
    
    if (selectedMCQSubject === 'anatomy') {
      categories = anatomyCategories;
      subjectTitle = 'Anatomy';
    } else if (selectedMCQSubject === 'physiology') {
      categories = physiologyCategories;
      subjectTitle = 'Physiology';
    } else if (selectedMCQSubject === 'histology-embryology') {
      categories = histologyEmbryologyCategories;
      subjectTitle = 'Histology & Embryology';
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>{subjectTitle} Categories</h2>
            <p style={{ color: '#2E2E2E' }}>Select a category to start your quiz</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedMCQSubject(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subjects
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category}
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
              style={{ backgroundColor: '#F7FAFC' }}
              onClick={() => {
                setSelectedCategory(category);
                fetchQuestions(category);
              }}
            >
              <CardHeader className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
                <CardTitle style={{ color: '#1C1C1C' }}>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge variant="secondary">Practice Questions</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderMCQQuiz = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3399FF' }}></div>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#1C1C1C' }}>No Questions Available</h3>
          <p style={{ color: '#2E2E2E' }}>No questions found for this category. Please try another category.</p>
          <Button 
            onClick={() => setSelectedCategory(null)}
            className="mt-4"
            variant="outline"
          >
            Back to Categories
          </Button>
        </div>
      );
    }

    if (quizCompleted) {
      const totalTime = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0;
      const minutes = Math.floor(totalTime / 60);
      const seconds = totalTime % 60;

      return (
        <div className="space-y-6">
          <Card style={{ backgroundColor: '#F7FAFC' }}>
            <CardContent className="p-8 text-center">
              <Award className="w-16 h-16 mx-auto mb-6" style={{ color: '#3399FF' }} />
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Quiz Complete!</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#3399FF' }}>
                    {String(score)}/{String(questions.length)}
                  </div>
                  <p className="text-sm" style={{ color: '#2E2E2E' }}>Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#3399FF' }}>
                    {getScorePercentage()}%
                  </div>
                  <p className="text-sm" style={{ color: '#2E2E2E' }}>Accuracy</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#3399FF' }}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm" style={{ color: '#2E2E2E' }}>Total Time</p>
                </div>
              </div>

              <p className="text-lg mb-6" style={{ color: '#1C1C1C' }}>{getScoreMessage()}</p>

              <div className="space-x-4">
                <Button 
                  onClick={() => fetchQuestions(selectedCategory!)}
                  style={{ backgroundColor: '#3399FF' }}
                >
                  Take Another Quiz
                </Button>
                <Button 
                  onClick={() => setSelectedCategory(null)}
                  variant="outline"
                >
                  Back to Categories
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>{selectedCategory} Quiz</h2>
            <p style={{ color: '#2E2E2E' }}>Question {String(currentQuestionIndex + 1)} of {String(questions.length)}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Quiz
          </Button>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Question Card */}
        <Card style={{ backgroundColor: '#F7FAFC' }}>
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: '#1C1C1C' }}>
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['True', 'False'].map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correct_answer;

                let buttonStyle = 'w-full p-6 border-2 rounded-lg transition-all duration-200 flex items-center justify-between ';

                if (isAnswered) {
                  if (isCorrect) {
                    buttonStyle += 'border-green-500 bg-green-50 text-green-900';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle += 'border-red-500 bg-red-50 text-red-900';
                  }else {
                    buttonStyle += 'border-gray-200 bg-gray-50 text-gray-700';
                  }
                } else {
                  if (isSelected) {
                    buttonStyle += 'border-blue-500 bg-blue-50 text-blue-900';
                  } else {
                    buttonStyle += 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer';
                  }
                }

                return (
                  <button
                    key={option}
                    className={buttonStyle}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${
                        option === 'True' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'
                      }`}>
                        {option === 'True' ? '✓' : '✗'}
                      </div>
                      <span className="text-lg font-semibold">{option}</span>
                    </div>
                    {isAnswered && (
                      <div>
                        {isCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                        {isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-600" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-6 space-y-4">
                {/* Next Question Button - Moved above explanations */}
                <div className="flex justify-center">
                  <Button 
                    onClick={handleNextQuestionAfterAnswer}
                    style={{ backgroundColor: '#3399FF' }}
                    size="lg"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      'Complete Quiz'
                    )}
                  </Button>
                </div>

                {/* Answer Explanations */}
                <div className="p-4 border rounded-lg" style={{ backgroundColor: '#F0F8FF', borderColor: '#3399FF' }}>
                  <h4 className="font-medium mb-2" style={{ color: '#1C1C1C' }}>
                    Answer: {selectedAnswer === currentQuestion.correct_answer ? 'Correct' : 'Incorrect'}
                  </h4>
                  {currentQuestion.explanation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.explanation}</p>
                    </div>
                  )}
                  {currentQuestion.ai_explanation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>AI Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.ai_explanation}</p>
                    </div>
                  )}
                  {currentQuestion.reference_data && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Reference:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.reference_data}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <div className="flex gap-3">
                {!isAnswered && (
                  <Button 
                    onClick={handleSkipQuestion}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAiGenerator = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>AI Question Generator</h2>
          <p style={{ color: '#2E2E2E' }}>Create personalized medical questions using advanced AI</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedQuizType(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quiz Types
        </Button>
      </div>

      <Card style={{ backgroundColor: '#F7FAFC' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#1C1C1C' }}>
            <Sparkles className="w-5 h-5" style={{ color: '#3399FF' }} />
            Professional AI Medical Tutor
          </CardTitle>
          <CardDescription>
            Ask me to generate questions on any medical topic, specify difficulty level, or request explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4" style={{ backgroundColor: '#FFFFFF' }}>
              {aiMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <Bot className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
                  <p>Start a conversation! Ask me to generate questions on any medical topic.</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><strong>Example prompts:</strong></p>
                    <p>"Generate 5 cardiology questions about arrhythmias"</p>
                    <p>"Create anatomy questions on the nervous system"</p>
                    <p>"I need pharmacology questions, intermediate level"</p>
                  </div>
                </div>
              ) : (
                aiMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#3399FF' }}></div>
                      <span>Generating questions...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Ask me to generate questions on any medical topic..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiSubmit();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAiSubmit}
                  disabled={!aiPrompt.trim() || isGenerating}
                  style={{ backgroundColor: '#3399FF' }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {questions.length > 0 && (
                <div className="text-center">
                  <Button 
                    onClick={() => setSelectedQuizType('ai-quiz')}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start AI Generated Quiz ({questions.length} questions)
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Quick suggestions:</span>
              {[
                "Cardiology questions",
                "Anatomy quiz",
                "Pharmacology MCQs",
                "Clinical scenarios",
                "Pathology cases"
              ].map((suggestion) => (
                <Badge 
                  key={suggestion}
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => setAiPrompt(`Generate ${suggestion}`)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCadaverTopics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Cadaver Anatomy Quiz</h2>
          <p style={{ color: '#2E2E2E' }}>Select a topic to practice with real cadaver images</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedQuizType(null)}
        >
          Back to Quiz Types
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cadaverTopics.map((topic) => {
          const IconComponent = topic.icon;
          return (
            <Card 
              key={topic.id}
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
              style={{ backgroundColor: '#F7FAFC' }}
              onClick={() => setSelectedCadaverTopic(topic.id)}
            >
              <CardHeader className="text-center">
                <IconComponent className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
                <CardTitle style={{ color: '#1C1C1C' }}>{topic.name}</CardTitle>
                <CardDescription style={{ color: '#2E2E2E' }}>
                  {topic.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge variant="secondary">Real Cadaver Images</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const loadQuestions = async (category: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const allQuestions = await response.json();
      console.log('All questions loaded:', allQuestions?.length || 0);

      let filteredQuestions = [];

      if (category === 'all') {
        filteredQuestions = allQuestions;
      } else {
        filteredQuestions = allQuestions.filter((q: Question) => 
          q.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (filteredQuestions.length === 0) {
        alert(`No questions found for category: ${category}. Showing all questions instead.`);
        filteredQuestions = allQuestions.slice(0, 10);
      }

      console.log(`Filtered questions for ${category}:`, filteredQuestions.length);

      const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, Math.min(10, shuffled.length));

      setQuestions(selectedQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer('');
      setIsAnswered(false);
      setQuizCompleted(false);
      setStartTime(new Date());
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAIQuestionsFromDB = async (category?: string, difficulty?: string) => {
    setLoading(true);
    try {
      let url = '/api/ai-questions?limit=10';
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI questions loaded from DB:', data.questions?.length || 0);

      if (data.success && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer('');
        setIsAnswered(false);
        setQuizCompleted(false);
        setStartTime(new Date());
        setQuestionStartTime(Date.now());
      } else {
        alert('No AI-generated questions found in database. Try generating some first.');
      }
    } catch (error) {
      console.error('Error loading AI questions from database:', error);
      alert('Failed to load AI questions from database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // MCQ Quiz Flow
  if (selectedQuizType === 'mcq' && !selectedMCQSubject) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderMCQSubjects()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'mcq' && selectedMCQSubject && !selectedCategory) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderMCQCategories()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'mcq' && selectedCategory && questions.length > 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto px-8 py-12">
          {renderMCQQuiz()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'mcq' && selectedCategory && loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto px-8 py-12">
          {renderMCQQuiz()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'ai-generator') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderAiGenerator()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'ai-quiz' && questions.length > 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto px-8 py-12">
          {renderMCQQuiz()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'cadaver') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderCadaverTopics()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'histology') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="text-center py-20">
            <Microscope className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Histology Slide Quiz</h2>
            <p className="text-gray-700 dark:text-gray-300">Coming soon! Practice with microscopic anatomy images.</p>
            <Button 
              onClick={() => setSelectedQuizType(null)}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz Types
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'ai-database') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="text-center py-20">
            <Database className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Generated Questions</h2>
            <p className="text-gray-700 dark:text-gray-300">Coming soon! Practice with AI generated questions.</p>
            <Button 
              onClick={() => setSelectedQuizType(null)}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz Types
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/DocDot Medical Student Logo.png" 
              alt="DocDot Medical Student Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#1C1C1C' }}>Medical Quiz Platform</h1>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Medical Quiz Platform</h2>
          <p className="text-gray-700 dark:text-gray-300">Test your knowledge with our comprehensive medical quizzes</p>
        </div>
        {renderQuizTypeSelection()}
      </div>
    </div>
  );
}