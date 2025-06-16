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
import { useTooltipGuide } from '@/contexts/TooltipGuideContext';

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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Start Your Medical Learning Journey
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-3 sm:px-4 text-sm sm:text-base">
          Choose from comprehensive medical categories with authentic questions from authoritative medical textbooks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {Object.entries(categories).map(([mainCategory, subcategories]) => (
          <Card key={mainCategory} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base sm:text-lg">
                {mainCategory === 'Anatomy' && <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500" />}
                {mainCategory === 'Physiology' && <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />}
                {mainCategory === 'Other Subjects' && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />}
                <span className="dark:text-white">{mainCategory}</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {subcategories.length} topics available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                {subcategories.slice(0, 3).map((sub) => (
                  <div key={sub} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    • {sub}
                  </div>
                ))}
                {subcategories.length > 3 && (
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    +{subcategories.length - 3} more topics
                  </div>
                )}
              </div>
              <Link href={`/quiz?category=${encodeURIComponent(mainCategory)}`}>
                <Button className="w-full text-sm sm:text-base" style={{ backgroundColor: '#3399FF' }}>
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
  const { startGuide } = useTooltipGuide();

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

  // Fetch user rank - using simple values to avoid React Error #31
  const { data: userRankResponse } = useQuery({
    queryKey: ['/api/user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user-rank?userId=${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  const defaultStats = {
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    averageScore: 0,
    totalQuestions: 0,
    totalStudyTime: 0,
    rank: 0
  };

  const stats = userStats || defaultStats;

  // Safe extraction of rank data
  const userRank = userRankResponse?.rank || stats.rank || 'Unranked';
  const userTotalXP = userRankResponse?.totalXP || 0;
  const userAccuracy = userRankResponse?.averageAccuracy || 0;

  // Refresh data when returning to Home page
  useEffect(() => {
    if (user?.id) {
      refetchStats();
      refetchQuizzes();
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] });
    }
  }, [user?.id, refetchStats, refetchQuizzes, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section with Personalized Greeting */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12" data-tooltip="welcome-message">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {getTimeBasedGreeting()}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-2">
              Ready to continue your medical learning journey?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => startGuide('home')}
              className="mt-4 mx-auto"
            >
              <Star className="w-4 h-4 mr-2" />
              Take a Quick Tour
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/DocDot Medical Student Logo.png" 
              alt="DocDot Medical Student Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#1C1C1C' }}>
                DocDot Medical Learning
              </h1>
            </div>
          </div>

          {/* Quick Study Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                  {loadingStats ? '...' : String(Math.round((stats.totalStudyTime || 0) / 60))}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Minutes Today</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  {loadingStats ? '...' : String(stats.currentStreak || 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                  {loadingStats ? '...' : String(stats.totalXP || 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total XP</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                  Level {loadingStats ? '...' : String(stats.currentLevel || 1)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Your Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h2>
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Detailed Analytics</span>
                <span className="sm:hidden">View Details</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" data-tooltip="user-stats">
            {/* XP and Level */}
            <Card className="sm:col-span-1 lg:col-span-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                  XP & Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {loadingStats ? '...' : (stats.totalXP ? stats.totalXP.toLocaleString() : '0')}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Level {loadingStats ? '...' : String(stats.currentLevel || 1)}
                </div>
                <Progress 
                  value={loadingStats ? 0 : ((stats.totalXP % 1000) / 1000) * 100} 
                  className="mt-2 h-2" 
                />
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {loadingStats ? '...' : String(1000 - ((stats.totalXP || 0) % 1000))} XP to next level
                </div>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-orange-600 dark:text-orange-400" />
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {loadingStats ? '...' : String(stats.currentStreak || 0)}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300">days active</div>
                <div className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                  Best: {loadingStats ? '...' : String(stats.longestStreak || 0)} days
                </div>
              </CardContent>
            </Card>

            {/* Accuracy */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center">
                  <Target className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                  Overall Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">
                  {loadingStats ? '...' : String(Math.round(stats.averageScore || 0))}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  {loadingStats ? '...' : String(stats.correctAnswers || 0)} of {loadingStats ? '...' : String(stats.totalQuestions || 0)} correct
                </div>
              </CardContent>
            </Card>

            {/* Global Rank */}
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center">
                  <Trophy className="w-4 h-4 mr-1 text-purple-600 dark:text-purple-400" />
                  Global Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  #{String(userRank)}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300">
                  {(userRank !== 'Unranked' && Number(userRank) <= 100) ? 'Top 100!' : 'Keep studying!'}
                </div>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs w-full sm:w-auto">
                    View Leaderboard <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gamification Features */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Gamification Hub
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Badge Collection */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-base sm:text-lg">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                  Badge Collection
                </CardTitle>
                <CardDescription className="text-sm dark:text-gray-300">
                  Earn achievements for your study milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {badgeData?.earned?.length || 0}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
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
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${
                        i < (badgeData?.earned?.length || 0) 
                          ? 'text-white' 
                          : 'text-gray-400'
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
                          // Refresh actual user data without adding fake data
                          await Promise.all([
                            queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/category-stats'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/daily-stats'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/badges'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/user-rank'] })
                          ]);

                          console.log('Analytics data refreshed');
                        } catch (error) {
                         console.error('Error refreshing user data:', error);
                        }
                      }
                    }}
                  >
                    Refresh Analytics
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
                    #{String(userRank)}
                  </div>
                  <div className="text-sm text-purple-700">
                    Global Rank
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{String(userTotalXP)} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{String(Math.round(userAccuracy))}%</span>
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
                    {String(stats.currentStreak || 0)}
                  </div>
                  <div className="text-sm text-green-700">
                    Day Streak
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-medium">{String(Math.round((stats.totalTimeSpent || 0) / 60))} min</span>
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
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/quiz" data-tooltip-target="start-quiz">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm sm:text-base">Start Quiz</h3>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">Test your knowledge</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/badges">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 border-yellow-200 dark:border-yellow-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1 text-sm sm:text-base">Achievements</h3>
                  <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-300">View your badges</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1 text-sm sm:text-base">Leaderboard</h3>
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300">See rankings</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1 text-sm sm:text-base">Analytics</h3>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-300">Track progress</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        ```
This update adds a consistent logo to the home page header.
<replit_final_file>
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
import { useTooltipGuide } from '@/contexts/TooltipGuideContext';

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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Start Your Medical Learning Journey
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-3 sm:px-4 text-sm sm:text-base">
          Choose from comprehensive medical categories with authentic questions from authoritative medical textbooks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {Object.entries(categories).map(([mainCategory, subcategories]) => (
          <Card key={mainCategory} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base sm:text-lg">
                {mainCategory === 'Anatomy' && <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500" />}
                {mainCategory === 'Physiology' && <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />}
                {mainCategory === 'Other Subjects' && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />}
                <span className="dark:text-white">{mainCategory}</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {subcategories.length} topics available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                {subcategories.slice(0, 3).map((sub) => (
                  <div key={sub} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    • {sub}
                  </div>
                ))}
                {subcategories.length > 3 && (
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    +{subcategories.length - 3} more topics
                  </div>
                )}
              </div>
              <Link href={`/quiz?category=${encodeURIComponent(mainCategory)}`}>
                <Button className="w-full text-sm sm:text-base" style={{ backgroundColor: '#3399FF' }}>
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
  const { startGuide } = useTooltipGuide();

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

  // Fetch user rank - using simple values to avoid React Error #31
  const { data: userRankResponse } = useQuery({
    queryKey: ['/api/user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user-rank?userId=${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  const defaultStats = {
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    averageScore: 0,
    totalQuestions: 0,
    totalStudyTime: 0,
    rank: 0
  };

  const stats = userStats || defaultStats;

  // Safe extraction of rank data
  const userRank = userRankResponse?.rank || stats.rank || 'Unranked';
  const userTotalXP = userRankResponse?.totalXP || 0;
  const userAccuracy = userRankResponse?.averageAccuracy || 0;

  // Refresh data when returning to Home page
  useEffect(() => {
    if (user?.id) {
      refetchStats();
      refetchQuizzes();
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] });
    }
  }, [user?.id, refetchStats, refetchQuizzes, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section with Personalized Greeting */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12" data-tooltip="welcome-message">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {getTimeBasedGreeting()}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-2">
              Ready to continue your medical learning journey?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => startGuide('home')}
              className="mt-4 mx-auto"
            >
              <Star className="w-4 h-4 mr-2" />
              Take a Quick Tour
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/DocDot Medical Student Logo.png" 
              alt="DocDot Medical Student Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#1C1C1C' }}>
                DocDot Medical Learning
              </h1>
            </div>
          </div>

          {/* Quick Study Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                  {loadingStats ? '...' : String(Math.round((stats.totalStudyTime || 0) / 60))}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Minutes Today</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  {loadingStats ? '...' : String(stats.currentStreak || 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                  {loadingStats ? '...' : String(stats.totalXP || 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total XP</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                  Level {loadingStats ? '...' : String(stats.currentLevel || 1)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Your Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h2>
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Detailed Analytics</span>
                <span className="sm:hidden">View Details</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" data-tooltip="user-stats">
            {/* XP and Level */}
            <Card className="sm:col-span-1 lg:col-span-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                  XP & Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {loadingStats ? '...' : (stats.totalXP ? stats.totalXP.toLocaleString() : '0')}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Level {loadingStats ? '...' : String(stats.currentLevel || 1)}
                </div>
                <Progress 
                  value={loadingStats ? 0 : ((stats.totalXP % 1000) / 1000) * 100} 
                  className="mt-2 h-2" 
                />
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {loadingStats ? '...' : String(1000 - ((stats.totalXP || 0) % 1000))} XP to next level
                </div>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-orange-600 dark:text-orange-400" />
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {loadingStats ? '...' : String(stats.currentStreak || 0)}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300">days active</div>
                <div className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                  Best: {loadingStats ? '...' : String(stats.longestStreak || 0)} days
                </div>
              </CardContent>
            </Card>

            {/* Accuracy */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center">
                  <Target className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                  Overall Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">
                  {loadingStats ? '...' : String(Math.round(stats.averageScore || 0))}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  {loadingStats ? '...' : String(stats.correctAnswers || 0)} of {loadingStats ? '...' : String(stats.totalQuestions || 0)} correct
                </div>
              </CardContent>
            </Card>

            {/* Global Rank */}
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center">
                  <Trophy className="w-4 h-4 mr-1 text-purple-600 dark:text-purple-400" />
                  Global Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  #{String(userRank)}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300">
                  {(userRank !== 'Unranked' && Number(userRank) <= 100) ? 'Top 100!' : 'Keep studying!'}
                </div>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs w-full sm:w-auto">
                    View Leaderboard <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gamification Features */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Gamification Hub
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Badge Collection */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-base sm:text-lg">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                  Badge Collection
                </CardTitle>
                <CardDescription className="text-sm dark:text-gray-300">
                  Earn achievements for your study milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {badgeData?.earned?.length || 0}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
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
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${
                        i < (badgeData?.earned?.length || 0) 
                          ? 'text-white' 
                          : 'text-gray-400'
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
                          // Refresh actual user data without adding fake data
                          await Promise.all([
                            queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/category-stats'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/daily-stats'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/badges'] }),
                            queryClient.invalidateQueries({ queryKey: ['/api/user-rank'] })
                          ]);

                          console.log('Analytics data refreshed');
                        } catch (error) {
                         console.error('Error refreshing user data:', error);
                        }
                      }
                    }}
                  >
                    Refresh Analytics
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
                    #{String(userRank)}
                  </div>
                  <div className="text-sm text-purple-700">
                    Global Rank
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{String(userTotalXP)} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{String(Math.round(userAccuracy))}%</span>
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
                    {String(stats.currentStreak || 0)}
                  </div>
                  <div className="text-sm text-green-700">
                    Day Streak
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-medium">{String(Math.round((stats.totalTimeSpent || 0) / 60))} min</span>
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
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/quiz" data-tooltip-target="start-quiz">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm sm:text-base">Start Quiz</h3>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">Test your knowledge</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/badges">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 border-yellow-200 dark:border-yellow-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1 text-sm sm:text-base">Achievements</h3>
                  <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-300">View your badges</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1 text-sm sm:text-base">Leaderboard</h3>
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300">See rankings</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1 text-sm sm:text-base">Analytics</h3>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-300">Track progress</p>
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