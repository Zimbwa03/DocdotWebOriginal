import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Microscope, 
  BookOpen, 
  Image as ImageIcon,
  Bot,
  Send,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  MessageCircle,
  Heart,
  Eye,
  Hand,
  Zap,
  Activity
} from 'lucide-react';

export default function Quiz() {
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null);
  const [selectedCadaverTopic, setSelectedCadaverTopic] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const cadaverTopics = [
    { id: 'head-neck', name: 'Head and Neck', icon: Eye, description: 'Cranial anatomy, facial structures, cervical region' },
    { id: 'upper-limb', name: 'Upper Limb', icon: Hand, description: 'Shoulder, arm, forearm, hand anatomy' },
    { id: 'thorax', name: 'Thorax', icon: Heart, description: 'Chest cavity, heart, lungs, mediastinum' },
    { id: 'lower-limb', name: 'Lower Limb', icon: Activity, description: 'Hip, thigh, leg, foot anatomy' },
    { id: 'pelvis-perineum', name: 'Pelvis and Perineum', icon: Target, description: 'Pelvic cavity, reproductive organs, perineal structures' },
    { id: 'neuroanatomy', name: 'Neuroanatomy', icon: Brain, description: 'Central and peripheral nervous system' },
    { id: 'abdomen', name: 'Abdomen', icon: Activity, description: 'Abdominal cavity, digestive organs, retroperitoneum' }
  ];

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    const userMessage = { role: 'user' as const, content: aiPrompt };
    setAiMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant' as const, 
        content: `Based on your request "${aiPrompt}", I'll generate medical questions focused on this topic. Here are some practice questions I've created for you:\n\n1. **Question**: What is the primary function of the structure you mentioned?\n\n2. **Clinical Scenario**: A patient presents with symptoms related to this area. What would be your differential diagnosis?\n\n3. **Anatomy Question**: Identify the key anatomical landmarks in this region.\n\nWould you like me to generate more specific questions or focus on a particular difficulty level?`
      };
      setAiMessages(prev => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 2000);
    
    setAiPrompt('');
  };

  const renderQuizTypeSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Medical Quizzes</h1>
        <p className="text-lg" style={{ color: '#2E2E2E' }}>Choose your learning path and start practicing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* MCQ Questions */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('mcq')}
        >
          <CardHeader className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle style={{ color: '#1C1C1C' }}>MCQ Questions</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Multiple choice questions from our comprehensive question bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">5,000+ Questions</Badge>
              <Badge variant="secondary">All Subjects</Badge>
              <Badge variant="secondary">Instant Feedback</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Generate AI Questions */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('ai-generator')}
        >
          <CardHeader className="text-center">
            <Bot className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle style={{ color: '#1C1C1C' }}>Generate AI Questions</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Create personalized questions using advanced AI technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="secondary">Personalized</Badge>
              <Badge variant="secondary">Adaptive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cadaver Quiz */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('cadaver')}
        >
          <CardHeader className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle style={{ color: '#1C1C1C' }}>Cadaver Quiz</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Visual anatomy with real cadaver images and structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Real Images</Badge>
              <Badge variant="secondary">7 Topics</Badge>
              <Badge variant="secondary">Interactive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Histology & Embryology */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('histology')}
        >
          <CardHeader className="text-center">
            <Microscope className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle style={{ color: '#1C1C1C' }}>Histology & Embryology</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Microscopic anatomy and developmental biology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Microscopic Images</Badge>
              <Badge variant="secondary">Development</Badge>
              <Badge variant="secondary">Detailed</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Case Studies */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('cases')}
        >
          <CardHeader className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle style={{ color: '#1C1C1C' }}>Clinical Cases</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Real patient scenarios and clinical reasoning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Patient Cases</Badge>
              <Badge variant="secondary">Clinical Reasoning</Badge>
              <Badge variant="secondary">Problem Solving</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rapid Fire */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
          style={{ backgroundColor: '#F7FAFC' }}
          onClick={() => setSelectedQuizType('rapid')}
        >
          <CardHeader className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
            <CardTitle style={{ color: '#1C1C1C' }}>Rapid Fire</CardTitle>
            <CardDescription style={{ color: '#2E2E2E' }}>
              Quick questions to test your knowledge under time pressure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Timed</Badge>
              <Badge variant="secondary">Quick Questions</Badge>
              <Badge variant="secondary">Speed Test</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

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

  if (selectedQuizType === 'ai-generator') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderAiGenerator()}
        </div>
      </div>
    );
  }

  if (selectedQuizType === 'cadaver') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderCadaverTopics()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-8 py-12">
        {renderQuizTypeSelection()}
      </div>
    </div>
  );
}