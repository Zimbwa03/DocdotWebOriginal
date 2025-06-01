import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus
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

  // Refresh data when returning to Home page
  useEffect(() => {
    if (user?.id) {
      refetchStats();
      refetchQuizzes();
      // Invalidate all related queries to force refresh
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

        {/* User Statistics Dashboard - Mobile Responsive */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6 text-center lg:text-left">
            Your Progress Dashboard
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* XP and Level */}
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  XP & Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                  {loadingStats ? '...' : stats.totalXp?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Level {loadingStats ? '...' : stats.level || 1}
                </div>
                <Progress value={loadingStats ? 0 : ((stats.totalXp % 1000) / 1000) * 100} className="mt-2" />
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-orange-500" />
                  Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-orange-600">
                  {loadingStats ? '...' : stats.currentStreak || 0}
                </div>
                <div className="text-sm text-gray-500">days</div>
              </CardContent>
            </Card>

            {/* Accuracy */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Target className="w-4 h-4 mr-1 text-green-500" />
                  Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-green-600">
                  {loadingStats ? '...' : Math.round(stats.averageAccuracy || 0)}%
                </div>
                <div className="text-sm text-gray-500">average</div>
              </CardContent>
            </Card>

            {/* Global Rank */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Trophy className="w-4 h-4 mr-1 text-purple-500" />
                  Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-purple-600">
                  #{loadingStats ? '...' : stats.rank || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">global</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats Row - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 lg:p-3 rounded-full bg-blue-100">
                  <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-lg lg:text-xl font-bold text-gray-900">
                    {loadingStats ? '...' : stats.totalQuizzes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Quizzes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 lg:p-3 rounded-full bg-green-100">
                  <Timer className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-lg lg:text-xl font-bold text-gray-900">
                    {loadingStats ? '...' : Math.round((stats.totalTimeSpent || 0) / 60)}
                  </div>
                  <div className="text-sm text-gray-600">Minutes Studied</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 lg:p-3 rounded-full bg-purple-100">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-lg lg:text-xl font-bold text-gray-900">
                    {loadingStats ? '...' : stats.rank ? `Top ${Math.round(((stats.rank || 1) / 100) * 100)}%` : 'Unranked'}
                  </div>
                  <div className="text-sm text-gray-600">Percentile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Study Features - Professional Layout */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">
            Study Tools & Resources
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Today's Study Plan */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Anatomy Review</span>
                    <Badge variant="outline" className="text-blue-600">30 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Physiology Quiz</span>
                    <Badge variant="outline" className="text-green-600">20 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Case Studies</span>
                    <Badge variant="outline" className="text-purple-600">25 min</Badge>
                  </div>
                </div>
                <Progress value={45} className="mt-4" />
                <p className="text-xs text-gray-600 mt-2">3 of 7 tasks completed today</p>
              </CardContent>
            </Card>

            {/* Recent Notes */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Study Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Cardiovascular System</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Respiratory Physiology</span>
                    <span className="text-xs text-gray-500">Yesterday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Nervous System</span>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Note
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards - Mobile Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            <Link href="/quiz">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 lg:p-6 text-center">
                  <GraduationCap className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-3 text-blue-600" />
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2">Take Quiz</h3>
                  <p className="text-gray-600 text-xs lg:text-sm mb-3">Test your knowledge</p>
                  <Button size="sm" className="w-full" style={{ backgroundColor: '#3399FF' }}>
                    Start <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 lg:p-6 text-center">
                  <BarChart3 className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-3 text-green-600" />
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600 text-xs lg:text-sm mb-3">Track progress</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 lg:p-6 text-center">
                <Brain className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-3 text-purple-600" />
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2">AI Tutor</h3>
                <p className="text-gray-600 text-xs lg:text-sm mb-3">Get help</p>
                <Button size="sm" variant="outline" className="w-full">
                  Chat <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 lg:p-6 text-center">
                <Trophy className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-3 text-orange-600" />
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2">Achievements</h3>
                <p className="text-gray-600 text-xs lg:text-sm mb-3">View badges</p>
                <Button size="sm" variant="outline" className="w-full">
                  Explore <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity - Mobile Responsive */}
        {recentQuizzes && recentQuizzes.length > 0 && (
          <div className="mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {recentQuizzes.slice(0, 5).map((quiz: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center mb-2 lg:mb-0">
                        <div className={`w-3 h-3 rounded-full mr-3 ${quiz.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium text-gray-900 text-sm lg:text-base">
                            {quiz.category || 'Medical Quiz'}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500">
                            {quiz.isCorrect ? 'Correct' : 'Incorrect'} • {quiz.xpEarned || 0} XP earned
                          </div>
                        </div>
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500 self-start lg:self-center">
                        {new Date(quiz.attemptedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Categories */}
        <QuizSection />
      </div>
    </div>
  );
}