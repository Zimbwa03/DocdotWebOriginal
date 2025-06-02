import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, Target, Zap, Calendar, TrendingUp, Award, 
  BookOpen, Clock, Brain, BarChart3, Users, Star,
  CheckCircle, XCircle, ArrowUp, ArrowDown, Minus
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
  questionsAttempted: number;
  correctAnswers: number;
  averageScore: number;
  averageTime: number;
  mastery: number;
  lastAttempted: string;
  improvement: number;
}

interface DailyPerformance {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  studyTime: number;
  xpEarned: number;
  categoriesStudied: string[];
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
  
  // Fetch comprehensive user statistics
  const { data: userStats, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user-stats/${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch category performance data
  const { data: categoryStats } = useQuery({
    queryKey: ['/api/category-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/category-stats/${user.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch daily performance trends
  const { data: dailyStats } = useQuery({
    queryKey: ['/api/daily-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/daily-stats/${user.id}?days=30`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch recent quiz attempts
  const { data: recentQuizzes } = useQuery({
    queryKey: ['/api/quiz-attempts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/quiz-attempts/${user.id}?limit=20`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Calculate derived metrics
  const calculateWeakestAreas = () => {
    if (!categoryStats) return [];
    return categoryStats
      .filter((cat: CategoryPerformance) => cat.questionsAttempted >= 5)
      .sort((a: CategoryPerformance, b: CategoryPerformance) => a.averageScore - b.averageScore)
      .slice(0, 3);
  };

  const calculateStrongestAreas = () => {
    if (!categoryStats) return [];
    return categoryStats
      .filter((cat: CategoryPerformance) => cat.questionsAttempted >= 5)
      .sort((a: CategoryPerformance, b: CategoryPerformance) => b.averageScore - a.averageScore)
      .slice(0, 3);
  };

  const getPerformanceTrend = () => {
    if (!dailyStats || dailyStats.length < 2) return 'stable';
    const recent = dailyStats.slice(0, 7);
    const previous = dailyStats.slice(7, 14);
    
    const recentAvg = recent.reduce((sum: number, day: DailyPerformance) => sum + day.accuracy, 0) / recent.length;
    const previousAvg = previous.reduce((sum: number, day: DailyPerformance) => sum + day.accuracy, 0) / previous.length;
    
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

  // Chart colors
  const COLORS = ['#3399FF', '#00C896', '#FF6B6B', '#FFD93D', '#6BCF7F', '#FF8A65'];

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3399FF' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Advanced Analytics Dashboard</h1>
        <p className="text-lg text-gray-600">Comprehensive insights into your medical learning journey</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{String(userStats?.totalQuestions || 0)}</div>
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
            <div className="text-3xl font-bold text-green-900">{String(userStats?.averageScore || 0)}%</div>
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
            <div className="text-3xl font-bold text-orange-900">{String(userStats?.currentStreak || 0)}</div>
            <p className="text-xs text-orange-600">
              Best: {String(userStats?.longestStreak || 0)} days
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
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview Charts */}
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
                    <Line type="monotone" dataKey="questionsAnswered" stroke="#00C896" strokeWidth={2} name="Questions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
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
                    <Bar dataKey="averageScore" fill="#3399FF" radius={[4, 4, 0, 0]} />
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
                  {calculateStrongestAreas().map((area: CategoryPerformance, index: number) => (
                    <div key={area.category} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-green-900">{area.category}</p>
                          <p className="text-sm text-green-600">{area.questionsAttempted} questions</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {area.averageScore}%
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
                  {calculateWeakestAreas().map((area: CategoryPerformance, index: number) => (
                    <div key={area.category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-red-900">{area.category}</p>
                          <p className="text-sm text-red-600">{area.questionsAttempted} questions</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {area.averageScore}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            {categoryStats?.map((category: CategoryPerformance) => (
              <Card key={category.category} className="bg-gradient-to-r from-gray-50 to-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                    <div className="flex items-center gap-2">
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{category.questionsAttempted}</div>
                      <p className="text-sm text-gray-600">Questions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{category.correctAnswers}</div>
                      <p className="text-sm text-gray-600">Correct</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{category.averageScore}%</div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{Math.round(category.averageTime)}s</div>
                      <p className="text-sm text-gray-600">Avg Time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {category.lastAttempted ? new Date(category.lastAttempted).toLocaleDateString() : 'Never'}
                      </div>
                      <p className="text-sm text-gray-600">Last Attempt</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Mastery</span>
                      <span>{category.mastery}%</span>
                    </div>
                    <Progress 
                      value={category.mastery} 
                      className="h-2"
                      style={{
                        '--progress-background': category.mastery >= 80 ? '#10B981' : 
                                               category.mastery >= 60 ? '#F59E0B' : '#EF4444'
                      } as React.CSSProperties}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    <Area type="monotone" dataKey="xpEarned" stroke="#FFD93D" fill="#FEF3C7" strokeWidth={2} />
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
                    <Bar dataKey="studyTime" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weaknesses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-red-600" />
                Detailed Weakness Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {calculateWeakestAreas().map((area: CategoryPerformance) => (
                  <div key={area.category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-red-800">{area.category}</h3>
                      <Badge variant="destructive">{area.averageScore}% Accuracy</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Questions Attempted</p>
                        <p className="font-semibold">{area.questionsAttempted}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Wrong Answers</p>
                        <p className="font-semibold text-red-600">{area.questionsAttempted - area.correctAnswers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Response Time</p>
                        <p className="font-semibold">{Math.round(area.averageTime)}s</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Improvement Needed</p>
                      <Progress value={100 - area.averageScore} className="h-2" />
                    </div>
                  </div>
                ))}
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
                {recentQuizzes?.map((attempt: QuizAttempt) => (
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