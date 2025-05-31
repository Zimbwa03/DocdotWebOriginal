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
  Clock
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
    { name: 'Take Quiz', section: 'quiz', icon: Play },
    { name: 'Study Notes', section: 'notes', icon: BookOpenCheck },
    { name: 'Study Planner', section: 'planner', icon: Calendar },
    { name: 'AI Tools', section: 'ai-tools', icon: Bot },
    { name: 'Analytics', section: 'analytics', icon: BarChart3 },
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
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                        <Brain style={{ color: '#3399FF' }} size={20} />
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
                  
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                        <BookOpen style={{ color: '#3399FF' }} size={20} />
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: '#1C1C1C' }}>Anatomy Study Session</div>
                        <div className="text-sm" style={{ color: '#2E2E2E' }}>Completed yesterday</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold" style={{ color: '#3399FF' }}>45min</div>
                      <div className="text-sm" style={{ color: '#2E2E2E' }}>Study time</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'ai-tools' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>AI Tutor</h3>
                <div className="p-6 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Bot className="mx-auto h-12 w-12 mb-4" style={{ color: '#3399FF' }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: '#1C1C1C' }}>AI Tutor Chat</h3>
                    <p className="mb-4" style={{ color: '#2E2E2E' }}>
                      Ask questions and get personalized explanations from our AI tutor.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                          <Bot className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: '#1C1C1C' }}>
                            Hi! I'm your AI tutor. What medical topic would you like to learn about today?
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          placeholder="Ask me anything about medicine..."
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button style={{ backgroundColor: '#3399FF' }}>
                          <MessageSquare size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'quiz' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Available Quizzes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>Cardiology Basics</h4>
                    <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>Test your knowledge of heart anatomy and function</p>
                    <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>Start Quiz</Button>
                  </div>
                  <div className="p-6 rounded-xl border" style={{ backgroundColor: '#F7FAFC' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>Respiratory System</h4>
                    <p className="text-sm mb-4" style={{ color: '#2E2E2E' }}>Lung anatomy and breathing mechanics</p>
                    <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>Start Quiz</Button>
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

            {activeSection === 'planner' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold" style={{ color: '#1C1C1C' }}>Study Planner</h3>
                <div className="p-6 rounded-xl" style={{ backgroundColor: '#F7FAFC' }}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar style={{ color: '#3399FF' }} size={24} />
                    <h4 className="font-semibold" style={{ color: '#1C1C1C' }}>Today's Schedule</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Clock style={{ color: '#3399FF' }} size={16} />
                      <span style={{ color: '#1C1C1C' }}>9:00 AM - Cardiology Review</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Clock style={{ color: '#3399FF' }} size={16} />
                      <span style={{ color: '#1C1C1C' }}>2:00 PM - Anatomy Quiz</span>
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
