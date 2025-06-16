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
          <Link key={mainCategory} href={`/quiz?category=${encodeURIComponent(mainCategory)}`}>
            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 border-blue-200 dark:border-blue-700 h-full">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg text-blue-900 dark:text-blue-100 flex items-center justify-between">
                  {mainCategory}
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 sm:space-y-2">
                  {subcategories.slice(0, 3).map((subcategory, index) => (
                    <div key={index} className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded px-2 py-1">
                      {subcategory}
                    </div>
                  ))}
                  {subcategories.length > 3 && (
                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      +{subcategories.length - 3} more topics
                    </div>
                  )}
                </div>
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
    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student';
    
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
      if (!user?.id) return { rank: 1, totalUsers: 1 };
      const response = await fetch(`/api/user-rank/${user.id}`);
      if (!response.ok) return { rank: 1, totalUsers: 1 };
      const data = await response.json();
      return {
        rank: Number(data.rank) || 1,
        totalUsers: Number(data.totalUsers) || 1
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
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img 
                src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
                alt="DocDot Medical Student Logo" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to DocDot
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                  Your AI-Powered Medical Learning Platform
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
    averageScore: 0,
    currentStreak: 0,
    totalXP: 0,
    level: 1,
    rank: userRankResponse?.rank || 1
  };

  const earnedBadges = badgeData?.earned || [];
  const totalBadges = (badgeData?.earned?.length || 0) + (badgeData?.available?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header with Logo */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <img 
              src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
              alt="DocDot Medical Student Logo" 
              className="h-16 w-auto transform hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Ready to continue your medical studies?
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{stats.totalQuizzes}</div>
              <div className="text-xs sm:text-sm opacity-90">Quizzes</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{stats.averageScore}%</div>
              <div className="text-xs sm:text-sm opacity-90">Avg Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-xs sm:text-sm opacity-90">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{stats.totalXP}</div>
              <div className="text-xs sm:text-sm opacity-90">Total XP</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">#{stats.rank}</div>
              <div className="text-xs sm:text-sm opacity-90">Rank</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{earnedBadges.length}/{totalBadges}</div>
              <div className="text-xs sm:text-sm opacity-90">Badges</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          <Link href="/quiz">
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

        {/* Main Quiz Section */}
        <QuizSection />
      </div>
    </div>
  );
}