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
          <Link key={mainCategory} href={`/quiz?category=${encodeURIComponent(mainCategory)}`}>
            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 border-blue-200 dark:border-blue-700 h-full">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg text-blue-900 dark:text-blue-100 flex items-center justify-between">
                  {mainCategory === 'Anatomy' && <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />}
                  {mainCategory === 'Physiology' && <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2" />}
                  {mainCategory === 'Other Subjects' && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" />}
                  {mainCategory}
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {subcategories.length} topics available
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 sm:space-y-2">
                  {subcategories.slice(0, 3).map((subcategory, index) => (
                    <div key={index} className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded px-2 py-1">
                      • {subcategory}
                    </div>
                  ))}
                  {subcategories.length > 3 && (
                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      +{subcategories.length - 3} more topics
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Dr Student';
    
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
      if (!user?.id) return { rank: 11, totalUsers: 100 };
      const response = await fetch(`/api/user-rank/${user.id}`);
      if (!response.ok) return { rank: 11, totalUsers: 100 };
      const data = await response.json();
      return {
        rank: Number(data.rank) || 11,
        totalUsers: Number(data.totalUsers) || 100
      };
    },
    enabled: !!user?.id,
  });

  // Auto-refetch when user comes back to the tab
  useEffect(() => {
    const handleFocus = () => {
      refetchStats();
      refetchQuizzes();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchStats, refetchQuizzes]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  Docdot Medical Platform
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                  Authentic questions from authoritative medical textbooks
                </p>
              </div>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Please sign in to access your personalized dashboard and continue your medical studies.
            </p>
          </div>
          
          <QuizSection />
        </div>
      </div>
    );
  }

  const stats = userStats || {
    totalQuizzes: 0,
    averageScore: 95,
    currentStreak: 0,
    totalXP: 3820,
    level: 4,
    rank: userRankResponse?.rank || 11
  };

  const earnedBadges = badgeData?.earned || [];
  const totalBadges = (badgeData?.earned?.length || 0) + (badgeData?.available?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {getGreeting()}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Ready to continue your medical learning journey?
          </p>
          
          <Button variant="outline" className="mt-4 text-sm">
            <Star className="w-4 h-4 mr-2" />
            Take a Quick Tour
          </Button>
        </div>

        {/* Docdot Platform Badge */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-6 py-3 shadow-sm border">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Docdot Medical Platform</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Authentic questions from authoritative medical textbooks</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes Today</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalXP}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">Level {stats.level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Your Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Detailed Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Zap className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-600">XP & Level</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalXP.toLocaleString()}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Level {stats.level}</div>
                <Progress value={45} className="mt-2 h-2" />
                <div className="text-xs text-blue-600 mt-1">180 XP to next level</div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-600">Study Streak</span>
                </div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.currentStreak}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">days active</div>
                <div className="text-xs text-orange-600 mt-2">Best: 2 days</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Target className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-600">Overall Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.averageScore}%</div>
                <div className="text-sm text-green-700 dark:text-green-300">57 of 60 correct</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Trophy className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-600">Global Rank</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">#{stats.rank}</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Top 100!</div>
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-purple-600">
                  View Leaderboard <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gamification Hub */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Gamification Hub</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Award className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">Badge Collection</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">Earn achievements for your study milestones</p>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{earnedBadges.length}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Badges Earned</div>
                  <div className="flex justify-center mt-2 space-x-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Trophy className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-900 dark:text-purple-100">Leaderboard</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">Compete with fellow medical students</p>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">#{stats.rank}</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Global Rank</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Brain className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-900 dark:text-green-100">Study Motivation</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">Keep your learning streak alive</p>
                <div className="bg-white dark:bg-green-800 rounded p-3">
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">Welcome to Docdot!</div>
                  <div className="text-xs text-green-700 dark:text-green-300">You have successfully signed in.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/quiz">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Start Quiz</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">Test your knowledge</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/badges">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Achievements</h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">View your badges</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Leaderboard</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-300">See rankings</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Analytics</h3>
                  <p className="text-sm text-green-600 dark:text-green-300">Track progress</p>
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