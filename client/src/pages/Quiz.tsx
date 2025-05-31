import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Brain, 
  Heart, 
  Eye, 
  Bone, 
  Microscope,
  Baby,
  CheckCircle,
  XCircle,
  Clock,
  Trophy
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: any;
  topicCount: number;
  color: string;
}

interface Topic {
  id: number;
  name: string;
  type: 'gross_anatomy' | 'histology' | 'embryology';
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  xpReward: number;
}

export default function Quiz() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const categories: Category[] = [
    {
      id: 1,
      name: 'Anatomy',
      description: 'Human body structure and organization',
      icon: Bone,
      topicCount: 12,
      color: 'blue'
    },
    {
      id: 2,
      name: 'Physiology',
      description: 'Body functions and processes',
      icon: Heart,
      topicCount: 8,
      color: 'red'
    },
    {
      id: 3,
      name: 'Histology',
      description: 'Microscopic tissue structure',
      icon: Microscope,
      topicCount: 6,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Embryology',
      description: 'Development and formation',
      icon: Baby,
      topicCount: 4,
      color: 'green'
    }
  ];

  const anatomyTopics: Topic[] = [
    { id: 1, name: 'Head and Neck', type: 'gross_anatomy', questionCount: 25, difficulty: 'medium' },
    { id: 2, name: 'Upper Limb', type: 'gross_anatomy', questionCount: 30, difficulty: 'medium' },
    { id: 3, name: 'Thorax', type: 'gross_anatomy', questionCount: 28, difficulty: 'hard' },
    { id: 4, name: 'Abdomen', type: 'gross_anatomy', questionCount: 35, difficulty: 'hard' },
    { id: 5, name: 'Pelvis', type: 'gross_anatomy', questionCount: 20, difficulty: 'medium' },
    { id: 6, name: 'Lower Limb', type: 'gross_anatomy', questionCount: 32, difficulty: 'medium' }
  ];

  const sampleQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Which muscle is responsible for elevating the mandible during mastication?",
      options: [
        "Temporalis",
        "Masseter", 
        "Medial pterygoid",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: "All three muscles (temporalis, masseter, and medial pterygoid) work together to elevate the mandible during chewing. The temporalis provides the main lifting force, while the masseter and medial pterygoid assist in this action.",
      difficulty: "medium",
      xpReward: 15
    },
    {
      id: 2,
      question: "The facial nerve (CN VII) provides motor innervation to which group of muscles?",
      options: [
        "Muscles of mastication",
        "Muscles of facial expression",
        "Extraocular muscles",
        "Muscles of the tongue"
      ],
      correctAnswer: 1,
      explanation: "The facial nerve (cranial nerve VII) provides motor innervation to the muscles of facial expression, including the orbicularis oculi, orbicularis oris, and other muscles that control facial movements and expressions.",
      difficulty: "easy",
      xpReward: 10
    }
  ];

  const startQuiz = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentQuiz(sampleQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + currentQuestion.xpReward);
    }
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'gross_anatomy': return 'Gross Anatomy';
      case 'histology': return 'Histology';
      case 'embryology': return 'Embryology';
      default: return type;
    }
  };

  if (quizCompleted) {
    const percentage = Math.round((score / (currentQuiz.length * 15)) * 100);
    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Card className="text-center">
            <CardHeader>
              <Trophy className="text-yellow-500 mx-auto mb-4" size={64} />
              <CardTitle className="text-2xl text-docdot-heading">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-3xl font-bold text-docdot-blue">{score} XP</p>
                <p className="text-docdot-text">Total Points Earned</p>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-docdot-heading">{percentage}%</p>
                <p className="text-docdot-text">Accuracy Score</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()} className="bg-docdot-blue">
                  Try Again
                </Button>
                <Link href="/home">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentQuiz.length > 0) {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;

    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setCurrentQuiz([])}>
              <ArrowLeft className="mr-2" size={16} />
              Back to Topics
            </Button>
            <div className="text-center">
              <p className="text-docdot-text">Question {currentQuestionIndex + 1} of {currentQuiz.length}</p>
              <Progress value={progress} className="w-64 mt-2" />
            </div>
            <div className="text-right">
              <p className="text-docdot-text">Score: {score} XP</p>
            </div>
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                <div className="flex items-center text-docdot-text">
                  <Clock size={16} className="mr-1" />
                  <span>{currentQuestion.xpReward} XP</span>
                </div>
              </div>
              <CardTitle className="text-xl text-docdot-heading mt-4">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full text-left justify-start h-auto py-4 px-4 ${
                      selectedAnswer === index 
                        ? showExplanation
                          ? index === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-docdot-blue bg-docdot-blue-light'
                        : showExplanation && index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : ''
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center">
                      {showExplanation && (
                        <div className="mr-3">
                          {index === currentQuestion.correctAnswer ? (
                            <CheckCircle className="text-green-600" size={20} />
                          ) : selectedAnswer === index ? (
                            <XCircle className="text-red-600" size={20} />
                          ) : null}
                        </div>
                      )}
                      <span>{option}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {showExplanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-docdot-heading mb-2">Explanation:</h4>
                  <p className="text-docdot-text">{currentQuestion.explanation}</p>
                </div>
              )}

              <div className="flex justify-center">
                {!showExplanation ? (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-docdot-blue"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextQuestion}
                    className="bg-docdot-blue"
                  >
                    {currentQuestionIndex < currentQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    const topics = selectedCategory.name === 'Anatomy' ? anatomyTopics : [];
    
    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
              <ArrowLeft className="mr-2" size={16} />
              Back to Categories
            </Button>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-docdot-heading">{selectedCategory.name} Topics</h1>
              <p className="text-docdot-text">{selectedCategory.description}</p>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-docdot-heading">{topic.name}</CardTitle>
                    <Badge className={getDifficultyColor(topic.difficulty)}>
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-docdot-text">{getTypeLabel(topic.type)}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-docdot-text">{topic.questionCount} questions</span>
                    <Brain className="text-docdot-blue" size={20} />
                  </div>
                  <Button 
                    onClick={() => startQuiz(topic)}
                    className="w-full bg-docdot-blue"
                  >
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

  return (
    <div className="min-h-screen bg-docdot-bg">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-docdot-heading mb-4">Medical Quizzes</h1>
          <p className="text-xl text-docdot-text">Test your knowledge and earn XP points</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                      <IconComponent className={`text-${category.color}-600`} size={32} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-docdot-heading">{category.name}</CardTitle>
                      <p className="text-docdot-text">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-docdot-text">{category.topicCount} topics available</span>
                    <Button variant="outline" size="sm">
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}