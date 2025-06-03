import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Zap, 
  Target, 
  Calendar,
  Users,
  Star,
  Flame,
  Award,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface LeaderboardEntry {
  id: number;
  userId: string;
  rank: number;
  totalXP: number;
  currentLevel: number;
  weeklyXP: number;
  monthlyXP: number;
  averageAccuracy: number;
  totalBadges: number;
  category?: string;
  lastActive: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  rankChange?: number; // Change from previous period
}

const rankIcons = {
  1: { icon: Crown, color: '#FFD700', bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200' },
  2: { icon: Medal, color: '#C0C0C0', bg: 'bg-gradient-to-br from-gray-100 to-gray-200' },
  3: { icon: Trophy, color: '#CD7F32', bg: 'bg-gradient-to-br from-orange-100 to-orange-200' }
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFrame, setTimeFrame] = useState<string>('all-time');

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedCategory, timeFrame, user?.id],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '50',
        timeFrame
      });
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds for better demo
    enabled: !!user?.id // Only fetch when user is authenticated
  });

  // Fetch user's rank
  const { data: userRank } = useQuery({
    queryKey: ['userRank', user?.id, selectedCategory, timeFrame],
    queryFn: async () => {
      // Get user ID from localStorage if not available in context
      let userId = user?.id;
      if (!userId) {
        const userData = localStorage.getItem('user');
        if (userData) {
          userId = JSON.parse(userData).id;
        }
      }
      
      if (!userId) return null;

      const params = new URLSearchParams({
        userId: userId,
        timeFrame
      });
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/user-rank?${params}`);
      if (!response.ok) throw new Error('Failed to fetch user rank');
      return response.json();
    },
    enabled: !!user?.id || !!localStorage.getItem('user'),
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const entries = leaderboardData?.entries || [];
  const categories = leaderboardData?.categories || [
    'Anatomy - Upper Limb', 'Anatomy - Lower Limb', 'Anatomy - Thorax', 
    'Physiology - Cardiovascular System', 'Physiology - Respiratory System'
  ];

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      const config = rankIcons[rank as keyof typeof rankIcons];
      return {
        icon: config.icon,
        color: config.color,
        bg: config.bg
      };
    }
    return { icon: Users, color: '#6B7280', bg: 'bg-gray-100' };
  };

  const getRankChange = (change?: number) => {
    if (!change || change === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <ChevronUp className="w-4 h-4 text-green-500" />;
    return <ChevronDown className="w-4 h-4 text-red-500" />;
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const rankConfig = getRankIcon(entry.rank);
    // Get current user ID from either auth context or localStorage
    let currentUserId = user?.id;
    if (!currentUserId) {
      const userData = localStorage.getItem('user');
      if (userData) {
        currentUserId = JSON.parse(userData).id;
      }
    }
    const isCurrentUser = entry.userId === currentUserId;
    const IconComponent = rankConfig.icon;

    return (
      <Card 
        key={entry.id} 
        className={`transition-all duration-200 hover:shadow-md ${
          isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Rank Icon/Number */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rankConfig.bg}`}>
                {entry.rank <= 3 ? (
                  <IconComponent className="w-6 h-6" style={{ color: rankConfig.color }} />
                ) : (
                  <span className="font-bold text-gray-600">#{String(entry.rank)}</span>
                )}
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={isCurrentUser ? 'bg-blue-100 text-blue-700' : ''}>
                    {getInitials(entry.user?.firstName, entry.user?.lastName, entry.user?.email)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="font-semibold text-gray-900 flex items-center">
                    {entry.user?.firstName && entry.user?.lastName 
                      ? `${entry.user.firstName} ${entry.user.lastName}`
                      : entry.user?.email || 'Anonymous User'
                    }
                    {isCurrentUser && (
                      <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>Level {String(entry.currentLevel)}</span>
                    <span>•</span>
                    <span>{String(Math.round(entry.averageAccuracy))}% accuracy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-right">
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-gray-900 flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  {String(timeFrame === 'weekly' ? entry.weeklyXP : 
                   timeFrame === 'monthly' ? entry.monthlyXP : entry.totalXP)} XP
                </div>
                <div className="text-xs text-gray-500">
                  {String(entry.totalBadges)} badges
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getRankChange(entry.rankChange)}
                <div className="text-xs text-gray-400">
                  {Math.abs(entry.rankChange || 0) > 0 ? String(Math.abs(entry.rankChange || 0)) : ''}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Loading rankings...</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600 mb-6">
          Compete with fellow medical students and track your progress
        </p>

        {/* Your Position Card */}
        {userRank && typeof userRank === 'object' && (
          <Card className="max-w-md mx-auto mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-900">Your Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    #{typeof userRank.rank === 'number' ? String(userRank.rank) : 'N/A'}
                  </div>
                  <div className="text-sm text-blue-700">Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {typeof userRank.totalXP === 'number' ? String(userRank.totalXP) : '0'}
                  </div>
                  <div className="text-sm text-purple-700">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {typeof userRank.averageAccuracy === 'number' ? String(Math.round(userRank.averageAccuracy)) : '0'}%
                  </div>
                  <div className="text-sm text-green-700">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Time Frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-time">All Time</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: string) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map((entry: LeaderboardEntry, index: number) => renderLeaderboardEntry(entry, index))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
              <p className="text-gray-600">
                Be the first to complete quizzes and claim the top spot!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-lg">Top Performer</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {entries[0] ? (
              <div>
                <p className="font-semibold">
                  {entries[0].user?.firstName && entries[0].user?.lastName 
                    ? `${entries[0].user.firstName} ${entries[0].user.lastName}`
                    : 'Anonymous'}
                </p>
                <p className="text-sm text-gray-600">{String(entries[0].totalXP)} XP</p>
              </div>
            ) : (
              <p className="text-gray-500">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {entries.length > 0 
                ? String(Math.round(entries.reduce((sum: number, e: LeaderboardEntry) => sum + e.averageAccuracy, 0) / entries.length))
                : '0'}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Active Students</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-blue-600">{String(entries.length)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}