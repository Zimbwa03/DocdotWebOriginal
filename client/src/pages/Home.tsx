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
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Mock user stats - in production these would come from database
  const userStats = {
    xp: 2450,
    level: 12,
    streak: 7,
    subscriptionTier: 'free' // free, starter, premium
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
    { name: 'Take Quiz', href: '/quiz', icon: Play },
    { name: 'Study Notes', href: '/notes', icon: BookOpenCheck },
    { name: 'Study Planner', href: '/study-guide', icon: Calendar },
    { name: 'AI Tools', href: '/ai-tools', icon: Bot },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

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
                return (
                  <Link key={item.name} href={item.href}>
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white hover:bg-opacity-50" style={{ color: '#2E2E2E' }}>
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
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
                return (
                  <Link key={item.name} href={item.href}>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-white hover:bg-opacity-50" style={{ color: '#2E2E2E' }}>
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#1C1C1C' }}>
            Welcome back,{' '}
            <span style={{ color: '#3399FF' }}>{getUserDisplayName()}</span>!
          </h1>
          <p className="text-xl" style={{ color: '#2E2E2E' }}>
            Continue your medical education journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                <Zap className="text-white" size={24} />
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#1C1C1C' }}>{userStats.xp.toLocaleString()}</p>
              <p className="text-sm" style={{ color: '#2E2E2E' }}>XP Points</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                <Trophy className="text-white" size={24} />
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Level {userStats.level}</p>
              <p className="text-sm" style={{ color: '#2E2E2E' }}>Current Level</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                <Target className="text-white" size={24} />
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#1C1C1C' }}>{userStats.streak} days</p>
              <p className="text-sm" style={{ color: '#2E2E2E' }}>Study Streak</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                <BookOpen className="text-white" size={24} />
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#1C1C1C' }}>24</p>
              <p className="text-sm" style={{ color: '#2E2E2E' }}>Topics Studied</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/quiz">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3399FF' }}>
                  <Play className="text-white" size={28} />
                </div>
                <CardTitle style={{ color: '#1C1C1C' }} className="text-xl">Take a Quiz</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p style={{ color: '#2E2E2E' }} className="text-center leading-relaxed">
                  Test your knowledge with interactive medical quizzes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notes">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3399FF' }}>
                  <BookOpenCheck className="text-white" size={28} />
                </div>
                <CardTitle style={{ color: '#1C1C1C' }} className="text-xl">Study Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p style={{ color: '#2E2E2E' }} className="text-center leading-relaxed">
                  Access comprehensive study materials and notes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/study-guide">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3399FF' }}>
                  <Calendar className="text-white" size={28} />
                </div>
                <CardTitle style={{ color: '#1C1C1C' }} className="text-xl">Study Planner</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p style={{ color: '#2E2E2E' }} className="text-center leading-relaxed">
                  Plan and organize your study sessions effectively
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-tools">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3399FF' }}>
                  <Bot className="text-white" size={28} />
                </div>
                <CardTitle style={{ color: '#1C1C1C' }} className="text-xl">AI Tools</CardTitle>
                {userStats.subscriptionTier === 'free' && (
                  <Badge variant="outline" className="text-xs mt-2">Premium</Badge>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p style={{ color: '#2E2E2E' }} className="text-center leading-relaxed">
                  Get help from AI tutors and study assistants
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pricing">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3399FF' }}>
                  <CreditCard className="text-white" size={28} />
                </div>
                <CardTitle style={{ color: '#1C1C1C' }} className="text-xl">Upgrade Plan</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p style={{ color: '#2E2E2E' }} className="text-center leading-relaxed">
                  Unlock premium features and advanced tools
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 rounded-xl overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3399FF' }}>
                <Trophy className="text-white" size={28} />
              </div>
              <CardTitle style={{ color: '#1C1C1C' }} className="text-xl">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p style={{ color: '#2E2E2E' }} className="text-center leading-relaxed">
                Compete with peers and track your progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle style={{ color: '#1C1C1C' }} className="text-2xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                  <Trophy style={{ color: '#3399FF' }} size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: '#1C1C1C' }}>Quiz Completed</p>
                  <p className="text-sm" style={{ color: '#2E2E2E' }}>Cardiology Basics - Score: 85%</p>
                </div>
                <span className="text-xs" style={{ color: '#6B7280' }}>2 hours ago</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                  <BookOpen style={{ color: '#3399FF' }} size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: '#1C1C1C' }}>Study Session</p>
                  <p className="text-sm" style={{ color: '#2E2E2E' }}>Anatomy - Respiratory System</p>
                </div>
                <span className="text-xs" style={{ color: '#6B7280' }}>1 day ago</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1E8F9' }}>
                  <Brain style={{ color: '#3399FF' }} size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: '#1C1C1C' }}>AI Tutor Session</p>
                  <p className="text-sm" style={{ color: '#2E2E2E' }}>Pharmacology Discussion</p>
                </div>
                <span className="text-xs" style={{ color: '#6B7280' }}>2 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
