import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Target, Zap, Calendar, TrendingUp, Award, 
  BookOpen, Clock, Brain, BarChart3, Users, Star 
} from 'lucide-react';

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

interface CategoryStats {
  category: string;
  questionsAttempted: number;
  correctAnswers: number;
  averageScore: number;
  averageTime: number;
  mastery: number;
  lastAttempted: string;
}

interface DailyStats {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  studyTime: number;
  xpEarned: number;
  categoriesStudied: string[];
}

interface LeaderboardEntry {
  userId: string;
  rank: number;
  score: number;
  totalQuestions: number;
  accuracy: number;
}

export default function Analytics() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get user ID from localStorage (set by auth)
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No user data found');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.id;

      // Fetch user stats
      const statsResponse = await fetch(`/api/user-stats/${userId}`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats);
      }

      // Fetch category stats
      const categoryResponse = await fetch(`/api/category-stats/${userId}`);
      if (categoryResponse.ok) {
        const categories = await categoryResponse.json();
        setCategoryStats(categories);
      }

      // Fetch daily stats
      const dailyResponse = await fetch(`/api/daily-stats/${userId}?days=7`);
      if (dailyResponse.ok) {
        const daily = await dailyResponse.json();
        setDailyStats(daily);
      }

      // Fetch leaderboard
      const leaderboardResponse = await fetch('/api/leaderboard?limit=10');
      if (leaderboardResponse.ok) {
        const board = await leaderboardResponse.json();
        setLeaderboard(board.entries || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXPForNextLevel = (currentLevel: number) => {
    return currentLevel * 1000;
  };

  const getCurrentLevelXP = (totalXP: number, currentLevel: number) => {
    return totalXP - ((currentLevel - 1) * 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3399FF' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img 
            src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
            alt="DocDot Medical Student Logo" 
            className="h-14 w-auto"
          />
          <h1 className="text-4xl font-bold" style={{ color: '#1C1C1C' }}>Performance Analytics</h1>
        </div>
        <p className="text-lg" style={{ color: '#2E2E2E' }}>Track your learning progress and achievements</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <BookOpen className="h-4 w-4" style={{ color: '#3399FF' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalQuestions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats?.correctAnswers || 0} correct
                </p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4" style={{ color: '#3399FF' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.averageScore || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Accuracy rate
                </p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Zap className="h-4 w-4" style={{ color: '#3399FF' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.currentStreak || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Best: {userStats?.longestStreak || 0}
                </p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                <Trophy className="h-4 w-4" style={{ color: '#3399FF' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalXP || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Level {userStats?.currentLevel || 1}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" style={{ color: '#3399FF' }} />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Level {userStats?.currentLevel || 1}</span>
                  <span className="text-sm text-muted-foreground">
                    {userStats?.totalXP || 0} XP Total
                  </span>
                </div>
                <Progress 
                  value={userStats ? (getCurrentLevelXP(userStats.totalXP, userStats.currentLevel) / 1000) * 100 : 0}
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground">
                  {userStats ? Math.max(0, 1000 - getCurrentLevelXP(userStats.totalXP, userStats.currentLevel)) : 1000} XP to next level
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            {categoryStats.map((category) => (
              <Card key={category.category} style={{ backgroundColor: '#F7FAFC' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category.category}</CardTitle>
                    <Badge variant="secondary">{category.mastery}% Mastery</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{category.questionsAttempted || 0}</div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{category.averageScore || 0}%</div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(category.averageTime || 0)}s</div>
                      <p className="text-sm text-muted-foreground">Avg Time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{category.correctAnswers || 0}</div>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                  </div>
                  <Progress value={category.mastery || 0} className="mt-4 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" style={{ color: '#3399FF' }} />
                Daily Progress (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyStats.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.categoriesStudied?.length || 0} categories studied
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{day.questionsAnswered} questions</p>
                      <p className="text-sm text-muted-foreground">
                        {day.correctAnswers} correct • {day.xpEarned} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: '#3399FF' }} />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <p className="font-medium">User {entry.userId.slice(-4)}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.totalQuestions} questions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{entry.score} XP</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.accuracy}% accuracy
                      </p>
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