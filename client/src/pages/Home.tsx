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
  Bell
} from 'lucide-react';
import { useState } from 'react';

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
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Medical Quizzes</h3>
                <p className="text-lg" style={{ color: '#2E2E2E' }}>Choose a category to start your quiz</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                        <Heart style={{ color: '#3399FF' }} size={24} />
                      </div>
                      <h4 className="font-semibold text-lg" style={{ color: '#1C1C1C' }}>Anatomy</h4>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>Test your knowledge of human anatomy</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm font-medium" style={{ color: '#1C1C1C' }}>Available Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Head and Neck</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Upper Limb</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Thorax</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Abdomen</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>
                        Gross Anatomy Quiz
                      </Button>
                      <Button variant="outline" className="w-full">
                        Histology Quiz
                      </Button>
                      <Button variant="outline" className="w-full">
                        Embryology Quiz
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                        <Activity style={{ color: '#3399FF' }} size={24} />
                      </div>
                      <h4 className="font-semibold text-lg" style={{ color: '#1C1C1C' }}>Physiology</h4>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>Body systems and functions</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm font-medium" style={{ color: '#1C1C1C' }}>Available Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Cell Biology</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Endocrine</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Blood</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Respiratory</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>
                      Start Physiology Quiz
                    </Button>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#1C1C1C' }}>Recent Quiz Results</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                          <Brain style={{ color: '#3399FF' }} size={16} />
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#1C1C1C' }}>Cardiology Quiz</div>
                          <div className="text-sm" style={{ color: '#2E2E2E' }}>15 questions • Completed 2 hours ago</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold" style={{ color: '#3399FF' }}>85%</div>
                        <div className="text-sm" style={{ color: '#2E2E2E' }}>+120 XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
