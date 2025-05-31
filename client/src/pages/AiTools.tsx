import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Zap, 
  BookOpen, 
  Lock, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function AiTools() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Mock user subscription - in production this would come from auth context
  const userTier = 'free'; // free, starter, premium
  
  const aiTools = [
    {
      id: 'flashcards',
      name: 'AI Flashcard Generator',
      description: 'Transform any medical text into interactive flashcards',
      icon: BookOpen,
      color: 'blue',
      accessTier: 'premium'
    },
    {
      id: 'mnemonics',
      name: 'Mnemonic Creator',
      description: 'Generate memorable mnemonics for complex medical concepts',
      icon: Brain,
      color: 'purple',
      accessTier: 'premium'
    },
    {
      id: 'summarizer',
      name: 'Text Summarizer',
      description: 'Condense lengthy medical texts into key points',
      icon: Zap,
      color: 'green',
      accessTier: 'premium'
    }
  ];

  const canAccessTool = (accessTier: string) => {
    if (accessTier === 'free') return true;
    if (accessTier === 'starter' && (userTier === 'starter' || userTier === 'premium')) return true;
    if (accessTier === 'premium' && userTier === 'premium') return true;
    return false;
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  if (selectedTool && !canAccessTool('premium')) {
    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Card className="text-center">
            <CardContent className="py-12">
              <Lock className="mx-auto mb-4 text-gray-400" size={64} />
              <h2 className="text-2xl font-semibold text-docdot-heading mb-4">
                Premium Feature Required
              </h2>
              <p className="text-docdot-text mb-6">
                AI tools are available with Premium subscription. Upgrade to unlock powerful AI-assisted learning features.
              </p>
              <div className="space-y-4">
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Upgrade to Premium
                  </Button>
                </Link>
                <br />
                <Button variant="outline" onClick={() => setSelectedTool(null)}>
                  Back to Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedTool) {
    const tool = aiTools.find(t => t.id === selectedTool);
    if (!tool) return null;

    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setSelectedTool(null)}>
              <ArrowRight className="mr-2 rotate-180" size={16} />
              Back to AI Tools
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${tool.color}-100 rounded-lg`}>
                  <tool.icon className={`text-${tool.color}-600`} size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl text-docdot-heading">{tool.name}</CardTitle>
                  <p className="text-docdot-text">{tool.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-docdot-heading mb-2">
                  Input Text
                </label>
                <Textarea
                  placeholder="Enter medical text, notes, or concepts you'd like to work with..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!inputText.trim() || isGenerating}
                className="w-full bg-docdot-blue"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={16} />
                    Generate {tool.name.split(' ')[1]}
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-docdot-text">AI is processing your request. This may take a moment...</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-docdot-heading mb-2">Coming Soon</h4>
                <p className="text-docdot-text text-sm">
                  AI-powered tools are currently in development. We're integrating advanced language models to provide personalized study assistance for medical students.
                </p>
              </div>
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