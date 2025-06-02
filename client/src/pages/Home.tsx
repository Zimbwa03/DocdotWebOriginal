import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Star,
  Play,
  Brain,
  FileText,
  Heart,
  Activity,
  Zap,
  Calendar,
  Award,
  BarChart3,
  ChevronRight,
  Timer,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  Shield,
  Crown,
  Flame,
  ArrowRight,
  Medal,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

function QuizSection() {
  const categories = {
    "Anatomy": [
      "Head and Neck",
      "Upper Limb", 
      "Thorax",
      "Lower Limb",
      "Pelvis and Perineum",
      "Neuroanatomy",
      "Abdomen"
    ],
    "Physiology": [
      "Cell",
      "Nerve and Muscle",
      "Blood",
      "Endocrine",
      "Reproductive",
      "Gastrointestinal Tract",
      "Renal",
      "Cardiovascular System",
      "Respiration",
      "Medical Genetics",
      "Neurophysiology"
    ],
    "Other Subjects": [
      "Biostatistics",
      "Histology and Embryology"
    ]
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          Start Your Medical Learning Journey
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto px-4">
          Choose from comprehensive medical categories with authentic questions from authoritative medical textbooks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Object.entries(categories).map(([mainCategory, subcategories]) => (
          <Card key={mainCategory} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                {mainCategory === 'Anatomy' && <Heart className="w-5 h-5 mr-2 text-red-500" />}
                {mainCategory === 'Physiology' && <Activity className="w-5 h-5 mr-2 text-blue-500" />}
                {mainCategory === 'Other Subjects' && <BookOpen className="w-5 h-5 mr-2 text-green-500" />}
                {mainCategory}
              </CardTitle>
              <CardDescription>
                {subcategories.length} topics available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {subcategories.slice(0, 3).map((sub) => (
                  <div key={sub} className="text-sm text-gray-600">
                    • {sub}
                  </div>
                ))}
                {subcategories.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{subcategories.length - 3} more topics
                  </div>
                )}
              </div>
              <Link href={`/quiz?category=${encodeURIComponent(mainCategory)}`}>
                <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for accurate greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    const firstName = user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'User';
    
    if (hour >= 5 && hour < 12) {
      return `Good Morning, ${firstName}! ☀️`;
    } else if (hour >= 12 && hour < 17) {
      return `Good Afternoon, ${firstName}! 🌤️`;
    } else if (hour >= 17 && hour < 21) {
      return `Good Evening, ${firstName}! 🌆`;
    } else {
      return `Good Night, ${firstName}! 🌙`;
    }
  };

  // Fetch real user statistics with refetch on focus
  const { data: userStats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user-stats/${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch recent quiz attempts
  const { data: recentQuizzes, refetch: refetchQuizzes } = useQuery({
    queryKey: ['/api/quiz-attempts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/quiz-attempts/${user.id}?limit=5`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Fetch user badges
  const { data: badgeData } = useQuery({
    queryKey: ['/api/badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return { earned: [], available: [] };
      const response = await fetch(`/api/badges/${user.id}`);
      if (!response.ok) return { earned: [], available: [] };
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch user rank
  const { data: userRankData } = useQuery({
    queryKey: ['/api/user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user-rank?userId=${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Refresh data when returning to Home page
  useEffect(() => {
    if (user?.id) {
      refetchStats();
      refetchQuizzes();
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] });
    }
  }, [user?.id, refetchStats, refetchQuizzes, queryClient]);

  const defaultStats = {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    averageAccuracy: 0,
    totalQuizzes: 0,
    totalTimeSpent: 0,
    rank: 0
  };

  const stats = userStats || defaultStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Hero Section with Personalized Greeting */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">
              {getTimeBasedGreeting()}
            </h1>
            <p className="text-lg lg:text-xl text-gray-600">
              Ready to continue your medical learning journey?
            </p>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mr-4" 
              style={{ backgroundColor: '#3399FF' }}
            >
              <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Docdot Medical Platform
              </h2>
              <p className="text-sm lg:text-base text-gray-600">
                Authentic questions from authoritative medical textbooks
              </p>
            </div>
          </div>

          {/* Quick Study Insights */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-blue-600">
                  {loadingStats ? '...' : Math.round((stats.totalTimeSpent || 0) / 60)}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Minutes Today</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  {loadingStats ? '...' : stats.currentStreak || 0}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Day Streak</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-purple-600">
                  {loadingStats ? '...' : stats.totalXp || 0}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Total XP</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-orange-600">
                  Level {loadingStats ? '...' : stats.level || 1}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Your Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="mb-8 lg:mb-12">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h2>
            <Link href="/analytics">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Detailed Analytics
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* XP and Level */}
            <Card className="col-span-2 lg:col-span-1 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-blue-600" />
                  XP & Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-blue-900">
                  {loadingStats ? '...' : (stats.totalXp ? stats.totalXp.toLocaleString() : '0')}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Level {loadingStats ? '...' : stats.level || 1}
                </div>
                <Progress 
                  value={loadingStats ? 0 : ((stats.totalXp % 1000) / 1000) * 100} 
                  className="mt-2 h-2" 
                />
                <div className="text-xs text-blue-600 mt-1">
                  {loadingStats ? '...' : String(1000 - ((stats.totalXp || 0) % 1000))} XP to next level
                </div>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-orange-600" />
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-orange-900">
                  {loadingStats ? '...' : stats.currentStreak || 0}
                </div>
                <div className="text-sm text-orange-600">days active</div>
                <div className="text-xs text-orange-600 mt-1">
                  Best: {loadingStats ? '...' : String(stats.longestStreak || 0)} days
                </div>
              </CardContent>
            </Card>

            {/* Accuracy */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center">
                  <Target className="w-4 h-4 mr-1 text-green-600" />
                  Overall Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-green-900">
                  {loadingStats ? '...' : Math.round(stats.averageAccuracy || 0)}%
                </div>
                <div className="text-sm text-green-600">
                  {loadingStats ? '...' : String(stats.correctAnswers || 0)} of {loadingStats ? '...' : String(stats.totalQuestions || 0)} correct
                </div>
              </CardContent>
            </Card>

            {/* Global Rank */}
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
                  <Trophy className="w-4 h-4 mr-1 text-purple-600" />
                  Global Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-purple-900">
                  #{userRankData?.rank || stats.rank || 'Unranked'}
                </div>
                <div className="text-sm text-purple-600">
                  {((userRankData?.rank || stats.rank) && (userRankData?.rank || stats.rank) <= 100) ? 'Top 100!' : 'Keep studying!'}
                </div>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs">
                    View Leaderboard <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gamification Features */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
            Gamification Hub
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Badge Collection */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Badge Collection
                </CardTitle>
                <CardDescription>
                  Earn achievements for your study milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-yellow-600">
                    {badgeData?.earned?.length || 0}
                  </div>
                  <div className="text-sm text-yellow-700">
                    Badges Earned
                  </div>
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        i < (badgeData?.earned?.length || 0) 
                          ? 'bg-yellow-400' 
                          : 'bg-yellow-200'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${
                        i < (badgeData?.earned?.length || 0) 
                          ? 'text-white' 
                          : 'text-yellow-400'
                      }`} />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Link href="/badges">
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Explore Badges
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={async () => {
                      if (user?.id) {
                        try {
                          await fetch(`/api/initialize-user/${user.id}`, { method: 'POST' });
                          await fetch(`/api/badges/${user.id}/check`, { method: 'POST' });
                          queryClient.invalidateQueries({ queryKey: ['/api/badges'] });
                          queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
                        } catch (error) {
                          console.error('Error updating badges:', error);
                        }
                      }
                    }}
                  >
                    Activate Badge System
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Position */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Compete with fellow medical students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-600">
                    #{userRankData?.rank || 'N/A'}
                  </div>
                  <div className="text-sm text-purple-700">
                    Global Rank
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{userRankData?.totalXP || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{userRankData?.averageAccuracy ? Math.round(userRankData.averageAccuracy) : 0}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href="/leaderboard">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <Crown className="w-4 h-4 mr-2" />
                      View Rankings
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={async () => {
                      if (user?.id) {
                        await fetch(`/api/leaderboard/${user.id}/update`, { method: 'POST' });
                        queryClient.invalidateQueries({ queryKey: ['/api/user-rank'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
                      }
                    }}
                  >
                    Update My Rank
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Study Motivation */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Flame className="w-5 h-5 text-green-600" />
                  Study Motivation
                </CardTitle>
                <CardDescription>
                  Keep your learning streak alive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.currentStreak || 0}
                  </div>
                  <div className="text-sm text-green-700">
                    Day Streak
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-medium">{Math.round((stats.totalTimeSpent || 0) / 60)} min</span>
                  </div>
                  <Progress value={Math.min(((stats.totalTimeSpent || 0) / 60) / 120 * 100, 100)} className="h-2" />
                  <div className="text-xs text-gray-500 text-center">
                    Goal: 120 minutes/week
                  </div>
                </div>
                <Link href="/quiz">
                  <Button className="w-full bg-green-500 hover:bg-green-600">
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/quiz">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-1">Start Quiz</h3>
                  <p className="text-sm text-blue-600">Test your knowledge</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/badges">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Achievements</h3>
                  <p className="text-sm text-yellow-600">View your badges</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-1">Leaderboard</h3>
                  <p className="text-sm text-purple-600">See rankings</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-1">Analytics</h3>
                  <p className="text-sm text-green-600">Track progress</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Main Quiz Section */}
        <QuizSection />
      </div>
    </div>
  );
}