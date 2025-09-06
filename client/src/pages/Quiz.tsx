import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
import { useTheme } from '@/contexts/ThemeContext';
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
  Zap,
  Timer,
  Heart
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
  detailedExplanation?: string;
  ai_explanation: string;
  reference?: string;
  reference_data: string;
  category: string;
  difficulty: string;
}

export default function Quiz() {
  const { user } = useAuth();
  const { theme } = useTheme();
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

  // Topical Questions states
  const [selectedUpperLimbMode, setSelectedUpperLimbMode] = useState<'topical' | 'exam' | null>(null);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedMcqAnswer, setSelectedMcqAnswer] = useState('');
  const [isMcqAnswered, setIsMcqAnswered] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [mcqCompleted, setMcqCompleted] = useState(false);

  // Histopathology states
  const [selectedHistopathologyTopic, setSelectedHistopathologyTopic] = useState<string | null>(null);
  const [histopathologyTopics, setHistopathologyTopics] = useState<any[]>([]);
  const [histopathologySubtopics, setHistopathologySubtopics] = useState<any[]>([]);
  const [histopathologyQuestions, setHistopathologyQuestions] = useState<any[]>([]);
  const [currentHistoIndex, setCurrentHistoIndex] = useState(0);
  const [selectedHistoAnswer, setSelectedHistoAnswer] = useState('');
  const [isHistoAnswered, setIsHistoAnswered] = useState(false);
  const [histoScore, setHistoScore] = useState(0);
  const [histoCompleted, setHistoCompleted] = useState(false);
  const [isGeneratingHisto, setIsGeneratingHisto] = useState(false);

  // Customize Exam states
  const [examStep, setExamStep] = useState<'select-type' | 'select-topics' | 'select-count' | 'exam' | 'results' | 'review'>('select-type');
  const [examType, setExamType] = useState<'anatomy' | 'physiology' | ''>('');
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [stemCount, setStemCount] = useState<number>(10);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [currentStemIndex, setCurrentStemIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, boolean | null>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examResults, setExamResults] = useState<any>(null);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const [examTimer, setExamTimer] = useState<number | null>(null);

  // Cleanup effect for timers
  useEffect(() => {
    return () => {
      if (examTimer) {
        clearInterval(examTimer);
      }
    };
  }, [examTimer]);

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

  // Upper Limb topics for topical questions
  const upperLimbTopics = [
    'Pectoral Region',
    'Arm',
    'Cubital Fossa',
    'Forearm',
    'Wrist',
    'Hand',
    'Joints',
    'Neurovascular Supply',
    'Clinical Correlates'
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

  const histopathologyCategories = [
    'General Pathology',
    'Blood Vessels', 
    'The Heart',
    'Hematologic Diseases',
    'Red Blood Cell and Bleeding Disorders',
    'The Lung',
    'Head and Neck',
    'Gastrointestinal Tract',
    'Liver and Biliary System',
    'The Pancreas',
    'The Kidney',
    'Male Genital System',
    'Female Genital System',
    'The Breast',
    'Endocrine System',
    'The Skin',
    'Musculoskeletal System',
    'Nervous System',
    'The Eye'
  ];

  // Customize Exam topic definitions
  const anatomyTopics = [
    { id: 1, name: 'Upper Limb', slug: 'upperlimb' },
    { id: 2, name: 'Thorax', slug: 'thorax' },
    { id: 3, name: 'Head and Neck', slug: 'headneck' },
    { id: 4, name: 'Lower Limb', slug: 'lowerlimb' },
    { id: 5, name: 'Abdomen', slug: 'abdomen' },
    { id: 6, name: 'Neuroanatomy', slug: 'neuroanatomy' },
  ];

  const physiologyTopics = [
    { id: 7, name: 'Cell Physiology', slug: 'cell' },
    { id: 8, name: 'Nerve and Muscle', slug: 'nervemuscle' },
    { id: 9, name: 'Blood', slug: 'blood' },
    { id: 10, name: 'Endocrine', slug: 'endocrine' },
    { id: 11, name: 'Cardiovascular System', slug: 'cardiovascular' },
    { id: 12, name: 'Respiration', slug: 'respiration' },
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

  // Fetch histopathology topics from API
  const fetchHistopathologyTopics = async () => {
    try {
      console.log('🧠 Fetching histopathology topics');
      const response = await fetch('/api/histopathology/topics');
      if (!response.ok) {
        throw new Error('Failed to fetch histopathology topics');
      }
      const topics = await response.json();
      console.log(`📊 Received ${topics.length} histopathology topics`);
      setHistopathologyTopics(topics);
    } catch (error) {
      console.error('Error fetching histopathology topics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load histopathology topics"
      });
    }
  };

  // Generate histopathology questions using AI
  const generateHistopathologyQuestions = async (topicId: string, topicName: string, count: number = 5) => {
    setIsGeneratingHisto(true);
    try {
      console.log(`🧠 Generating ${count} histopathology questions for: ${topicName}`);
      
      // Get subtopics for the topic
      const subtopicsResponse = await fetch(`/api/histopathology/topics/${topicId}/subtopics`);
      let subtopics: string[] = [];
      if (subtopicsResponse.ok) {
        const subtopicsData = await subtopicsResponse.json();
        subtopics = subtopicsData.map((sub: any) => sub.name);
      }

      const response = await fetch('/api/histopathology/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          topicName,
          subtopics,
          count
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate histopathology questions');
      }

      const data = await response.json();
      console.log(`✅ Generated ${data.questions.length} histopathology questions`);

      // Transform questions to match quiz format
      const transformedQuestions = data.questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question,
        options: Object.values(q.options), // Convert {A, B, C, D} to array
        optionsObject: q.options, // Keep original format for display
        correct_answer: q.correctAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.shortExplanation,
        detailedExplanation: q.detailedExplanation,
        ai_explanation: q.detailedExplanation,
        robbins_reference: q.robbinsReference,
        category: 'Histopathology',
        topic: topicName,
        difficulty: 'intermediate'
      }));

      setHistopathologyQuestions(transformedQuestions);
      setCurrentHistoIndex(0);
      setHistoScore(0);
      setHistoCompleted(false);
      setSelectedHistoAnswer('');
      setIsHistoAnswered(false);
      setQuestionStartTime(Date.now());
      setStartTime(new Date());

      toast({
        title: "Questions Generated",
        description: `Generated ${transformedQuestions.length} histopathology questions for ${topicName}`
      });

    } catch (error) {
      console.error('Error generating histopathology questions:', error);
      toast({
        variant: "destructive", 
        title: "Generation Failed",
        description: "Failed to generate histopathology questions. Please try again."
      });
    } finally {
      setIsGeneratingHisto(false);
    }
  };

  // Handle histopathology answer selection
  const handleHistopathologyAnswer = async (answer: string) => {
    if (isHistoAnswered) return;

    setSelectedHistoAnswer(answer);
    const currentQuestion = histopathologyQuestions[currentHistoIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    const timeSpent = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

    setIsHistoAnswered(true);

    if (isCorrect) {
      setHistoScore(histoScore + 1);
    }

    // Record histopathology attempt
    if (user?.id) {
      try {
        const response = await fetch('/api/histopathology/record-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            questionId: currentQuestion.id,
            selectedAnswer: answer,
            isCorrect,
            timeSpent
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Histopathology attempt recorded:', result);
        }
      } catch (error) {
        console.error('Error recording histopathology attempt:', error);
      }
    }
  };

  // Navigate to next histopathology question
  const nextHistopathologyQuestion = () => {
    if (currentHistoIndex < histopathologyQuestions.length - 1) {
      setCurrentHistoIndex(currentHistoIndex + 1);
      setSelectedHistoAnswer('');
      setIsHistoAnswered(false);
      setQuestionStartTime(Date.now());
    } else {
      setHistoCompleted(true);
    }
  };

  // Fetch MCQ questions from database by topic
  const fetchMcqQuestions = async (topic: string, category: string = 'Upper Limb') => {
    setLoading(true);
    console.log(`🔍 Frontend: Fetching MCQ questions for topic: "${topic}", category: "${category}"`);
    
    try {
      const url = `/api/mcq-questions?topic=${encodeURIComponent(topic)}&category=${encodeURIComponent(category)}&limit=10`;
      console.log(`🌐 Frontend: Making request to: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load MCQ questions`);
      }

      const data = await response.json();
      console.log(`📊 Frontend: Received ${data.length} questions from API`);

      if (data.length > 0) {
        // Log the first question to see its topic
        console.log(`📝 Frontend: First question topic: "${data[0].topic}"`);
        console.log(`📝 Frontend: First question: ${data[0].question.substring(0, 100)}...`);
        
        // Transform MCQ questions to match our quiz format
        const transformed = data.map((q: any) => ({
          ...q,
          options: ['True', 'False'],
          correct_answer: q.answer ? 'True' : 'False',
          correctAnswer: q.answer ? 'True' : 'False',
          reference_data: q.reference_snell || q.reference_grays || q.reference_moore || '',
          ai_explanation: q.ai_explanation || q.explanation
        }));

        setMcqQuestions(transformed);
        setCurrentMcqIndex(0);
        setMcqScore(0);
        setMcqCompleted(false);
        setSelectedMcqAnswer('');
        setIsMcqAnswered(false);
        setQuestionStartTime(Date.now());
        
        console.log(`✅ Frontend: Successfully loaded ${transformed.length} questions for ${topic}`);
      } else {
        console.log(`❌ Frontend: No questions found for topic: "${topic}"`);
        toast({
          variant: "destructive",
          title: "No Questions Available",
          description: `No questions found for ${topic}. Please try another topic.`
        });
      }
    } catch (error) {
      console.error('Error fetching MCQ questions:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Questions",
        description: "Failed to load questions. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available topics for Upper Limb
  const fetchUpperLimbTopics = async () => {
    try {
      const response = await fetch('/api/mcq-topics?category=Upper Limb');
      if (!response.ok) {
        throw new Error('Failed to load topics');
      }
      const topics = await response.json();
      setAvailableTopics(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Fallback to predefined topics
      setAvailableTopics(upperLimbTopics);
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
        console.log('✅ Quiz attempt recorded:', result);

        if (result.newBadges && result.newBadges.length > 0) {
          console.log('🏆 New badges earned:', result.newBadges);
          // You could show a badge notification here
        }

        if (result.updatedStats) {
          console.log('📊 Updated stats:', result.updatedStats);
          // Stats have been updated in the database
        }

        if (result.analyticsRefreshed) {
          console.log('📈 Analytics data refreshed successfully');
        }

        // Trigger a small delay to ensure database updates are complete
        setTimeout(() => {
          // Force refresh of any cached analytics data
          window.dispatchEvent(new CustomEvent('analytics-update'));
        }, 1000);
      } else {
        console.error('Failed to record quiz attempt:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
      } catch (error) {
        console.error('Error recording quiz attempt:', error);
      }
  };

  // Handle MCQ answer selection
  const handleMcqAnswerSelect = async (answer: string) => {
    if (isMcqAnswered) return;

    setSelectedMcqAnswer(answer);

    const currentQuestion = mcqQuestions[currentMcqIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    const timeSpent = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

    setIsMcqAnswered(true);

    if (isCorrect) {
      setMcqScore(mcqScore + 1);
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
      const streakBonus = isCorrect ? (mcqScore * 2) : 0; // Streak bonus for correct answers
      const xpEarned = baseXP + streakBonus;

      const response = await fetch('/api/quiz/record-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          category: `Upper Limb - ${selectedTopic}`,
          selectedAnswer: answer,
          correctAnswer: currentQuestion.correct_answer,
          isCorrect,
          timeSpent,
          xpEarned,
          difficulty: 'medium',
          questionId: currentQuestion.id,
          currentQuestionIndex: currentMcqIndex + 1,
          totalQuestions: mcqQuestions.length
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ MCQ attempt recorded:', result);

        if (result.newBadges && result.newBadges.length > 0) {
          console.log('🏆 New badges earned:', result.newBadges);
        }

        if (result.updatedStats) {
          console.log('📊 Updated stats:', result.updatedStats);
        }

        if (result.analyticsRefreshed) {
          console.log('📈 Analytics data refreshed successfully');
        }

        // Trigger a small delay to ensure database updates are complete
        setTimeout(() => {
          // Force refresh of any cached analytics data
          window.dispatchEvent(new CustomEvent('analytics-update'));
        }, 1000);
      } else {
        console.error('Failed to record MCQ attempt:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error recording MCQ attempt:', error);
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

  const getMcqScorePercentage = () => {
    return Math.round((mcqScore / mcqQuestions.length) * 100);
  };

  const handleNextMcqQuestion = () => {
    if (currentMcqIndex < mcqQuestions.length - 1) {
      setCurrentMcqIndex(currentMcqIndex + 1);
      setSelectedMcqAnswer('');
      setIsMcqAnswered(false);
      setQuestionStartTime(Date.now());
    } else {
      setMcqCompleted(true);
    }
  };

  const resetMcqQuiz = () => {
    setCurrentMcqIndex(0);
    setSelectedMcqAnswer('');
    setIsMcqAnswered(false);
    setMcqScore(0);
    setMcqCompleted(false);
    setStartTime(new Date());
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
    setAiMessages((prev) => [...prev, userMessage]);

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
          content: `🎯 **Quiz Generated Successfully with DeepSeek AI!** \n\nI've created **${data.questions.length} medical questions** about "${aiPrompt}". \n\n✨ **Features:**\n• True/False format\n• Short & detailed explanations\n• Book references with chapters & pages\n• Instant feedback\n• Progress tracking\n• AI-powered content\n\n🚀 **Ready to start?** Your personalized quiz is loaded and ready to go! Click "Start Quiz" below to begin practicing.`
        };
        setAiMessages((prev) => [...prev, aiResponse]);

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
        content: `❌ **Sorry, I couldn't generate the quiz with DeepSeek AI.** \n\n**Error:** ${errorMessage}\n\nPlease try:\n\n• **Different topic**: Try a more specific medical topic\n• **Simpler request**: Use clear, medical terminology\n• **Check connection**: Ensure you have internet access\n• **API Status**: DeepSeek AI service might be temporarily unavailable\n\n💡 **Example topics:**\n• "Cardiovascular anatomy"\n• "Diabetes pathophysiology"\n• "Respiratory physiology"\n• "Cell biology basics"\n\n🔄 **Try again** with a different topic or check back later.`
      };
      setAiMessages((prev) => [...prev, errorResponse]);

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

  // Reset exam state
  const resetExamState = () => {
    setExamStep('select-type');
    setExamType('');
    setSelectedTopics([]);
    setStemCount(10);
    setCurrentExam(null);
    setCurrentStemIndex(0);
    setExamAnswers({});
    setTimeRemaining(0);
    setExamResults(null);
    setIsGeneratingExam(false);
    setExamError(null);
    
    // Clear any existing timer
    if (examTimer) {
      clearInterval(examTimer);
      setExamTimer(null);
    }
  };

  // Generate custom exam with AI
  const generateCustomExam = async (topics: number[], stemCount: number, examType: string) => {
    setIsGeneratingExam(true);
    setExamError(null);
    
    try {
      const topicNames = topics.map(id => {
        const topic = [...anatomyTopics, ...physiologyTopics].find(t => t.id === id);
        return topic?.name || '';
      }).filter(Boolean);

      console.log('Generating exam with:', { topicNames, stemCount, examType });

      const response = await fetch('/api/generate-custom-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topics: topicNames,
          stemCount,
          examType,
          userId: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate exam`);
      }

      const examData = await response.json();
      console.log('Exam generated successfully:', examData);
      
      if (!examData || !examData.stems || examData.stems.length === 0) {
        throw new Error('Invalid exam data received from server');
      }
      
      setCurrentExam(examData);

      // Set timer: 2 minutes per stem as specified
      const totalTimeInSeconds = stemCount * 2 * 60;
      setTimeRemaining(totalTimeInSeconds);
      setExamStep('exam');

      // Start the countdown timer
      startExamTimer(totalTimeInSeconds);

      const sources = examType === 'anatomy' 
        ? "Snell's Clinical Anatomy, Gray's Anatomy, Keith Moore's Clinically Oriented Anatomy"
        : "Guyton & Hall Medical Physiology, Ganong's Review, Boron & Boulpaep";

      toast({
        title: "Exam Generated Successfully",
        description: `Your custom ${examType} exam with ${stemCount} stems from ${sources} is ready! Time limit: ${stemCount * 2} minutes`
      });

    } catch (error) {
      console.error('Error generating exam:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate exam. Please try again.';
      setExamError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage
      });
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // Timer management for automatic exam submission
  const startExamTimer = (totalSeconds: number) => {
    // Clear any existing timer
    if (examTimer) {
      clearInterval(examTimer);
    }
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExamTimer(null);
          // Auto-submit exam when time expires
          handleSubmitCustomExam();
          toast({
            variant: "destructive",
            title: "Time's Up!",
            description: "The exam has been automatically submitted."
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Store timer reference for cleanup
    setExamTimer(timer as unknown as number);
  };

  // Handle customize exam subject selection
  const handleCustomizeExamSelection = () => {
    setSelectedMCQSubject(null);
    setExamStep('select-type');
  };

  // Handle custom exam submission with negative marking
  const handleSubmitCustomExam = async () => {
    if (!currentExam) return;

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    const totalOptions = currentExam.stems.reduce((sum: number, stem: any) => sum + stem.options.length, 0);

    // Calculate score using negative marking: +1 correct, -1 wrong, 0 skipped
    currentExam.stems.forEach((stem: any) => {
      stem.options.forEach((option: any) => {
        const optionKey = `${stem.id}_${option.id}`;
        const userAnswer = examAnswers[optionKey];
        const correctAnswer = option.answer;

        if (userAnswer === undefined || userAnswer === null) {
          // Skipped - no points
          skippedCount++;
        } else if (userAnswer === correctAnswer) {
          // Correct answer - +1 point
          totalScore += 1;
          correctCount++;
        } else {
          // Wrong answer - -1 point
          totalScore -= 1;
          incorrectCount++;
        }
      });
    });

    // Calculate percentage based on total possible score
    const maxPossibleScore = totalOptions;
    const scorePercentage = Math.max(0, Math.round((totalScore / maxPossibleScore) * 100));
    const timeSpent = currentExam.durationSeconds - timeRemaining;

    const results = {
      totalScore,
      correctCount,
      incorrectCount,
      skippedCount,
      totalOptions,
      scorePercentage,
      timeSpent,
      examId: currentExam.id
    };

    setExamResults(results);
    setExamStep('results');

    // Save attempt to database
    try {
      await fetch('/api/custom-exam-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customExamId: currentExam.id,
          userId: user?.id,
          answers: examAnswers,
          totalScore,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          skippedAnswers: skippedCount,
          scorePercentage,
          timeSpentSeconds: timeSpent
        })
      });
    } catch (error) {
      console.error('Error saving exam attempt:', error);
    }
  };

  // Render custom exam
  const renderCustomExam = () => {
    if (!currentExam || !currentExam.stems) {
      return (
        <div className="text-center py-20">
          <p style={{ color: '#2E2E2E' }}>Loading exam questions...</p>
        </div>
      );
    }

    const currentStem = currentExam.stems[currentStemIndex];
    if (!currentStem) {
      return (
        <div className="text-center py-20">
          <p style={{ color: '#2E2E2E' }}>No questions available.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Professional Exam Header */}
        <div className="bg-white border-b-2 border-black p-6 mb-0">
          <div className="flex justify-between items-center max-w-5xl mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-black">DocDot Medical Examination</h1>
              <p className="text-lg text-black font-medium">{examType === 'anatomy' ? 'Anatomy' : 'Physiology'} Standard Exam</p>
              <p className="text-sm text-gray-600 mt-1">Time Allowed: {Math.ceil(currentExam.stems.length * 2)} minutes</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-black">
                Question {currentStemIndex + 1} of {currentExam.stems.length}
              </div>
              <div className="flex items-center justify-end text-red-600 font-mono text-xl font-bold mt-2">
                <Timer className="w-6 h-6 mr-2" />
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-gray-600 mt-1">Time Remaining</p>
            </div>
          </div>
        </div>

        {/* Professional Exam Paper Style */}
        <div className="max-w-5xl mx-auto p-8">
          <div className="bg-white border-2 border-black shadow-2xl">
            <div className="p-10">
              {/* Stem Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-8 leading-relaxed">
                  {currentStemIndex + 1}. {currentStem.stemText}
                </h2>

                {/* True/False Options in Professional Layout */}
                <div className="space-y-6">
                  {currentStem.options?.map((option: any) => {
                    const optionKey = `${currentStem.id}_${option.id}`;
                    const userAnswer = examAnswers[optionKey];

                    return (
                      <div key={option.id} className="flex items-center space-x-6 p-4 border-l-4 border-gray-300 bg-gray-50">
                        {/* True/False Buttons */}
                        <div className="flex space-x-3">
                          <Button
                            variant={userAnswer === true ? "default" : "outline"}
                            size="lg"
                            className={`w-12 h-12 text-lg font-bold border-2 ${
                              userAnswer === true 
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                                : 'border-black text-black hover:bg-green-100 bg-white'
                            }`}
                            onClick={() => {
                              setExamAnswers((prev) => ({
                                ...prev,
                                [optionKey]: true
                              }));
                            }}
                          >
                            T
                          </Button>
                          <Button
                            variant={userAnswer === false ? "default" : "outline"}
                            size="lg"
                            className={`w-12 h-12 text-lg font-bold border-2 ${
                              userAnswer === false 
                                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                                : 'border-black text-black hover:bg-red-100 bg-white'
                            }`}
                            onClick={() => {
                              setExamAnswers((prev) => ({
                                ...prev,
                                [optionKey]: false
                              }));
                            }}
                          >
                            F
                          </Button>
                        </div>

                        {/* Option Statement */}
                        <div className="flex-1">
                          <span className="text-xl font-bold text-black mr-4">
                            {option.optionLetter})
                          </span>
                          <span className="text-lg text-black leading-relaxed">{option.statement}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions Box */}
              <div className="bg-blue-50 border-2 border-blue-200 p-4 mb-8 rounded">
                <p className="text-sm text-blue-800 font-medium">
                  <strong>Instructions:</strong> Click T for True or F for False for each statement. 
                  You can skip questions you're unsure about. Correct answer = +1, Wrong answer = -1, No answer = 0.
                </p>
              </div>

              {/* Navigation and Progress */}
              <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (currentStemIndex > 0) {
                      setCurrentStemIndex(currentStemIndex - 1);
                    }
                  }}
                  disabled={currentStemIndex === 0}
                  className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-6 py-3"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous Question
                </Button>

                <div className="text-center">
                  <div className="flex space-x-4 mb-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">{currentStemIndex + 1}</div>
                      <div className="text-sm text-gray-600">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">{currentExam.stems.length}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                  <Progress 
                    value={(currentStemIndex + 1) / currentExam.stems.length * 100} 
                    className="w-64 h-3"
                  />
                </div>

                <Button
                  size="lg"
                  onClick={() => {
                    if (currentStemIndex < currentExam.stems.length - 1) {
                      setCurrentStemIndex(currentStemIndex + 1);
                    } else {
                      handleSubmitCustomExam();
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-bold border-2 border-blue-600"
                >
                  {currentStemIndex < currentExam.stems.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    'Submit Exam'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render exam results with negative marking breakdown
  const renderExamResults = () => {
    if (!examResults) return null;

    return (
      <div className="min-h-screen bg-white">
        {/* Professional Results Header */}
        <div className="bg-white border-b-2 border-black p-6 mb-0">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-black">Exam Results</h1>
            <p className="text-xl text-gray-600 mt-2">{examType === 'anatomy' ? 'Anatomy' : 'Physiology'} Standard Exam</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-8">
          <div className="bg-white border-2 border-black shadow-2xl">
            <div className="p-10">
              {/* Score Summary */}
              <div className="text-center mb-10">
                <Award className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
                <h2 className="text-4xl font-bold text-black mb-4">Examination Complete!</h2>

                {/* Main Score Display */}
                <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-lg mb-8">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {examResults.scorePercentage}%
                  </div>
                  <p className="text-xl text-blue-800 font-medium">Final Score</p>
                  <p className="text-lg text-gray-600 mt-2">
                    Total Points: {examResults.totalScore} / {examResults.totalOptions}
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {examResults.correctCount}
                  </div>
                  <p className="text-green-800 font-medium">Correct (+1 each)</p>
                  <p className="text-sm text-green-600 mt-1">+{examResults.correctCount} points</p>
                </div>

                <div className="text-center p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {examResults.incorrectCount}
                  </div>
                  <p className="text-red-800 font-medium">Incorrect (-1 each)</p>
                  <p className="text-sm text-red-600 mt-1">-{examResults.incorrectCount} points</p>
                </div>

                <div className="text-center p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600 mb-2">
                    {examResults.skippedCount}
                  </div>
                  <p className="text-gray-800 font-medium">Skipped (0 each)</p>
                  <p className="text-sm text-gray-600 mt-1">0 points</p>
                </div>

                <div className="text-center p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.floor(examResults.timeSpent / 60)}:{(examResults.timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-blue-800 font-medium">Time Taken</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {Math.ceil(currentExam?.stems.length * 2)} min allowed
                  </p>
                </div>
              </div>

              {/* Calculation Explanation */}
              <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-bold text-yellow-800 mb-3">Marking Scheme Applied:</h3>
                <div className="text-yellow-800">
                  <p className="mb-2">• Correct Answer = +1 point</p>
                  <p className="mb-2">• Wrong Answer = -1 point</p>
                  <p className="mb-4">• Skipped Answer = 0 points</p>
                  <p className="font-medium">
                    Calculation: ({examResults.correctCount} × 1) + ({examResults.incorrectCount} × -1) + ({examResults.skippedCount} × 0) = {examResults.totalScore} points
                  </p>
                  <p className="font-medium mt-2">
                    Percentage: ({examResults.totalScore} ÷ {examResults.totalOptions}) × 100 = {examResults.scorePercentage}%
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-6">
                <Button 
                  size="lg"
                  onClick={() => setExamStep('review')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold border-2 border-green-600"
                >
                  Review Exam
                </Button>
                <Button 
                  size="lg"
                  onClick={() => {
                    setExamStep('select-type');
                    setCurrentExam(null);
                    setExamAnswers({});
                    setExamResults(null);
                    setCurrentStemIndex(0);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-bold border-2 border-blue-600"
                >
                  Take Another Exam
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => setSelectedMCQSubject(null)}
                  className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-8 py-4 text-lg font-bold"
                >
                  Back to MCQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render exam review with wrong answers and explanations
  const renderExamReview = () => {
    if (!currentExam || !examResults) return null;

    const wrongAnswers: any[] = [];

    // Collect all wrong answers for review
    currentExam.stems.forEach((stem: any) => {
      stem.options.forEach((option: any) => {
        const optionKey = `${stem.id}_${option.id}`;
        const userAnswer = examAnswers[optionKey];
        const correctAnswer = option.answer;

        if (userAnswer !== undefined && userAnswer !== correctAnswer) {
          wrongAnswers.push({
            stemText: stem.stemText,
            option: option,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer
          });
        }
      });
    });

    return (
      <div className="min-h-screen bg-white">
        {/* Professional Review Header */}
        <div className="bg-white border-b-2 border-black p-6 mb-0">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-black">Exam Review</h1>
                <p className="text-xl text-gray-600 mt-2">Incorrect Answers with Explanations</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {wrongAnswers.length} Wrong Answer{wrongAnswers.length !== 1 ? 's' : ''}
                </div>
                <p className="text-gray-600">to review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-8">
          <div className="bg-white border-2 border-black shadow-2xl">
            <div className="p-10">
              {wrongAnswers.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
                  <h2 className="text-3xl font-bold text-green-600 mb-4">Perfect Score!</h2>
                  <p className="text-xl text-gray-600 mb-8">You answered all questions correctly. No review needed.</p>
                  <Button 
                    size="lg"
                    onClick={() => setExamStep('results')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-bold"
                  >
                    Back to Results
                  </Button>
                </div>
              ) : (
                <>
                  {/* Instructions */}
                  <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-bold text-red-800 mb-2">Review Instructions:</h3>
                    <p className="text-red-800">
                      Below are the questions you answered incorrectly. Study the correct answers and explanations 
                      to improve your understanding.
                    </p>
                  </div>

                  {/* Wrong Answers List */}
                  <div className="space-y-8">
                    {wrongAnswers.map((item, index) => (
                      <div key={index} className="border-2 border-red-200 bg-red-50 rounded-lg p-6">
                        {/* Question Stem */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-black mb-3">
                            {item.stemText}
                          </h3>
                        </div>

                        {/* Option with Answer */}
                        <div className="bg-white border-2 border-gray-300 rounded p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-lg font-bold text-black mr-3">
                                {item.option.optionLetter})
                              </span>
                              <span className="text-lg text-black">{item.option.statement}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Your Answer</div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                                  item.userAnswer ? 'bg-red-100 text-red-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {item.userAnswer ? 'T' : 'F'}
                                </div>
                              </div>
                              <XCircle className="w-8 h-8 text-red-500" />
                              <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Correct Answer</div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                                  item.correctAnswer ? 'bg-green-100 text-green-600' : 'bg-green-100 text-green-600'
                                }`}>
                                  {item.correctAnswer ? 'T' : 'F'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="bg-green-50 border-2 border-green-200 rounded p-4">
                          <h4 className="font-bold text-green-800 mb-2">Explanation:</h4>
                          <p className="text-green-800 leading-relaxed">{item.option.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-center space-x-6 mt-10 pt-8 border-t-2 border-gray-200">
                    <Button 
                      size="lg"
                      onClick={() => setExamStep('results')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-bold border-2 border-blue-600"
                    >
                      Back to Results
                    </Button>
                    <Button 
                      size="lg"
                      onClick={() => {
                        setExamStep('select-type');
                        setCurrentExam(null);
                        setExamAnswers({});
                        setExamResults(null);
                        setCurrentStemIndex(0);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold border-2 border-green-600"
                    >
                      Take Another Exam
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={() => setSelectedMCQSubject(null)}
                      className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-8 py-4 text-lg font-bold"
                    >
                      Back to MCQ
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render customize exam type selection
  const renderCustomizeExamTypeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Customize Your Exam</h2>
          <p style={{ color: '#2E2E2E' }}>Choose the type of exam you want to create</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            resetExamState();
            setSelectedMCQSubject(null);
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to MCQ Options
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => {
            setExamType('anatomy');
            setExamStep('select-topics');
          }}
        >
          <CardHeader className="text-center">
            <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Anatomy Exam</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Create a comprehensive anatomy exam with AI-generated stems from authoritative medical sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Badge variant="secondary">6 Topics Available</Badge>
                <Badge variant="secondary">True/False Format</Badge>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-semibold">Sources:</p>
                <p>• Snell's Clinical Anatomy</p>
                <p>• Gray's Anatomy for Students</p>
                <p>• Keith Moore's Clinically Oriented Anatomy</p>
                <p>• TeachMeAnatomy.info</p>
                <p>• Kenhub.com</p>
              </div>
              <Badge variant="secondary">AI-Generated</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => {
            setExamType('physiology');
            setExamStep('select-topics');
          }}
        >
          <CardHeader className="text-center">
            <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Physiology Exam</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Create a comprehensive physiology exam with AI-generated stems from authoritative medical sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Badge variant="secondary">6 Topics Available</Badge>
                <Badge variant="secondary">True/False Format</Badge>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-semibold">Sources:</p>
                <p>• Guyton & Hall Medical Physiology</p>
                <p>• Ganong's Review of Medical Physiology</p>
                <p>• Boron & Boulpaep Medical Physiology</p>
                <p>• TeachMePhysiology.com</p>
                <p>• Kenhub.com</p>
              </div>
              <Badge variant="secondary">AI-Generated</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render topic selection
  const renderTopicSelection = () => {
    const topics = examType === 'anatomy' ? anatomyTopics : physiologyTopics;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>
              Select {examType === 'anatomy' ? 'Anatomy' : 'Physiology'} Topics
            </h2>
            <p style={{ color: '#2E2E2E' }}>Choose the topics you want to include in your exam</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Diverse Subtopic Coverage:</strong> Questions will cover different aspects within each topic. 
                For example, selecting "Thorax" includes ribs, sternum, vertebrae, intercostals, pleura, lungs, heart, and mediastinum.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setExamStep('select-type')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exam Types
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Card 
              key={topic.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedTopics.includes(topic.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => {
                if (selectedTopics.includes(topic.id)) {
                  setSelectedTopics(selectedTopics.filter(id => id !== topic.id));
                } else {
                  setSelectedTopics([...selectedTopics, topic.id]);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" style={{ color: '#1C1C1C' }}>
                    {topic.name}
                  </CardTitle>
                  {selectedTopics.includes(topic.id) && (
                    <CheckCircle className="w-5 h-5" style={{ color: '#3399FF' }} />
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {selectedTopics.length > 0 && (
          <div className="text-center">
            <Button 
              onClick={() => setExamStep('select-count')}
              size="lg"
              style={{ backgroundColor: '#3399FF' }}
            >
              Continue with {selectedTopics.length} topic{selectedTopics.length > 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render stem count selection
  const renderStemCountSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Configure Your Exam</h2>
          <p style={{ color: '#2E2E2E' }}>Choose the number of stems for your exam</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setExamStep('select-topics')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto" style={{ backgroundColor: '#F7FAFC' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1C1C1C' }}>Exam Configuration</CardTitle>
          <CardDescription style={{ color: '#2E2E2E' }}>
            Customize your exam settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium" style={{ color: '#1C1C1C' }}>
              Number of Stems: {stemCount}
            </Label>
            <div className="mt-2">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={stemCount}
                onChange={(e) => setStemCount(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>5</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2" style={{ color: '#1C1C1C' }}>Exam Summary</h4>
            <div className="space-y-1 text-sm" style={{ color: '#2E2E2E' }}>
              <p>Type: {examType === 'anatomy' ? 'Anatomy' : 'Physiology'}</p>
              <p>Topics: {selectedTopics.length} selected</p>
              <p>Stems: {stemCount}</p>
              <p>Estimated time: {Math.ceil(stemCount * 1.5)} minutes</p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => generateCustomExam(selectedTopics, stemCount, examType)}
              size="lg"
              disabled={isGeneratingExam}
              style={{ backgroundColor: '#3399FF' }}
            >
              {isGeneratingExam ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating from Medical Sources...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Exam
                </>
              )}
            </Button>
            
            {examError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  <strong>Error:</strong> {examError}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setExamError(null)}
                >
                  Dismiss
            </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authoritative Sources Loading Screen */}
      {isGeneratingExam && (
        <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-8"></div>

            <h2 className="text-3xl font-bold text-black mb-4">Generating Medical Exam</h2>
            <p className="text-xl text-gray-600 mb-8">
              Creating {stemCount} professional {examType} questions from authoritative medical sources
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4">
                {examType === 'anatomy' ? 'Anatomy' : 'Physiology'} Sources Referenced:
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm text-blue-700">
                {examType === 'anatomy' ? (
                  <>
                    <p>• Snell's Clinical Anatomy (Richard S. Snell)</p>
                    <p>• Gray's Anatomy for Students (Drake, Vogl, Mitchell)</p>
                    <p>• Clinically Oriented Anatomy (Keith L. Moore)</p>
                    <p>• TeachMeAnatomy.info educational content</p>
                    <p>• Kenhub.com anatomy resources</p>
                  </>
                ) : (
                  <>
                    <p>• Guyton & Hall Textbook of Medical Physiology</p>
                    <p>• Ganong's Review of Medical Physiology</p>
                    <p>• Boron & Boulpaep Medical Physiology</p>
                    <p>• TeachMePhysiology.com educational content</p>
                    <p>• Kenhub.com physiology resources</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Diverse Coverage:</strong> Questions will span multiple subtopics within your selected areas, 
                ensuring comprehensive coverage from trusted medical education sources.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );



  const renderQuizTypeSelection = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">Medical Quizzes</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300">Choose your learning path and start practicing</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-3 sm:px-4">
        {/* AI Generator */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
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
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">AI-Powered</Badge>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Personalized</Badge>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Adaptive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cadaver Quiz */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
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
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Real Images</Badge>
              <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">7 Topics</Badge>
              <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">Interactive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Histology Slide Quiz */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
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
              <Badge variant="secondary" className="text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">Microscopic Images</Badge>
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">Histology</Badge>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Detailed</Badge>
            </div>
          </CardContent>
        </Card>

        {/* MCQ Questions */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
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
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Anatomy & Physiology</Badge>
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Categorized</Badge>
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Instant Feedback</Badge>
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
              <Badge variant="secondary">Specialized</Badge>
              <Badge variant="secondary">Microscopic</Badge>
              <Badge variant="secondary">Development</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Customize Exam - NEW FEATURE */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 relative overflow-hidden"
          style={{ backgroundColor: '#D1E8F9', border: '2px solid #3399FF' }}
          onClick={() => {
            setSelectedMCQSubject('customize-exam');
            setExamStep('select-type');
          }}
        >
          <div className="absolute top-2 right-2">
            <Badge style={{ backgroundColor: '#3399FF', color: 'white' }} className="text-xs">NEW!</Badge>
          </div>
          <CardHeader className="text-center">
            <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Customize Exam!</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Create personalized exam with AI-generated stems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">AI-Generated</Badge>
              <Badge variant="secondary">Custom Topics</Badge>
              <Badge variant="secondary">Stem Format</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMCQCategories = () => {
    let categories: string[] = [];
    let subjectTitle = 'MCQ Categories';

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

    // If no categories found, return to subject selection
    if (!categories || categories.length === 0) {
      return renderMCQSubjects();
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
                if (category === 'Upper Limb') {
                  // For Upper Limb, show mode selection instead of direct quiz
                  setSelectedCategory(category);
                  setSelectedUpperLimbMode('topical'); // Default to topical
                  fetchUpperLimbTopics();
                } else {
                setSelectedCategory(category);
                fetchQuestions(category);
                }
              }}
            >
              <CardHeader className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
                <CardTitle style={{ color: '#1C1C1C' }}>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {category === 'Upper Limb' ? (
                    <div className="space-y-2">
                      <Badge variant="secondary">Topical Questions</Badge>
                      <Badge variant="secondary">Exam Mode</Badge>
                    </div>
                  ) : (
                  <Badge variant="secondary">Practice Questions</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render Upper Limb mode selection (Topical Questions vs Exam)
  const renderUpperLimbModeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Upper Limb</h2>
          <p style={{ color: '#2E2E2E' }}>Choose your learning mode</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedCategory(null);
            setSelectedUpperLimbMode(null);
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Topical Questions */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => {
            setSelectedUpperLimbMode('topical');
            fetchUpperLimbTopics();
          }}
        >
          <CardHeader className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Topical Questions</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Practice questions organized by specific Upper Limb topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">9 Topics Available</Badge>
              <Badge variant="secondary">Focused Learning</Badge>
              <Badge variant="secondary">Topic-Specific</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Exam Mode */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => {
            setSelectedUpperLimbMode('exam');
            setSelectedCategory('Upper Limb');
            fetchQuestions('Upper Limb');
          }}
        >
          <CardHeader className="text-center">
            <Target className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle className="text-2xl" style={{ color: '#1C1C1C' }}>Exam Mode</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Comprehensive exam with questions from all Upper Limb topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Mixed Topics</Badge>
              <Badge variant="secondary">Exam Simulation</Badge>
              <Badge variant="secondary">Comprehensive</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render Upper Limb topic selection
  const renderUpperLimbTopicSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Upper Limb Topics</h2>
          <p style={{ color: '#2E2E2E' }}>Select a topic to practice with focused questions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedUpperLimbMode(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mode Selection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(availableTopics.length > 0 ? availableTopics : upperLimbTopics).map((topic) => (
          <Card 
            key={topic}
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
            style={{ backgroundColor: '#F7FAFC' }}
            onClick={() => {
              setSelectedTopic(topic);
              fetchMcqQuestions(topic, 'Upper Limb');
            }}
          >
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <CardTitle style={{ color: '#1C1C1C' }}>{topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge variant="secondary">Topic Questions</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render MCQ Quiz (for topical questions)
  const renderMcqQuiz = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3399FF' }}></div>
        </div>
      );
    }

    if (mcqQuestions.length === 0) {
      return (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#1C1C1C' }}>No Questions Available</h3>
          <p style={{ color: '#2E2E2E' }}>No questions found for this topic. Please try another topic.</p>
          <Button 
            onClick={() => setSelectedTopic(null)}
            className="mt-4"
            variant="outline"
          >
            Back to Topics
          </Button>
        </div>
      );
    }

    if (mcqCompleted) {
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
                    {String(mcqScore)}/{String(mcqQuestions.length)}
                  </div>
                  <p className="text-sm" style={{ color: '#2E2E2E' }}>Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#3399FF' }}>
                    {getMcqScorePercentage()}%
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
                  onClick={() => fetchMcqQuestions(selectedTopic!, 'Upper Limb')}
                  style={{ backgroundColor: '#3399FF' }}
                >
                  Take Another Quiz
                </Button>
                <Button 
                  onClick={() => setSelectedTopic(null)}
                  variant="outline"
                >
                  Back to Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentQuestion = mcqQuestions[currentMcqIndex];
    const progress = ((currentMcqIndex + 1) / mcqQuestions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>{selectedTopic} Quiz</h2>
            <p style={{ color: '#2E2E2E' }}>Question {String(currentMcqIndex + 1)} of {String(mcqQuestions.length)}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedTopic(null)}
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
                const isSelected = selectedMcqAnswer === option;
                const isCorrect = option === currentQuestion.correct_answer;

                let buttonStyle = 'w-full p-6 border-2 rounded-lg transition-all duration-200 flex items-center justify-between ';

                if (isMcqAnswered) {
                  if (isCorrect) {
                    buttonStyle += 'border-green-500 bg-green-50 text-green-900';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle += 'border-red-500 bg-red-50 text-red-900';
                  } else {
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
                    onClick={() => handleMcqAnswerSelect(option)}
                    disabled={isMcqAnswered}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${
                        option === 'True' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'
                      }`}>
                        {option === 'True' ? '✓' : '✗'}
                      </div>
                      <span className="text-lg font-semibold">{option}</span>
                    </div>
                    {isMcqAnswered && (
                      <div>
                        {isCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                        {isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-600" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {isMcqAnswered && (
              <div className="mt-6 space-y-4">
                {/* Next Question Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={handleNextMcqQuestion}
                    style={{ backgroundColor: '#3399FF' }}
                    size="lg"
                  >
                    {currentMcqIndex < mcqQuestions.length - 1 ? (
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
                    Answer: {selectedMcqAnswer === currentQuestion.correct_answer ? 'Correct' : 'Incorrect'}
                  </h4>
                  {currentQuestion.explanation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Short Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.explanation}</p>
                    </div>
                  )}
                  {currentQuestion.detailedExplanation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Detailed Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.detailedExplanation}</p>
                    </div>
                  )}
                  {currentQuestion.ai_explanation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>AI Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.ai_explanation}</p>
                    </div>
                  )}
                  {currentQuestion.reference && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Reference:</p>
                      <p className="text-sm font-mono text-blue-600" style={{ color: '#1E40AF' }}>{currentQuestion.reference}</p>
                    </div>
                  )}
                  {currentQuestion.reference_data && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Additional Reference:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.reference_data}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Short Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.explanation}</p>
                    </div>
                  )}
                  {currentQuestion.detailedExplanation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Detailed Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.detailedExplanation}</p>
                    </div>
                  )}
                  {currentQuestion.ai_explanation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>AI Explanation:</p>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>{currentQuestion.ai_explanation}</p>
                    </div>
                  )}
                  {currentQuestion.reference && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Reference:</p>
                      <p className="text-sm font-mono text-blue-600" style={{ color: '#1E40AF' }}>{currentQuestion.reference}</p>
                    </div>
                  )}
                  {currentQuestion.reference_data && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#1C1C1C' }}>Additional Reference:</p>
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Question Generator</h2>
          <p className="text-gray-600 dark:text-gray-300">Create personalized medical questions using DeepSeek AI</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedQuizType(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quiz Types
        </Button>
      </div>

      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="w-5 h-5" style={{ color: '#3399FF' }} />
            DeepSeek AI Medical Tutor
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Ask me to generate questions on any medical topic, specify difficulty level, or request explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-700">
              {aiMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                  <Bot className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
                  <p>Start a conversation! Ask me to generate questions on any medical topic.</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Example prompts:</p>
                    <div className="space-y-1 text-left max-w-md mx-auto">
                      <p className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">"Generate 5 cardiology questions about arrhythmias"</p>
                      <p className="bg-green-50 dark:bg-green-900/20 p-2 rounded">"Create anatomy questions on the nervous system"</p>
                      <p className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">"I need pharmacology questions, intermediate level"</p>
                    </div>
                  </div>
                </div>
              ) : (
                aiMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <ReactMarkdown 
                        className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-strong:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700"
                        components={{
                          p: ({ children }: { children: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          li: ({ children }: { children: React.ReactNode }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                          h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-lg font-bold text-gray-800 mb-2">{children}</h1>,
                          h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-base font-bold text-gray-800 mb-2">{children}</h2>,
                          h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-sm font-bold text-gray-800 mb-1">{children}</h3>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#3399FF' }}></div>
                      <span>Generating questions with DeepSeek AI...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Ask me to generate questions on any medical topic... (e.g., 'Generate 5 cardiology questions about arrhythmias')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiSubmit();
                    }
                  }}
                  className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  rows={3}
                />
                <Button 
                  onClick={handleAiSubmit}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiPrompt("Generate 5 anatomy questions about the cardiovascular system")}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Cardiovascular
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiPrompt("Create 5 physiology questions about respiratory system")}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  <Activity className="w-3 h-3 mr-1" />
                  Respiratory
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiPrompt("Generate 5 pharmacology questions about antibiotics")}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  <Brain className="w-3 h-3 mr-1" />
                  Pharmacology
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiPrompt("Create 5 pathology questions about cancer")}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  <Microscope className="w-3 h-3 mr-1" />
                  Pathology
                </Button>
              </div>

              {questions.length > 0 && (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-green-800 dark:text-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Quiz Ready!</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      {questions.length} AI-generated questions loaded successfully
                    </p>
                  </div>
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

  // Function to handle category selection
  const handleCategorySelect = (category: string) => {
      setSelectedCategory(category);
      fetchQuestions(category);
  };

  // Handle customize exam rendering FIRST (before other MCQ logic)
  if (selectedMCQSubject === 'customize-exam') {
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
                <h1 className="text-4xl font-bold" style={{ color: '#1C1C1C' }}>Customize Exam</h1>
              </div>
            </div>
          </div>

          {examStep === 'select-type' && renderCustomizeExamTypeSelection()}
          {examStep === 'select-topics' && renderTopicSelection()}
          {examStep === 'select-count' && renderStemCountSelection()}
          {examStep === 'exam' && renderCustomExam()}
          {examStep === 'results' && renderExamResults()}
          {examStep === 'review' && renderExamReview()}
        </div>
      </div>
    );
  }

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

  if (selectedQuizType === 'mcq' && selectedMCQSubject && selectedMCQSubject !== 'customize-exam' && !selectedCategory) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderMCQCategories()}
        </div>
      </div>
    );
  }

  // Upper Limb specific flow
  if (selectedQuizType === 'mcq' && selectedCategory === 'Upper Limb') {
    if (selectedUpperLimbMode === null) {
      return (
        <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto px-8 py-12">
            {renderUpperLimbModeSelection()}
          </div>
        </div>
      );
    }

    if (selectedUpperLimbMode === 'topical') {
      if (selectedTopic === null) {
        return (
          <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="max-w-6xl mx-auto px-8 py-12">
              {renderUpperLimbTopicSelection()}
            </div>
          </div>
        );
      }

      if (mcqQuestions.length > 0) {
        return (
          <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="max-w-4xl mx-auto px-8 py-12">
              {renderMcqQuiz()}
            </div>
          </div>
        );
      }
    }

    if (selectedUpperLimbMode === 'exam' && questions.length > 0) {
      return (
        <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-4xl mx-auto px-8 py-12">
            {renderMCQQuiz()}
          </div>
        </div>
      );
    }
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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Medical Quiz Platform</h1>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Medical Quiz Platform</h2>
          <p className="text-gray-700 dark:text-gray-300">Test your knowledge with our comprehensive medical quizzes</p>
        </div>
        {renderQuizTypeSelection()}
      </div>
    </div>
  );
}