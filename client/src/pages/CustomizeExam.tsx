import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain, 
  Heart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  FileText,
  ArrowLeft,
  Timer,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { v4 as uuidv4 } from 'uuid';

interface Topic {
  id: number;
  name: string;
  slug: string;
}

interface StemOption {
  id: string;
  optionLetter: string;
  statement: string;
  answer: boolean;
  explanation: string;
}

interface ExamStem {
  id: string;
  stemText: string;
  orderIndex: number;
  options: StemOption[];
}

interface CustomExam {
  id: string;
  examType: string;
  topicIds: number[];
  stemCount: number;
  durationSeconds: number;
  stems: ExamStem[];
}

interface StudentAnswer {
  stemOptionId: string;
  studentAnswer: boolean | null;
}

export default function CustomizeExam() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<'select-type' | 'select-topics' | 'select-count' | 'exam' | 'results'>('select-type');
  const [examType, setExamType] = useState<'anatomy' | 'physiology' | ''>('');
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [stemCount, setStemCount] = useState<number>(10);
  const [currentExam, setCurrentExam] = useState<CustomExam | null>(null);
  const [currentStemIndex, setCurrentStemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examResults, setExamResults] = useState<any>(null);

  // Fetch available topics based on exam type
  const { data: topics = [] } = useQuery({
    queryKey: ['/api/topics', examType],
    queryFn: async () => {
      if (!examType) return [];
      const response = await fetch(`/api/topics?type=${examType}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      return response.json();
    },
    enabled: !!examType,
  });

  // Generate exam with AI stems
  const generateExamMutation = useMutation({
    mutationFn: async (examData: {
      examType: string;
      topicIds: number[];
      stemCount: number;
    }) => {
      const response = await fetch('/api/custom-exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...examData,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate exam');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentExam(data.exam);
      setTimeRemaining(data.exam.durationSeconds);
      setStep('exam');
    },
  });

  // Submit exam answers
  const submitExamMutation = useMutation({
    mutationFn: async (examAnswers: {
      examId: string;
      answers: Record<string, boolean | null>;
    }) => {
      const response = await fetch('/api/custom-exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examAnswers),
      });
      if (!response.ok) throw new Error('Failed to submit exam');
      return response.json();
    },
    onSuccess: (data) => {
      setExamResults(data);
      setStep('results');
    },
  });

  // Timer countdown
  useEffect(() => {
    if (step === 'exam' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            if (currentExam) {
              submitExamMutation.mutate({
                examId: currentExam.id,
                answers,
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeRemaining, currentExam, answers]);

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

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleAnswerChange = (optionId: string, answer: boolean | null) => {
    setAnswers(prev => ({
      ...prev,
      [optionId]: answer
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStem = currentExam?.stems[currentStemIndex];

  if (!user) {
    return (
      <div className="min-h-screen bg-docdot-light flex items-center justify-center">
        <Card className="card-docdot p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-heading mb-4">Authentication Required</h2>
            <p className="text-body mb-6">Please sign in to access the customize exam feature.</p>
            <Button onClick={() => setLocation('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-docdot-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/quiz')}
              className="hover:bg-[#D1E8F9]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Button>
            <h1 className="text-3xl font-bold text-heading">Customize Exam</h1>
          </div>
          {step === 'exam' && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-primary-docdot">
                <Timer className="w-5 h-5 mr-2" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <Badge variant="outline" style={{ backgroundColor: '#D1E8F9', color: '#2E2E2E' }}>
                Question {currentStemIndex + 1} of {currentExam?.stems.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Step 1: Select Exam Type */}
        {step === 'select-type' && (
          <div className="space-y-6">
            <Card className="card-docdot">
              <CardHeader>
                <CardTitle className="text-heading flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-primary-docdot" />
                  Choose Your Exam Type
                </CardTitle>
                <CardDescription className="text-body">
                  Select the subject area for your customized exam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      examType === 'anatomy' 
                        ? 'border-primary-docdot bg-[#D1E8F9]' 
                        : 'border-[#D1E8F9] hover:border-primary-docdot'
                    }`}
                    onClick={() => setExamType('anatomy')}
                  >
                    <CardContent className="p-6 text-center">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-primary-docdot" />
                      <h3 className="text-xl font-bold text-heading mb-2">Anatomy Standard Exam</h3>
                      <p className="text-body">Test your knowledge of human anatomy structures</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      examType === 'physiology' 
                        ? 'border-primary-docdot bg-[#D1E8F9]' 
                        : 'border-[#D1E8F9] hover:border-primary-docdot'
                    }`}
                    onClick={() => setExamType('physiology')}
                  >
                    <CardContent className="p-6 text-center">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-primary-docdot" />
                      <h3 className="text-xl font-bold text-heading mb-2">Physiology Standard Exam</h3>
                      <p className="text-body">Explore body functions and processes</p>
                    </CardContent>
                  </Card>
                </div>

                {examType && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={() => setStep('select-topics')}
                      className="btn-primary"
                      style={{ backgroundColor: '#3399FF' }}
                    >
                      Continue
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Select Topics */}
        {step === 'select-topics' && (
          <div className="space-y-6">
            <Card className="card-docdot">
              <CardHeader>
                <CardTitle className="text-heading flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-primary-docdot" />
                  Select Topics for {examType === 'anatomy' ? 'Anatomy' : 'Physiology'} Exam
                </CardTitle>
                <CardDescription className="text-body">
                  Choose the specific topics you want to be tested on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(examType === 'anatomy' ? anatomyTopics : physiologyTopics).map((topic) => (
                    <div key={topic.id} className="flex items-center space-x-3 p-3 rounded-lg border border-[#D1E8F9] hover:bg-[#D1E8F9] transition-colors">
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={selectedTopics.includes(topic.id)}
                        onCheckedChange={() => handleTopicToggle(topic.id)}
                      />
                      <label 
                        htmlFor={`topic-${topic.id}`}
                        className="flex-1 text-body font-medium cursor-pointer"
                      >
                        {topic.name}
                      </label>
                    </div>
                  ))}
                </div>

                {selectedTopics.length > 0 && (
                  <div className="flex justify-between items-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep('select-type')}
                      className="hover:bg-[#D1E8F9]"
                    >
                      Back
                    </Button>
                    <div className="flex items-center space-x-4">
                      <span className="text-body">
                        {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
                      </span>
                      <Button 
                        onClick={() => setStep('select-count')}
                        className="btn-primary"
                        style={{ backgroundColor: '#3399FF' }}
                      >
                        Continue
                        <Play className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Select Question Count */}
        {step === 'select-count' && (
          <div className="space-y-6">
            <Card className="card-docdot">
              <CardHeader>
                <CardTitle className="text-heading flex items-center">
                  <Award className="w-6 h-6 mr-3 text-primary-docdot" />
                  Choose Number of Questions
                </CardTitle>
                <CardDescription className="text-body">
                  Select how many stems you want in your exam (2 minutes per stem)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[10, 20, 40, 75].map((count) => (
                    <Card 
                      key={count}
                      className={`cursor-pointer transition-all duration-300 border-2 ${
                        stemCount === count 
                          ? 'border-primary-docdot bg-[#D1E8F9]' 
                          : 'border-[#D1E8F9] hover:border-primary-docdot'
                      }`}
                      onClick={() => setStemCount(count)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-heading mb-2">{count}</div>
                        <div className="text-sm text-body mb-1">
                          {count === 75 ? 'Professional' : 'Questions'}
                        </div>
                        <div className="text-xs text-body/70">
                          {count * 2} minutes
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('select-topics')}
                    className="hover:bg-[#D1E8F9]"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      generateExamMutation.mutate({
                        examType,
                        topicIds: selectedTopics,
                        stemCount,
                      });
                    }}
                    disabled={generateExamMutation.isPending}
                    className="btn-primary"
                    style={{ backgroundColor: '#3399FF' }}
                  >
                    {generateExamMutation.isPending ? 'Generating...' : 'Start Exam'}
                    <Play className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Exam Interface */}
        {step === 'exam' && currentStem && (
          <div className="space-y-6">
            <Card className="card-docdot">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-heading">
                      Question {currentStemIndex + 1}
                    </CardTitle>
                    <CardDescription className="text-body">
                      Mark each statement as True (T) or False (F)
                    </CardDescription>
                  </div>
                  <Progress 
                    value={(currentStemIndex / (currentExam?.stems.length || 1)) * 100} 
                    className="w-32"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-[#D1E8F9] p-4 rounded-lg">
                  <h3 className="font-bold text-heading text-lg mb-4">
                    {currentStem.stemText}
                  </h3>
                </div>

                <div className="space-y-4">
                  {currentStem.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-4 p-3 border border-[#D1E8F9] rounded-lg">
                      <span className="font-bold text-heading w-6">
                        {option.optionLetter})
                      </span>
                      <span className="flex-1 text-body">
                        {option.statement}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant={answers[option.id] === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAnswerChange(option.id, true)}
                          className={answers[option.id] === true ? "bg-green-500 hover:bg-green-600" : "hover:bg-green-50"}
                        >
                          T
                        </Button>
                        <Button
                          variant={answers[option.id] === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAnswerChange(option.id, false)}
                          className={answers[option.id] === false ? "bg-red-500 hover:bg-red-600" : "hover:bg-red-50"}
                        >
                          F
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStemIndex(Math.max(0, currentStemIndex - 1))}
                    disabled={currentStemIndex === 0}
                    className="hover:bg-[#D1E8F9]"
                  >
                    Previous
                  </Button>
                  
                  {currentStemIndex < (currentExam?.stems.length || 0) - 1 ? (
                    <Button 
                      onClick={() => setCurrentStemIndex(currentStemIndex + 1)}
                      className="btn-primary"
                      style={{ backgroundColor: '#3399FF' }}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        if (currentExam) {
                          submitExamMutation.mutate({
                            examId: currentExam.id,
                            answers,
                          });
                        }
                      }}
                      disabled={submitExamMutation.isPending}
                      className="btn-primary"
                      style={{ backgroundColor: '#3399FF' }}
                    >
                      {submitExamMutation.isPending ? 'Submitting...' : 'Submit Exam'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 'results' && examResults && (
          <div className="space-y-6">
            <Card className="card-docdot">
              <CardHeader className="text-center">
                <CardTitle className="text-heading text-3xl mb-4">
                  Exam Complete!
                </CardTitle>
                <div className="text-6xl font-bold text-primary-docdot mb-2">
                  {examResults.percentage}%
                </div>
                <CardDescription className="text-body text-lg">
                  Score: {examResults.correct} correct, {examResults.incorrect} incorrect, {examResults.unanswered} unanswered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{examResults.correct}</div>
                    <div className="text-sm text-green-700">Correct</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold text-red-600">{examResults.incorrect}</div>
                    <div className="text-sm text-red-700">Incorrect</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-600">{examResults.unanswered}</div>
                    <div className="text-sm text-gray-700">Unanswered</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => setLocation(`/exam-review/${currentExam?.id}`)}
                    className="btn-primary"
                    style={{ backgroundColor: '#3399FF' }}
                  >
                    Review Exam
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStep('select-type');
                      setExamType('');
                      setSelectedTopics([]);
                      setStemCount(10);
                      setCurrentExam(null);
                      setAnswers({});
                      setExamResults(null);
                    }}
                    className="hover:bg-[#D1E8F9]"
                  >
                    Take Another Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}