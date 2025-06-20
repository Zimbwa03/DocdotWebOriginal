
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, Target, Zap, Calendar, TrendingUp, Award, 
  BookOpen, Clock, Brain, BarChart3, Users, Star,
  CheckCircle, XCircle, ArrowUp, ArrowDown, Minus, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  currentLevel: number;
  totalStudyTime: number;
  rank: number;
}

interface CategoryPerformance {
  category: string;
  questions_attempted: number;
  correct_answers: number;
  average_score: number;
  average_time: number;
  mastery: number;
  last_attempted: string;
}

interface DailyPerformance {
  date: string;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  study_time: number;
  xp_earned: number;
  categories_studied: string[];
}

interface QuizAttempt {
  id: number;
  category: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: string;
  xpEarned: number;
  attemptedAt: string;
}

export default function EnhancedAnalytics() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryPerformance[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyPerformance[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Real-time analytics fetching
  const fetchAnalytics = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    console.log('📊 Fetching enhanced analytics for user:', user.id);

    try {
      // Parallel fetch for better performance
      const [statsRes, categoryRes, dailyRes, quizzesRes] = await Promise.all([
        fetch(`/api/user-stats/${user.id}`),
        fetch(`/api/category-stats/${user.id}`),
        fetch(`/api/daily-stats/${user.id}?days=30`),
        fetch(`/api/quiz-attempts/${user.id}?limit=20`)
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUserStats(stats);
        console.log('📊 User stats updated:', stats);
      }

      if (categoryRes.ok) {
        const categories = await categoryRes.json();
        setCategoryStats(categories);
        console.log('📊 Category stats updated:', categories.length, 'categories');
      }

      if (dailyRes.ok) {
        const daily = await dailyRes.json();
        setDailyStats(daily);
        console.log('📊 Daily stats updated:', daily.length, 'days');
      }

      if (quizzesRes.ok) {
        const quizzes = await quizzesRes.json();
        setRecentQuizzes(quizzes);
        console.log('📊 Recent quizzes updated:', quizzes.length, 'attempts');
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching enhanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for analytics updates from quiz completions
  useEffect(() => {
    const handleAnalyticsUpdate = () => {
      console.log('📈 Received analytics update event, refreshing...');
      fetchAnalytics();
    };

    window.addEventListener('analytics-update', handleAnalyticsUpdate);
    return () => window.removeEventListener('analytics-update', handleAnalyticsUpdate);
  }, [user?.id]);

  // Initial load and periodic refresh
  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
      
      // Refresh every 2 minutes for real-time updates
      const interval = setInterval(fetchAnalytics, 120000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Calculate derived metrics
  const getPerformanceTrend = () => {
    if (!dailyStats || dailyStats.length < 2) return 'stable';
    const recent = dailyStats.slice(0, 7);
    const previous = dailyStats.slice(7, 14);
    
    if (recent.length === 0 || previous.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, day) => sum + (day.accuracy || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, day) => sum + (day.accuracy || 0), 0) / previous.length;
    
    if (recentAvg > previousAvg + 5) return 'improving';
    if (recentAvg < previousAvg - 5) return 'declining';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateWeakestAreas = () => {
    return categoryStats
      .filter(cat => cat.questions_attempted >= 3)
      .sort((a, b) => a.average_score - b.average_score)
      .slice(0, 3);
  };

  const calculateStrongestAreas = () => {
    return categoryStats
      .filter(cat => cat.questions_attempted >= 3)
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, 3);
  };

  // Chart colors
  const COLORS = ['#3399FF', '#00C896', '#FF6B6B', '#FFD93D', '#6BCF7F', '#FF8A65'];

  if (loading && !userStats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3399FF' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header with Real-time Updates */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Live Analytics Dashboard</h1>
        <p className="text-lg text-gray-600 mb-4">Real-time insights into your medical learning journey</p>
        <div className="flex items-center justify-center gap-4">
          <Button 
            onClick={fetchAnalytics} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Real-time KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{userStats?.totalQuestions || 0}</div>
            <p className="text-xs text-blue-600">
              {userStats?.correctAnswers || 0} correct answers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{userStats?.averageScore || 0}%</div>
            <div className="flex items-center text-xs text-green-600">
              {getTrendIcon(getPerformanceTrend())}
              <span className="ml-1">Performance trend</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Study Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{userStats?.currentStreak || 0}</div>
            <p className="text-xs text-orange-600">
              Best: {userStats?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">XP & Level</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">Level {userStats?.currentLevel || 1}</div>
            <p className="text-xs text-purple-600">
              {userStats?.totalXP?.toLocaleString() || 0} XP total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Daily Performance (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats?.slice(0, 30).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        name === 'accuracy' ? `${value}%` : value,
                        name === 'accuracy' ? 'Accuracy' : 'Questions'
                      ]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" stroke="#3399FF" strokeWidth={2} name="Accuracy %" />
                    <Line type="monotone" dataKey="questions_answered" stroke="#00C896" strokeWidth={2} name="Questions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryStats?.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Accuracy']} />
                    <Bar dataKey="average_score" fill="#3399FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Trophy className="h-5 w-5" />
                  Top Performing Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculateStrongestAreas().map((area, index) => (
                    <div key={area.category} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-green-900">{area.category}</p>
                          <p className="text-sm text-green-600">{area.questions_attempted} questions</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {area.average_score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculateWeakestAreas().map((area, index) => (
                    <div key={area.category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-red-900">{area.category}</p>
                          <p className="text-sm text-red-600">{area.questions_attempted} questions</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {area.average_score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XP Earning Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  XP Earning Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyStats?.slice(0, 30).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value} XP`, 'XP Earned']}
                    />
                    <Area type="monotone" dataKey="xp_earned" stroke="#FFD93D" fill="#FEF3C7" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Study Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Study Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyStats?.slice(0, 14).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value} min`, 'Study Time']}
                    />
                    <Bar dataKey="study_time" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            {categoryStats?.map((category) => (
              <Card key={category.category} className="bg-gradient-to-r from-gray-50 to-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        category.mastery >= 80 ? 'bg-green-100 text-green-800' :
                        category.mastery >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.mastery}% Mastery
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{category.questions_attempted}</div>
                      <p className="text-sm text-gray-600">Questions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{category.correct_answers}</div>
                      <p className="text-sm text-gray-600">Correct</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{category.average_score}%</div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{Math.round(category.average_time || 0)}s</div>
                      <p className="text-sm text-gray-600">Avg Time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {category.last_attempted ? new Date(category.last_attempted).toLocaleDateString() : 'Never'}
                      </div>
                      <p className="text-sm text-gray-600">Last Attempt</p>
                    </div>
                  </div>
                  <Progress value={category.mastery} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-red-600" />
                Learning Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPerformanceTrend() === 'improving' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                      <ArrowUp className="w-4 h-4" />
                      Excellent Progress!
                    </div>
                    <p className="text-green-700">Your performance is improving consistently. Keep up the great work!</p>
                  </div>
                )}
                
                {calculateWeakestAreas().length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                      <Target className="w-4 h-4" />
                      Focus Areas
                    </div>
                    <p className="text-yellow-700">
                      Consider spending more time on: {calculateWeakestAreas().map(area => area.category).join(', ')}
                    </p>
                  </div>
                )}

                {userStats && userStats.currentStreak > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                      <Zap className="w-4 h-4" />
                      Study Streak Active
                    </div>
                    <p className="text-blue-700">
                      You're on a {userStats.currentStreak}-day streak! Don't break the momentum.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Recent Quiz Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentQuizzes?.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        attempt.isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {attempt.isCorrect ? 
                          <CheckCircle className="w-4 h-4 text-green-600" /> : 
                          <XCircle className="w-4 h-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{attempt.category}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(attempt.attemptedAt).toLocaleDateString()} • {attempt.timeSpent}s
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={attempt.isCorrect ? "default" : "destructive"}>
                        {attempt.isCorrect ? 'Correct' : 'Wrong'}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">+{attempt.xpEarned} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
