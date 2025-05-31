import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, Image, Clock, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QuizQuestion from "@/components/quizzes/quiz-question";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { sendAiChatMessage } from "@/lib/openai";

export default function Quizzes() {
  const { user } = useAuth();
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
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: quizzes, isLoading: loadingQuizzes, error: quizzesError } = useQuery({
    queryKey: ['/api/quizzes'],
  });
  
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: [`/api/quiz-questions/${activeQuiz}`],
    enabled: !!activeQuiz
  });
  
  const { data: categories } = useQuery({
    queryKey: ['/api/note-categories']
  });
  
  // Create quiz mutation
  const createQuiz = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await apiRequest("POST", "/api/quizzes", quizData);
      return response.json();
    }
  });
  
  // Create quiz question mutation
  const createQuizQuestion = useMutation({
    mutationFn: async (questionData: any) => {
      const response = await apiRequest("POST", "/api/quiz-questions", questionData);
      return response.json();
    }
  });
  
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
    
    // Count correct answers
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    
    try {
      // Submit quiz result
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
          timeTaken: 900 // Mock time taken in seconds
        }),
      });
      
      // Reset quiz state
      setActiveQuiz(null);
      setCurrentQuestion(0);
      setSelectedAnswers({});
    } catch (error) {
      console.error('Failed to submit quiz attempt:', error);
    }
  };
  
  // Generate quiz with AI
  const generateQuizWithAI = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate quizzes.",
        variant: "destructive",
      });
      return;
    }

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

    try {
      setIsGenerating(true);
      
      // First create the quiz
      const quizResponse = await createQuiz.mutateAsync({
        title: `${aiTopic} Quiz`,
        description: `AI-generated quiz about ${aiTopic}`,
        categoryId: parseInt(selectedCategory),
        difficulty: aiDifficulty,
        isTimedExam: false
      });
      
      const newQuizId = quizResponse.id;
      
      // Generate questions using AI
      const count = parseInt(aiQuestionCount) || 5;
      const prompt = `Create ${count} multiple choice questions about ${aiTopic} for medical students. Format them as a JSON array with each question having the following properties: 'question', 'options' (array of 4 choices), 'correctAnswerIndex' (0-3), and 'explanation'. Return only valid JSON without additional text.`;
      
      const response = await sendAiChatMessage({
        userId: user.id,
        question: prompt
      });
      
      // Parse JSON from response
      try {
        // Try to locate JSON in the response
        const jsonMatch = response.answer.match(/\[[\s\S]*\]/);
        let questionsData = [];
        
        if (jsonMatch) {
          questionsData = JSON.parse(jsonMatch[0]);
        } else {
          // Try parsing the whole response if it might be JSON
          questionsData = JSON.parse(response.answer);
        }
        
        // Create each question
        for (const q of questionsData) {
          await createQuizQuestion.mutateAsync({
            quizId: newQuizId,
            question: q.question,
            options: q.options,
            correctAnswer: q.options[q.correctAnswerIndex],
            explanation: q.explanation
          });
        }
        
        toast({
          title: "Quiz generated",
          description: `Successfully generated a quiz with ${questionsData.length} questions about ${aiTopic}.`,
        });
        
        setAiDialogOpen(false);
        setAiTopic("");
        
        // Refresh quizzes
        window.location.reload();
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        toast({
          title: "Processing error",
          description: "Could not process the AI response. Please try again or create a quiz manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("AI quiz generation error:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate quiz. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="py-12 bg-gray-50 dark:bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-secondary-600 dark:text-secondary-400 font-semibold tracking-wide uppercase">Test Your Knowledge</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Comprehensive Quizzes
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            Challenge yourself with thousands of MCQs, image-based questions, and timed exams.
          </p>
        </div>

        <div className="mt-10">
          {activeQuiz && questions ? (
            <Card className="bg-white dark:bg-dark-700 shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-dark-600">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {quizzes?.find(q => q.id === activeQuiz)?.title || 'Quiz'}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-white dark:bg-dark-700">
                {loadingQuestions ? (
                  <CardSkeleton height="h-80" />
                ) : (
                  <QuizQuestion 
                    question={questions[currentQuestion]}
                    selectedAnswer={selectedAnswers[questions[currentQuestion].id] || ''}
                    onAnswerSelect={(answer) => handleAnswerSelect(questions[currentQuestion].id, answer)}
                  />
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
              
              <div className="px-6 py-4 bg-gray-50 dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600">
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
          ) : (
            <>
              {loadingQuizzes ? (
                <div className="space-y-4">
                  <CardSkeleton height="h-40" />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
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
                    <Card className="bg-white dark:bg-dark-700 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
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
                      <div className="bg-gray-50 dark:bg-dark-800 px-5 py-3">
                        <div className="text-sm">
                          <Button variant="link" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 p-0">
                            Browse topics &rarr;
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-white dark:bg-dark-700 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-secondary-500 rounded-md p-3">
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
                      <div className="bg-gray-50 dark:bg-dark-800 px-5 py-3">
                        <div className="text-sm">
                          <Button variant="link" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 p-0">
                            Practice with images &rarr;
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-white dark:bg-dark-700 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-accent-500 rounded-md p-3">
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
                      <div className="bg-gray-50 dark:bg-dark-800 px-5 py-3">
                        <div className="text-sm">
                          <Button variant="link" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 p-0">
                            Test yourself &rarr;
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Quizzes</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {quizzes?.map((quiz) => (
                      <Card key={quiz.id} className="bg-white dark:bg-dark-700 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                        <div className="p-5">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{quiz.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">{quiz.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200">
                              {quiz.questionCount} questions
                            </span>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200 capitalize">
                              {quiz.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-800 px-5 py-3 border-t border-gray-200 dark:border-dark-600">
                          <Button 
                            variant="link" 
                            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 p-0"
                            onClick={() => setActiveQuiz(quiz.id)}
                          >
                            Start Quiz &rarr;
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
