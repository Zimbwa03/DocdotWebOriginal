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
  Sparkles,
  MousePointer2,
  Lightbulb
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function AnimatedCounter({ value, duration = 2000 }: { value: number | string; duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(String(value));
    if (start === end) return;

    let totalMilSecDur = parseInt(String(duration));
    let incrementTime = (totalMilSecDur / end) * 1000;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function QuizSection() {
  const categories = {
    "Anatomy": {
      icon: Heart,
      color: "from-red-500 to-pink-600",
      bgColor: "from-red-50 to-pink-50",
      textColor: "text-red-900",
      subcategories: [
        "Head and Neck",
        "Upper Limb", 
        "Thorax",
        "Lower Limb",
        "Pelvis and Perineum",
        "Neuroanatomy",
        "Abdomen"
      ]
    },
    "Physiology": {
      icon: Activity,
      color: "from-blue-500 to-cyan-600", 
      bgColor: "from-blue-50 to-cyan-50",
      textColor: "text-blue-900",
      subcategories: [
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
      ]
    },
    "Other Subjects": {
      icon: BookOpen,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50", 
      textColor: "text-green-900",
      subcategories: [
        "Biostatistics",
        "Histology and Embryology"
      ]
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur animate-pulse"></div>
            <img 
              src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
              alt="DocDot Medical Student Logo" 
              className="relative h-16 w-auto transform hover:scale-110 transition-all duration-500"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
              Start Your Medical Learning Journey
            </h2>
            <div className="flex items-center justify-center space-x-2 text-lg text-gray-600 dark:text-gray-300">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span>Powered by AI Intelligence</span>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
          Choose from comprehensive medical categories with <span className="font-semibold text-blue-600">authentic questions</span> from 
          <span className="font-semibold text-purple-600"> authoritative medical textbooks</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(categories).map(([mainCategory, categoryData], index) => {
          const IconComponent = categoryData.icon;
          return (
            <div
              key={mainCategory}
              className="group relative"
              style={{
                animationDelay: `${index * 200}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"
                   style={{
                     background: `linear-gradient(135deg, ${categoryData.color.split(' ')[1]}, ${categoryData.color.split(' ')[3]})`
                   }}></div>
              
              <Link href={`/quiz?category=${encodeURIComponent(mainCategory)}`}>
                <Card className={`relative hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-transparent bg-gradient-to-br ${categoryData.bgColor} dark:from-gray-800 dark:to-gray-700 h-full transform hover:-translate-y-2 group-hover:scale-105`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryData.color} shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                    </div>
                    <CardTitle className={`text-2xl font-bold ${categoryData.textColor} dark:text-white mb-2`}>
                      {mainCategory}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{categoryData.subcategories.length} comprehensive topics</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      {categoryData.subcategories.slice(0, 3).map((subcategory, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center space-x-3 p-2 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm transform hover:translate-x-2 transition-transform duration-200"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subcategory}</span>
                        </div>
                      ))}
                      {categoryData.subcategories.length > 3 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic pl-5">
                          +{categoryData.subcategories.length - 3} more comprehensive topics
                        </div>
                      )}
                    </div>
                    
                    <Button className={`w-full bg-gradient-to-r ${categoryData.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-3`}>
                      <Play className="w-5 h-5 mr-2" />
                      Start Learning Journey
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Dr Student';
    
    if (hour >= 5 && hour < 12) {
      return { text: `Good Morning, ${firstName}!`, emoji: '☀️', gradient: 'from-yellow-400 to-orange-500' };
    } else if (hour >= 12 && hour < 17) {
      return { text: `Good Afternoon, ${firstName}!`, emoji: '🌤️', gradient: 'from-blue-400 to-cyan-500' };
    } else if (hour >= 17 && hour < 21) {
      return { text: `Good Evening, ${firstName}!`, emoji: '🌆', gradient: 'from-orange-400 to-pink-500' };
    } else {
      return { text: `Good Night, ${firstName}!`, emoji: '🌙', gradient: 'from-purple-400 to-indigo-600' };
    }
  };

  // Fetch user statistics
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
    refetchInterval: 30000,
  });

  // Fetch badges
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg animate-pulse"></div>
                <img 
                  src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
                  alt="DocDot Medical Student Logo" 
                  className="relative h-20 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  Docdot Medical Platform
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span>Authentic questions from authoritative medical textbooks</span>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
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

  const greeting = getGreeting();
  const earnedBadges = badgeData?.earned || [];

  return (
    <div className="min-h-screen bg-docdot-light dark:bg-docdot-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Animated Header */}
        <div className={`text-center mb-12 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] rounded-full opacity-10 animate-pulse"></div>
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-heading mb-4 transform hover:scale-105 transition-transform duration-300">
                {greeting.text} <span className="text-6xl">{greeting.emoji}</span>
              </h1>
              <p className="text-xl text-body mb-6">
                Ready to continue your medical learning journey?
              </p>
              
              <Button variant="outline" className="group relative overflow-hidden bg-docdot-white/80 backdrop-blur-sm hover:bg-docdot-white transition-all duration-300 border-primary-docdot">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Star className="w-4 h-4 mr-2 text-primary-docdot group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-heading">Take a Quick Tour</span>
                <Lightbulb className="w-4 h-4 ml-2 text-primary-docdot group-hover:animate-pulse" />
              </Button>
            </div>
          </div>
        </div>

        {/* Docdot Platform Badge with Animation */}
        <div className="flex items-center justify-center mb-12">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-docdot-white/90 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-docdot-lg border border-[#D1E8F9] transform hover:scale-105 transition-all duration-300">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] rounded-full blur animate-pulse"></div>
                <img 
                  src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
                  alt="DocDot Medical Student Logo" 
                  className="relative h-12 w-auto transform group-hover:rotate-12 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-heading">
                  Docdot Medical Platform
                </h3>
                <p className="text-body flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-primary-docdot" />
                  <span>Authentic questions from authoritative medical textbooks</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Minutes Today', value: stats.currentStreak, icon: Clock, color: '#3399FF' },
            { label: 'Day Streak', value: stats.currentStreak, icon: Flame, color: '#3399FF' },
            { label: 'Total XP', value: stats.totalXP, icon: Star, color: '#3399FF' },
            { label: `Level ${stats.level}`, value: '', icon: Crown, color: '#3399FF' }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl"></div>
                
                <Card className="card-docdot relative text-center transform hover:-translate-y-2 hover:shadow-docdot-lg transition-all duration-500 group-hover:scale-105 border-[#D1E8F9]">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transform group-hover:rotate-180 transition-transform duration-500 shadow-lg"
                      style={{ backgroundColor: stat.color }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-heading mb-2">
                      {stat.value ? <AnimatedCounter value={stat.value} /> : stat.label}
                    </div>
                    <div className="text-sm text-body font-medium">
                      {stat.value ? stat.label : 'Your Level'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Analytics Dashboard with Advanced Animations */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-heading">
              Analytics Dashboard
            </h2>
            <Button variant="outline" className="group relative overflow-hidden border-primary-docdot hover:bg-docdot-navbar-alt">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <BarChart3 className="w-4 h-4 mr-2 text-primary-docdot group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-heading">Detailed Analytics</span>
              <ArrowRight className="w-4 h-4 ml-2 text-primary-docdot group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'XP & Level',
                value: stats.totalXP.toLocaleString(),
                subtitle: `Level ${stats.level}`,
                progress: 45,
                progressText: '180 XP to next level',
                icon: Zap,
                bgColor: '#D1E8F9'
              },
              {
                title: 'Study Streak',
                value: stats.currentStreak,
                subtitle: 'days active',
                extraText: 'Best: 2 days',
                icon: Calendar,
                bgColor: '#D1E8F9'
              },
              {
                title: 'Overall Accuracy',
                value: `${stats.averageScore}%`,
                subtitle: '57 of 60 correct',
                icon: Target,
                bgColor: '#D1E8F9'
              },
              {
                title: 'Global Rank',
                value: `#${stats.rank}`,
                subtitle: 'Top 100!',
                hasButton: true,
                icon: Trophy,
                bgColor: '#D1E8F9'
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: isLoaded ? 'fadeInScale 0.8s ease-out forwards' : 'none'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl"></div>
                  
                  <Card 
                    className="card-docdot relative border-2 hover:border-primary-docdot transform hover:-translate-y-2 hover:shadow-docdot-lg transition-all duration-500 group-hover:scale-105"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div 
                          className="p-2 rounded-xl mr-3 transform group-hover:rotate-12 transition-transform duration-300 shadow-lg"
                          style={{ backgroundColor: '#3399FF' }}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-body">{item.title}</span>
                      </div>
                      
                      <div className="text-3xl font-bold text-heading mb-2">
                        {typeof item.value === 'number' ? <AnimatedCounter value={item.value} /> : item.value}
                      </div>
                      
                      <div className="text-sm text-body mb-3">{item.subtitle}</div>
                      
                      {item.progress && (
                        <>
                          <Progress value={item.progress} className="h-2 mb-2" />
                          <div className="text-xs text-body">{item.progressText}</div>
                        </>
                      )}
                      
                      {item.extraText && (
                        <div className="text-xs text-body">{item.extraText}</div>
                      )}
                      
                      {item.hasButton && (
                        <Link href="/leaderboard">
                          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-primary-docdot hover:text-primary-docdot/80 group/btn">
                            View Leaderboard 
                            <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gamification Hub with Interactive Elements */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-heading mb-8">
            Gamification Hub
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Badge Collection',
                description: 'Earn achievements for your study milestones',
                value: earnedBadges.length,
                valueLabel: 'Badges Earned',
                icon: Award,
                badges: true
              },
              {
                title: 'Leaderboard',
                description: 'Compete with fellow medical students',
                value: `#${stats.rank}`,
                valueLabel: 'Global Rank',
                icon: Trophy
              },
              {
                title: 'Study Motivation',
                description: 'Keep your learning streak alive',
                hasWelcome: true,
                icon: Brain
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative"
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: isLoaded ? 'slideInRight 0.8s ease-out forwards' : 'none'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl"></div>
                  
                  <Card 
                    className="card-docdot relative border-2 hover:border-primary-docdot transform hover:-translate-y-2 hover:shadow-docdot-lg transition-all duration-500 group-hover:scale-105 h-full"
                    style={{ backgroundColor: '#D1E8F9' }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div 
                          className="p-3 rounded-xl mr-3 transform group-hover:rotate-12 transition-transform duration-300 shadow-lg"
                          style={{ backgroundColor: '#3399FF' }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold text-heading">{item.title}</span>
                      </div>
                      
                      <p className="text-body mb-6 leading-relaxed">{item.description}</p>
                      
                      {item.value && (
                        <div className="text-center">
                          <div className="text-4xl font-bold text-heading mb-2">
                            {typeof item.value === 'number' ? <AnimatedCounter value={item.value} /> : item.value}
                          </div>
                          <div className="text-sm text-body mb-4">{item.valueLabel}</div>
                        </div>
                      )}
                      
                      {item.badges && (
                        <div className="flex justify-center space-x-2">
                          {[1,2,3,4].map(i => (
                            <div 
                              key={i} 
                              className="w-8 h-8 rounded-full shadow-lg transform hover:scale-125 transition-transform duration-200 cursor-pointer"
                              style={{
                                backgroundColor: '#3399FF',
                                animationDelay: `${i * 100}ms`,
                                animation: 'bounceIn 0.6s ease-out forwards'
                              }}
                            ></div>
                          ))}
                        </div>
                      )}
                      
                      {item.hasWelcome && (
                        <div className="bg-docdot-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#D1E8F9]">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-primary-docdot" />
                            <span className="font-semibold text-heading">Welcome to Docdot!</span>
                          </div>
                          <div className="text-sm text-body">You have successfully signed in.</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions with Enhanced Interactions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-heading mb-8">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { title: 'Start Quiz', description: 'Test your knowledge', icon: Play, href: '/quiz' },
              { title: 'Achievements', description: 'View your badges', icon: Award, href: '/badges' },
              { title: 'Leaderboard', description: 'See rankings', icon: Trophy, href: '/leaderboard' },
              { title: 'Analytics', description: 'Track progress', icon: BarChart3, href: '/analytics' }
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div
                  key={action.title}
                  className="group relative"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isLoaded ? 'zoomIn 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#66CCFF] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl"></div>
                  
                  <Link href={action.href}>
                    <Card 
                      className="card-docdot relative hover:shadow-docdot-lg transition-all duration-500 cursor-pointer border-2 hover:border-primary-docdot transform hover:-translate-y-3 group-hover:scale-110"
                      style={{ backgroundColor: '#D1E8F9' }}
                    >
                      <CardContent className="p-6 text-center">
                        <div 
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-xl group-hover:shadow-2xl"
                          style={{ backgroundColor: '#3399FF' }}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-heading mb-2 text-lg">{action.title}</h3>
                        <p className="text-sm text-body group-hover:text-heading transition-colors duration-300">
                          {action.description}
                        </p>
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-5 h-5 mx-auto text-primary-docdot" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Quiz Section */}
        <QuizSection />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 1s ease-out;
        }
      `}</style>
    </div>
  );
}