import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CreditCard
} from 'lucide-react';

export default function Home() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

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
        return <Badge className="bg-docdot-blue text-white">Starter</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-docdot-bg">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-docdot-blue rounded-full flex items-center justify-center">
                <Stethoscope className="text-white text-sm" size={16} />
              </div>
              <span className="ml-2 text-xl font-bold text-docdot-heading">Docdot</span>
            </div>
            <div className="flex items-center space-x-4">
              {getTierBadge(userStats.subscriptionTier)}
              <span className="text-docdot-text">
                {getUserDisplayName()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-500 hover:text-docdot-blue"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-docdot-heading mb-4">
            Welcome back,{' '}
            <span className="text-docdot-blue">{getUserDisplayName()}</span>!
          </h1>
          <p className="text-xl text-docdot-text">
            Continue your medical education journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="text-yellow-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-docdot-heading">{userStats.xp.toLocaleString()}</p>
              <p className="text-sm text-docdot-text">XP Points</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="text-docdot-blue mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-docdot-heading">Level {userStats.level}</p>
              <p className="text-sm text-docdot-text">Current Level</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="text-green-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-docdot-heading">{userStats.streak} days</p>
              <p className="text-sm text-docdot-text">Study Streak</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="text-purple-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-docdot-heading">24</p>
              <p className="text-sm text-docdot-text">Topics Studied</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/quiz">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-docdot-blue-light rounded-lg">
                    <Play className="text-docdot-blue" size={24} />
                  </div>
                  <CardTitle className="text-docdot-heading">Take Quiz</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-docdot-text text-sm">
                  Test your knowledge with interactive medical quizzes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notes">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpenCheck className="text-green-600" size={24} />
                  </div>
                  <CardTitle className="text-docdot-heading">Study Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-docdot-text text-sm">
                  Access comprehensive medical notes and materials
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/study-guide">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="text-purple-600" size={24} />
                  </div>
                  <CardTitle className="text-docdot-heading">Study Planner</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-docdot-text text-sm">
                  Organize your study schedule and track progress
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-tools">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-docdot-heading">AI Tools</CardTitle>
                    {userStats.subscriptionTier === 'free' && (
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-docdot-text text-sm">
                  Generate flashcards and mnemonics with AI
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ask-ai">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bot className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-docdot-heading">AI Tutor</CardTitle>
                    {userStats.subscriptionTier === 'free' && (
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-docdot-text text-sm">
                  Ask questions and get personalized explanations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pricing">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-gradient-to-r from-purple-500 to-pink-500">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <CreditCard className="text-purple-600" size={24} />
                  </div>
                  <CardTitle className="text-docdot-heading">Upgrade</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-docdot-text text-sm">
                  Unlock premium features and advanced tools
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-docdot-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Trophy className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-docdot-heading font-medium">Completed Anatomy Quiz</p>
                  <p className="text-docdot-text text-sm">Scored 85% on Head and Neck anatomy</p>
                </div>
                <span className="text-docdot-text text-sm ml-auto">2 hours ago</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <BookOpen className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-docdot-heading font-medium">Studied Physiology Notes</p>
                  <p className="text-docdot-text text-sm">Reviewed cardiovascular system</p>
                </div>
                <span className="text-docdot-text text-sm ml-auto">Yesterday</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Brain className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-docdot-heading font-medium">Created Study Plan</p>
                  <p className="text-docdot-text text-sm">Weekly schedule for histology</p>
                </div>
                <span className="text-docdot-text text-sm ml-auto">2 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
