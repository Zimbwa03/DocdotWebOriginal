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
  const { user } = useAuth();
  const { toast } = useToast();
  
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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: 'medical education' })
      });
      if (!response.ok) throw new Error('Failed to get AI response');
      return response.json();
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "AI Tutor Error",
        description: "Failed to get response from AI tutor"
      });
    }
  });

  const explainMutation = useMutation({
    mutationFn: async ({ concept, level }: { concept: string; level: string }) => {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, level })
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
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count })
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
      const response = await fetch('/api/ai/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDetails })
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
        body: JSON.stringify({ goals, timeframe, currentLevel: level })
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
    setChatMessages(prev => [...prev, { role: 'user', content: currentMessage }]);
    tutorMutation.mutate(currentMessage);
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
                    {message.content}
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
                  <CardTitle>Explanation: {concept}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {explanation.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
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
                  <CardTitle>Case Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {caseAnalysis.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
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
                  <CardTitle>{studyPlan.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studyPlan.weeklySchedule?.map((week: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Week {week.week}: {week.focus}</h4>
                        <div className="space-y-2">
                          <div>
                            <strong>Daily Tasks:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {week.dailyTasks?.map((task: string, taskIndex: number) => (
                                <li key={taskIndex}>{task}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
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
    <div className="min-h-screen bg-docdot-bg">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-docdot-heading mb-4">AI Study Tools</h1>
          <p className="text-xl text-docdot-text">Enhance your learning with AI-powered study aids</p>
          {userTier === 'free' && (
            <Badge className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Premium Feature
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiTools.map((tool) => {
            const IconComponent = tool.icon;
            const canAccess = canAccessTool(tool.accessTier);
            
            return (
              <Card 
                key={tool.id}
                className={`cursor-pointer transition-all duration-200 ${
                  canAccess 
                    ? 'hover:shadow-lg border-2 hover:border-docdot-blue' 
                    : 'opacity-75 border-gray-200'
                }`}
                onClick={() => setSelectedTool(tool.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-${tool.color}-100`}>
                      <IconComponent className={`text-${tool.color}-600`} size={32} />
                    </div>
                    {!canAccess && <Lock className="text-gray-400" size={16} />}
                  </div>
                  <CardTitle className="text-lg text-docdot-heading">{tool.name}</CardTitle>
                  <p className="text-docdot-text text-sm">{tool.description}</p>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={canAccess ? "default" : "outline"} 
                    size="sm" 
                    className={canAccess ? "w-full bg-docdot-blue" : "w-full"}
                  >
                    {canAccess ? 'Try Now' : 'Upgrade Required'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="text-center py-8">
            <Sparkles className="mx-auto mb-4 text-purple-600" size={48} />
            <h2 className="text-2xl font-bold text-docdot-heading mb-4">
              Unlock AI-Powered Learning
            </h2>
            <p className="text-docdot-text mb-6 max-w-2xl mx-auto">
              Transform your study experience with advanced AI tools designed specifically for medical education. 
              Generate personalized flashcards, create memorable mnemonics, and summarize complex medical texts.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-docdot-heading mb-2">Smart Flashcards</h4>
                  <p className="text-docdot-text text-sm">AI analyzes your text and creates optimal question-answer pairs</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-docdot-heading mb-2">Memory Mnemonics</h4>
                  <p className="text-docdot-text text-sm">Generate creative memory aids for complex medical concepts</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-docdot-heading mb-2">Intelligent Summaries</h4>
                  <p className="text-docdot-text text-sm">Condense lengthy medical texts into key learning points</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}