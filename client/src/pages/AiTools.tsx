import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { 
  Brain, 
  Zap, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  FileText,
  Target,
  Lightbulb,
  Stethoscope,
  GraduationCap,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Search,
  PenTool,
  Download,
  Share2,
  Eye,
  ChevronRight,
  Play,
  Bookmark,
  Star,
  CheckCircle,
  HelpCircle,
  Settings,
  Mic,
  Video,
  Calendar,
  Award
} from 'lucide-react';

export default function AiTools() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Tool states
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [concept, setConcept] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState('5');
  const [caseDetails, setCaseDetails] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [studyGoals, setStudyGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [timeframe, setTimeframe] = useState('4 weeks');
  const [currentLevel, setCurrentLevel] = useState('intermediate');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);

  // Results states
  const [explanation, setExplanation] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [caseAnalysis, setCaseAnalysis] = useState('');
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  // AI Tools Configuration
  const aiTools = [
    {
      id: 'tutor',
      name: 'AI Medical Tutor',
      description: 'Interactive chat with medical AI for instant answers and explanations',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      id: 'explain',
      name: 'Concept Explainer',
      description: 'Get detailed explanations of medical concepts and terminology',
      icon: Lightbulb,
      color: 'yellow'
    },
    {
      id: 'questions',
      name: 'Question Generator',
      description: 'Generate practice questions on any medical topic',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'case-study',
      name: 'Case Study Analyzer',
      description: 'Analyze medical cases with AI-powered insights',
      icon: Stethoscope,
      color: 'red'
    },
    {
      id: 'study-plan',
      name: 'Study Plan Creator',
      description: 'Generate personalized study plans based on your goals',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 'recommendations',
      name: 'Learning Analytics',
      description: 'Get AI-powered recommendations based on your performance',
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  // AI API Mutations
  const tutorMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          context: 'medical education',
          userId: user.id,
          sessionId: currentSessionId,
          toolType: 'tutor'
        })
      });
      if (!response.ok) throw new Error('Failed to get AI response');
      return response.json();
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }
    },
    onError: (error) => {
      console.error('AI Tutor Error:', error);
      toast({
        variant: "destructive",
        title: "AI Tutor Error",
        description: "Failed to get response from AI tutor. Please try again."
      });
    }
  });

  const explainMutation = useMutation({
    mutationFn: async ({ concept, level }: { concept: string; level: string }) => {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, level, userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to explain concept');
      return response.json();
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Explanation Error",
        description: "Failed to generate explanation"
      });
    }
  });

  const questionsMutation = useMutation({
    mutationFn: async ({ topic, difficulty, count }: { topic: string; difficulty: string; count: number }) => {
      const response = await fetch('/api/ai/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count, userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to generate questions');
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuestions(data.questions);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Question Generation Error",
        description: "Failed to generate questions"
      });
    }
  });

  const caseAnalysisMutation = useMutation({
    mutationFn: async (caseDetails: string) => {
      const response = await fetch('/api/ai/case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDetails, userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to analyze case');
      return response.json();
    },
    onSuccess: (data) => {
      setCaseAnalysis(data.analysis);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Case Analysis Error",
        description: "Failed to analyze case study"
      });
    }
  });

  const studyPlanMutation = useMutation({
    mutationFn: async ({ goals, timeframe, level }: { goals: string[]; timeframe: string; level: string }) => {
      const response = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals, timeframe, currentLevel: level, userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to generate study plan');
      return response.json();
    },
    onSuccess: (data) => {
      setStudyPlan(data.studyPlan);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Study Plan Error",
        description: "Failed to generate study plan"
      });
    }
  });

  // Helper functions
  const sendChatMessage = () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = { role: 'user' as const, content: currentMessage };
    setChatMessages(prev => [...prev, userMessage]);
    
    tutorMutation.mutate({
      message: currentMessage,
      sessionId: currentSessionId
    });
    setCurrentMessage('');
  };

  const addGoal = () => {
    if (newGoal.trim() && !studyGoals.includes(newGoal)) {
      setStudyGoals(prev => [...prev, newGoal]);
      setNewGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    setStudyGoals(prev => prev.filter(g => g !== goal));
  };

  // Render individual tool interfaces
  const renderToolInterface = () => {
    const tool = aiTools.find(t => t.id === selectedTool);
    if (!tool) return null;

    switch (selectedTool) {
      case 'tutor':
        return (
          <div className="space-y-6">
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Ask me anything about medical topics!</p>
                  <p className="text-sm mt-2">I can help with anatomy, physiology, pathology, and more.</p>
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-800 border'
                  }`}>
                    {message.role === 'ai' ? (
                      <div className="space-y-2">
                        {message.content.split('\n').map((paragraph, pIndex) => {
                          if (!paragraph.trim()) return null;

                          // Convert **bold** to actual bold styling
                          const formattedParagraph = paragraph.replace(
                            /\*\*(.*?)\*\*/g, 
                            '<strong class="font-semibold text-blue-600">$1</strong>'
                          );

                          return (
                            <div 
                              key={pIndex} 
                              className="leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: formattedParagraph }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              {tutorMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg border">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask your medical question..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <Button onClick={sendChatMessage} disabled={!currentMessage.trim() || tutorMutation.isPending}>
                Send
              </Button>
            </div>
          </div>
        );

      case 'explain':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="concept">Medical Concept</Label>
                <Input
                  id="concept"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g., myocardial infarction, diabetes mellitus"
                />
              </div>
              <div>
                <Label htmlFor="level">Explanation Level</Label>
                <Select value={currentLevel} onValueChange={setCurrentLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={() => explainMutation.mutate({ concept, level: currentLevel })}
              disabled={!concept.trim() || explainMutation.isPending}
              className="w-full"
            >
              {explainMutation.isPending ? <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> : <Lightbulb className="mr-2 w-4 h-4" />}
              Explain Concept
            </Button>
            {explanation && (
              <Card>
                <CardHeader>
                  <CardTitle>✨ AI Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none space-y-3">
                    {explanation.split('\n').map((paragraph, index) => {
                      if (!paragraph.trim()) return null;

                      // Convert **bold** to actual bold styling
                      const formattedParagraph = paragraph.replace(
                        /\*\*(.*?)\*\*/g, 
                        '<strong class="font-semibold text-blue-600">$1</strong>'
                      );

                      return (
                        <div 
                          key={index} 
                          className="mb-3 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'questions':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Cardiology, Anatomy"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
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
              <div>
                <Label htmlFor="count">Number of Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={() => questionsMutation.mutate({ topic, difficulty, count: parseInt(questionCount) })}
              disabled={!topic.trim() || questionsMutation.isPending}
              className="w-full"
            >
              {questionsMutation.isPending ? <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> : <FileText className="mr-2 w-4 h-4" />}
              Generate Questions
            </Button>
            {generatedQuestions.length > 0 && (
              <div className="space-y-4">
                {generatedQuestions.map((q, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-3">{q.question}</p>
                      <div className="space-y-2 mb-3">
                        {q.options?.map((option: string, optIndex: number) => (
                          <div key={optIndex} className="p-2 bg-gray-50 rounded">{option}</div>
                        ))}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-green-600 mb-2">Correct Answer: {q.correctAnswer}</p>
                        <p className="text-gray-600">{q.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'case-study':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="caseDetails">Case Study Details</Label>
              <Textarea
                id="caseDetails"
                value={caseDetails}
                onChange={(e) => setCaseDetails(e.target.value)}
                placeholder="Enter patient case details, symptoms, history, etc."
                rows={6}
              />
            </div>
            <Button 
              onClick={() => caseAnalysisMutation.mutate(caseDetails)}
              disabled={!caseDetails.trim() || caseAnalysisMutation.isPending}
              className="w-full"
            >
              {caseAnalysisMutation.isPending ? <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> : <Stethoscope className="mr-2 w-4 h-4" />}
              Analyze Case
            </Button>
            {caseAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>🏥 AI Case Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none space-y-3">
                    {caseAnalysis.split('\n').map((paragraph, index) => {
                      if (!paragraph.trim()) return null;

                      // Convert **bold** to actual bold styling
                      const formattedParagraph = paragraph.replace(
                        /\*\*(.*?)\*\*/g, 
                        '<strong class="font-semibold text-red-600">$1</strong>'
                      );

                      return (
                        <div 
                          key={index} 
                          className="mb-3 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'study-plan':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Study Goals</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add study goal..."
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <Button onClick={addGoal} disabled={!newGoal.trim()}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {studyGoals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeGoal(goal)}>
                      {goal} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2 weeks">2 Weeks</SelectItem>
                      <SelectItem value="4 weeks">4 Weeks</SelectItem>
                      <SelectItem value="8 weeks">8 Weeks</SelectItem>
                      <SelectItem value="12 weeks">12 Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Current Level</Label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => studyPlanMutation.mutate({ goals: studyGoals, timeframe, level: currentLevel })}
              disabled={studyGoals.length === 0 || studyPlanMutation.isPending}
              className="w-full"
            >
              {studyPlanMutation.isPending ? <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> : <Calendar className="mr-2 w-4 h-4" />}
              Generate Study Plan
            </Button>
            {studyPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>📅 {studyPlan.title || 'Your AI Study Plan'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studyPlan.weeklySchedule?.map((week: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h4 className="font-semibold mb-3 text-blue-800">
                          📚 Week {week.week}: {week.focus}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <strong className="text-gray-700">🎯 Daily Tasks:</strong>
                            <ul className="list-none ml-4 mt-2 space-y-1">
                              {week.dailyTasks?.map((task: string, taskIndex: number) => (
                                <li key={taskIndex} className="flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {week.resources && (
                            <div>
                              <strong className="text-gray-700">📖 Resources:</strong>
                              <ul className="list-none ml-4 mt-2 space-y-1">
                                {week.resources.map((resource: string, resIndex: number) => (
                                  <li key={resIndex} className="flex items-start">
                                    <span className="text-blue-500 mr-2">📄</span>
                                    <span>{resource}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {studyPlan.tips && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold mb-2 text-yellow-800">💡 Study Tips:</h4>
                        <ul className="space-y-1">
                          {studyPlan.tips.map((tip: string, tipIndex: number) => (
                            <li key={tipIndex} className="flex items-start">
                              <span className="text-yellow-500 mr-2">⭐</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return <div>Tool not implemented</div>;
    }
  };

  if (selectedTool) {
    const tool = aiTools.find(t => t.id === selectedTool);
    if (!tool) return null;

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setSelectedTool(null)}>
              <ArrowRight className="mr-2 rotate-180" size={16} />
              Back to AI Tools
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                  <tool.icon style={{ color: '#3399FF' }} size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl" style={{ color: '#1C1C1C' }}>{tool.name}</CardTitle>
                  <p style={{ color: '#2E2E2E' }}>{tool.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderToolInterface()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
              alt="DocDot Medical Student Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>AI Medical Learning Tools</h1>
              <p className="text-lg" style={{ color: '#2E2E2E' }}>Powered by DocDot AI</p>
            </div>
          </div>
          <p className="text-xl mb-4" style={{ color: '#2E2E2E' }}>Advanced AI to enhance your medical education</p>
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            🚀 DeepSeek R1 - Premium API Integration
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool) => {
            const IconComponent = tool.icon;

            return (
              <Card 
                key={tool.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-blue-400"
                onClick={() => setSelectedTool(tool.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                      <IconComponent style={{ color: '#3399FF' }} size={32} />
                    </div>
                    <ChevronRight className="text-gray-400" size={16} />
                  </div>
                  <CardTitle className="text-lg" style={{ color: '#1C1C1C' }}>{tool.name}</CardTitle>
                  <p style={{ color: '#2E2E2E' }} className="text-sm">{tool.description}</p>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="sm" 
                    className="w-full"
                    style={{ backgroundColor: '#3399FF', color: 'white' }}
                  >
                    Launch Tool
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain style={{ color: '#3399FF' }} size={24} />
                <span style={{ color: '#1C1C1C' }}>AI-Powered Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span style={{ color: '#2E2E2E' }}>Interactive medical tutor chat</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span style={{ color: '#2E2E2E' }}>Detailed concept explanations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span style={{ color: '#2E2E2E' }}>Custom question generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span style={{ color: '#2E2E2E' }}>Case study analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span style={{ color: '#2E2E2E' }}>Personalized study plans</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles style={{ color: '#3399FF' }} size={24} />
                <span style={{ color: '#1C1C1C' }}>Getting Started</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: '#3399FF' }}>1</div>
                  <p style={{ color: '#2E2E2E' }}>Select an AI tool from the grid above</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: '#3399FF' }}>2</div>
                  <p style={{ color: '#2E2E2E' }}>Enter your medical topic or question</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: '#3399FF' }}>3</div>
                  <p style={{ color: '#2E2E2E' }}>Get instant AI-powered insights and explanations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8" style={{ backgroundColor: '#D1E8F9' }}>
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap style={{ color: '#3399FF' }} size={32} />
              <h3 className="text-xl font-bold" style={{ color: '#1C1C1C' }}>
                Free AI-Powered Medical Learning
              </h3>
            </div>
            <p style={{ color: '#2E2E2E' }} className="mb-6 max-w-2xl mx-auto">
              All AI tools are completely free to use. Get instant help with medical concepts, 
              generate practice questions, analyze case studies, and create personalized study plans.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm" style={{ color: '#2E2E2E' }}>
              <span>Powered by</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✨ DeepSeek R1 Premium API</Badge>
              <span>•</span>
              <Badge variant="outline">Professional Medical AI</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}