import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Award, 
  Star, 
  Crown, 
  Target, 
  Zap, 
  Fire, 
  Clock, 
  Brain, 
  Heart,
  Shield,
  Gem,
  Medal,
  TrendingUp,
  Calendar,
  BookOpen,
  Users,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface BadgeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  requirement: number;
  requirementType: string;
  xpReward: number;
  color: string;
  isSecret: boolean;
  earned?: boolean;
  progress?: number;
  earnedAt?: string;
}

const tierColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF'
};

const categoryIcons = {
  performance: Trophy,
  streak: Fire,
  mastery: Brain,
  time: Clock,
  special: Star
};

export default function Badges() {
  const { user } = useAuth();

  const { data: badgeData, isLoading } = useQuery({
    queryKey: ['/api/badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return { earned: [], available: [] };
      const response = await fetch(`/api/badges/${user.id}`);
      if (!response.ok) return { earned: [], available: [] };
      return response.json();
    },
    enabled: !!user?.id,
  });

  const earnedBadges = badgeData?.earned || [];
  const availableBadges = badgeData?.available || [];

  const getIconComponent = (iconName: string) => {
    const icons = {
      Trophy, Award, Star, Crown, Target, Zap, Fire, Clock, Brain, Heart,
      Shield, Gem, Medal, TrendingUp, Calendar, BookOpen, Users
    };
    return icons[iconName as keyof typeof icons] || Trophy;
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || Trophy;
  };

  const renderBadge = (badge: BadgeData, earned = false) => {
    const IconComponent = getIconComponent(badge.icon);
    const isLocked = badge.isSecret && !earned;
    
    return (
      <Card key={badge.id} className={`relative overflow-hidden transition-all duration-300 ${
        earned ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200' : 'hover:shadow-md'
      }`}>
        {earned && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
        
        <CardHeader className="text-center pb-2">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
            earned ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' : 'bg-gray-100'
          }`} style={{ 
            backgroundColor: earned ? undefined : '#f3f4f6',
            background: earned ? `linear-gradient(135deg, ${badge.color}20, ${badge.color}40)` : undefined
          }}>
            {isLocked ? (
              <Lock className="w-8 h-8 text-gray-400" />
            ) : (
              <IconComponent 
                className="w-8 h-8" 
                style={{ color: earned ? badge.color : '#9ca3af' }}
              />
            )}
          </div>
          
          <CardTitle className={`text-lg ${earned ? 'text-gray-900' : 'text-gray-600'}`}>
            {isLocked ? '???' : badge.name}
          </CardTitle>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                backgroundColor: `${badge.color}20`,
                color: badge.color,
                border: `1px solid ${badge.color}30`
              }}
            >
              {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
            </Badge>
            {earned && badge.earnedAt && (
              <Badge variant="outline" className="text-xs">
                {new Date(badge.earnedAt).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="text-center mb-3 min-h-[40px]">
            {isLocked ? 'Complete more challenges to unlock this secret badge!' : badge.description}
          </CardDescription>
          
          {!earned && !isLocked && badge.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{badge.progress}/{badge.requirement}</span>
              </div>
              <Progress 
                value={(badge.progress / badge.requirement) * 100} 
                className="h-2"
              />
            </div>
          )}
          
          {badge.xpReward > 0 && (
            <div className="flex items-center justify-center mt-3 text-sm text-blue-600">
              <Zap className="w-4 h-4 mr-1" />
              +{badge.xpReward} XP
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievement Badges</h1>
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categorizedBadges = {
    performance: [...earnedBadges, ...availableBadges].filter(b => b.category === 'performance'),
    streak: [...earnedBadges, ...availableBadges].filter(b => b.category === 'streak'),
    mastery: [...earnedBadges, ...availableBadges].filter(b => b.category === 'mastery'),
    time: [...earnedBadges, ...availableBadges].filter(b => b.category === 'time'),
    special: [...earnedBadges, ...availableBadges].filter(b => b.category === 'special')
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievement Badges</h1>
        <p className="text-gray-600 mb-6">
          Earn badges by completing challenges and reaching milestones in your medical studies
        </p>
        
        <div className="flex justify-center gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">{availableBadges.length}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {earnedBadges.reduce((sum, badge) => sum + badge.xpReward, 0)}
            </div>
            <div className="text-sm text-gray-600">Bonus XP</div>
          </div>
        </div>
      </div>

      {/* Badge Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
          <TabsTrigger value="time">Study Time</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {earnedBadges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Earned Badges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {earnedBadges.map(badge => renderBadge(badge, true))}
              </div>
            </div>
          )}
          
          {availableBadges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Available Badges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableBadges.map(badge => renderBadge(badge, false))}
              </div>
            </div>
          )}
        </TabsContent>

        {Object.entries(categorizedBadges).map(([category, badges]) => (
          <TabsContent key={category} value={category}>
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                {React.createElement(getCategoryIcon(category), { 
                  className: "w-6 h-6 mr-2 text-blue-600" 
                })}
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {category} Badges
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {badges.map(badge => renderBadge(badge, badge.earned))}
              </div>
              
              {badges.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">No badges in this category yet</div>
                  <div className="text-sm text-gray-500">Keep studying to unlock new achievements!</div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}