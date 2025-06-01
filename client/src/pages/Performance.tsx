import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award, 
  BarChart3,
  Zap,
  Star,
  Crown,
  Medal,
  Brain,
  Zap as Fire,
  CheckCircle,
  Users,
  Activity,
  BookOpen,
  Heart,
  Lightbulb,
  Timer,
  PieChart,
  LineChart,
  TrendingDown
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock data based on your bot structure - replace with real data from your backend
const mockUserStats = {
  user_id: 1,
  username: "medical_student",
  total_attempts: 287,
  correct_answers: 234,
  streak: 8,
  max_streak: 15,
  xp_points: 2450,
  level: 25,
  daily_streak: 12,
  badges: [
    "🔥 Week Warrior",
    "📚 Scholar", 
    "🎯 Perfectionist",
    "⚡ Lightning Round",
    "🏅 Anatomy Master",
    "🌟 Level 25"
  ],
  weekly_challenge_score: 185,
  total_study_time: 1520, // minutes
  category_stats: {
    "Anatomy": { attempts: 89, correct: 78 },
    "Physiology": { attempts: 95, correct: 82 },
    "Histology and Embryology": { attempts: 53, correct: 41 },
    "Biostatistics": { attempts: 25, correct: 18 },
    "Behavioral Science": { attempts: 25, correct: 15 }
  },
  daily_performance: {
    "2024-01-15": { attempts: 12, correct: 10, time_spent: 45, topics: ["Anatomy", "Physiology"] },
    "2024-01-14": { attempts: 8, correct: 7, time_spent: 30, topics: ["Anatomy"] },
    "2024-01-13": { attempts: 15, correct: 13, time_spent: 55, topics: ["Physiology", "Histology and Embryology"] }
  },
  topic_time_tracking: {
    "Anatomy": { total_time: 450, questions: 89, avg_time_per_q: 5.1 },
    "Physiology": { total_time: 520, questions: 95, avg_time_per_q: 5.5 },
    "Histology and Embryology": { total_time: 280, questions: 53, avg_time_per_q: 5.3 }
  },
  weakness_patterns: {
    "Anatomy": { error_count: 11, improvement_trend: [true, false, true, true, true, true, false, true, true, true] },
    "Physiology": { error_count: 13, improvement_trend: [false, true, true, false, true, true, true, true, false, true] }
  },
  concept_mastery: {
    "Anatomy": { mastery_level: 87, progression: [75, 80, 85, 87] },
    "Physiology": { mastery_level: 86, progression: [70, 78, 82, 86] },
    "Histology and Embryology": { mastery_level: 77, progression: [65, 70, 75, 77] }
  }
};

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, username: "MedGenius2024", xp: 3250, level: 33, badge: "👑 Grand Master" },
  { rank: 2, username: "AnatomyAce", xp: 2890, level: 29, badge: "🥈 Expert" },
  { rank: 3, username: "PhysioProud", xp: 2750, level: 28, badge: "🥉 Scholar" },
  { rank: 4, username: "medical_student", xp: 2450, level: 25, badge: "🌟 Rising Star" },
  { rank: 5, username: "StudyBuddy", xp: 2340, level: 24, badge: "📚 Dedicated" }
];

export default function Performance() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const stats = mockUserStats;
  const accuracy = ((stats.correct_answers / stats.total_attempts) * 100).toFixed(1);
  const levelProgress = ((stats.xp_points % 100) / 100) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header Section */}
      <div className="px-8 py-8" style={{ backgroundColor: '#D1E8F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#1C1C1C' }}>
                Performance Dashboard
              </h1>
              <p className="text-lg" style={{ color: '#2E2E2E' }}>
                Track your progress, analytics, and achievements
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#3399FF' }}>Level {stats.level}</div>
                <div className="text-sm" style={{ color: '#2E2E2E' }}>{stats.xp_points} XP</div>
              </div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: '#1C1C1C' }}>
                Level {stats.level} Progress
              </span>
              <span className="text-sm" style={{ color: '#2E2E2E' }}>
                {stats.xp_points % 100}/100 XP to Level {stats.level + 1}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-300" 
                style={{ 
                  backgroundColor: '#3399FF', 
                  width: `${levelProgress}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">My Statistics</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="leaderboard">Leadership Position</TabsTrigger>
            <TabsTrigger value="gamification">Gamified System</TabsTrigger>
          </TabsList>

          {/* My Statistics Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>Total Questions</p>
                      <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>{stats.total_attempts}</p>
                    </div>
                    <BookOpen className="w-8 h-8" style={{ color: '#3399FF' }} />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>Accuracy Rate</p>
                      <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>{accuracy}%</p>
                    </div>
                    <Target className="w-8 h-8" style={{ color: '#3399FF' }} />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>Current Streak</p>
                      <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>{stats.streak}</p>
                    </div>
                    <Zap className="w-8 h-8" style={{ color: '#3399FF' }} />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>Study Time</p>
                      <p className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>{Math.round(stats.total_study_time / 60)}h</p>
                    </div>
                    <Clock className="w-8 h-8" style={{ color: '#3399FF' }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Category Performance</CardTitle>
                <CardDescription>Your performance across different medical subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.category_stats).map(([category, categoryStats]) => {
                    const categoryAccuracy = ((categoryStats.correct / categoryStats.attempts) * 100).toFixed(1);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium" style={{ color: '#1C1C1C' }}>{category}</span>
                          <span className="text-sm" style={{ color: '#2E2E2E' }}>
                            {categoryStats.correct}/{categoryStats.attempts} ({categoryAccuracy}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              backgroundColor: '#3399FF', 
                              width: `${categoryAccuracy}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Recent Achievements</CardTitle>
                <CardDescription>Your latest badges and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                      <Award className="w-5 h-5" style={{ color: '#3399FF' }} />
                      <span className="text-sm font-medium" style={{ color: '#1C1C1C' }}>{badge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Topic Time Analysis */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Time Analysis by Topic</CardTitle>
                <CardDescription>How much time you spend on each subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.topic_time_tracking).map(([topic, timeData]) => (
                    <div key={topic} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: '#1C1C1C' }}>{topic}</h4>
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>
                          {timeData.questions} questions • {Math.round(timeData.total_time / 60)} minutes total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: '#3399FF' }}>{timeData.avg_time_per_q.toFixed(1)}s</p>
                        <p className="text-xs" style={{ color: '#2E2E2E' }}>avg per question</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Concept Mastery */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Concept Mastery Levels</CardTitle>
                <CardDescription>Your understanding progression in each subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(stats.concept_mastery).map(([concept, masteryData]) => (
                    <div key={concept} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: '#1C1C1C' }}>{concept}</span>
                        <span className="font-semibold" style={{ color: '#3399FF' }}>{masteryData.mastery_level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-500" 
                          style={{ 
                            backgroundColor: masteryData.mastery_level >= 80 ? '#10B981' : 
                                           masteryData.mastery_level >= 60 ? '#F59E0B' : '#EF4444', 
                            width: `${masteryData.mastery_level}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {masteryData.mastery_level >= 80 && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <span className="text-xs" style={{ color: '#2E2E2E' }}>
                          {masteryData.mastery_level >= 80 ? 'Mastered' : 
                           masteryData.mastery_level >= 60 ? 'Good Progress' : 'Needs Practice'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weakness Patterns */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Areas for Improvement</CardTitle>
                <CardDescription>Topics that need more attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.weakness_patterns).map(([topic, weaknessData]) => {
                    const recentTrend = weaknessData.improvement_trend.slice(-5);
                    const improvement = recentTrend.filter(x => x).length / recentTrend.length;
                    
                    return (
                      <div key={topic} className="p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium" style={{ color: '#1C1C1C' }}>{topic}</h4>
                          <div className="flex items-center space-x-1">
                            {improvement >= 0.6 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm" style={{ color: improvement >= 0.6 ? '#10B981' : '#EF4444' }}>
                              {improvement >= 0.6 ? 'Improving' : 'Needs Focus'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>
                          {weaknessData.error_count} errors • Recent trend: {(improvement * 100).toFixed(0)}% correct
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leadership Position Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Global Leaderboard</CardTitle>
                <CardDescription>See how you rank among all medical students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLeaderboard.map((player) => (
                    <div 
                      key={player.rank} 
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        player.username === 'medical_student' ? 'ring-2 ring-blue-300' : ''
                      }`}
                      style={{ 
                        backgroundColor: player.username === 'medical_student' ? '#D1E8F9' : '#FFFFFF'
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white"
                             style={{ 
                               backgroundColor: player.rank === 1 ? '#FFD700' : 
                                              player.rank === 2 ? '#C0C0C0' : 
                                              player.rank === 3 ? '#CD7F32' : '#3399FF' 
                             }}>
                          {player.rank}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#1C1C1C' }}>
                            {player.username}
                            {player.username === 'medical_student' && (
                              <span className="ml-2 text-sm" style={{ color: '#3399FF' }}>(You)</span>
                            )}
                          </p>
                          <p className="text-sm" style={{ color: '#2E2E2E' }}>{player.badge}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: '#1C1C1C' }}>Level {player.level}</p>
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>{player.xp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Weekly Challenge</CardTitle>
                <CardDescription>Compete with others in this week's challenge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-3xl font-bold" style={{ color: '#3399FF' }}>{stats.weekly_challenge_score}</p>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Points this week</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#D1E8F9' }}>
                    <p className="font-medium" style={{ color: '#1C1C1C' }}>🏆 Challenge: Anatomy Marathon</p>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Answer 100 anatomy questions correctly this week</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          backgroundColor: '#3399FF', 
                          width: `${Math.min(100, (stats.weekly_challenge_score / 100) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gamified System Tab */}
          <TabsContent value="gamification" className="space-y-6">
            {/* XP and Level System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#1C1C1C' }}>Experience Points</CardTitle>
                  <CardDescription>Your learning journey progress</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <p className="text-4xl font-bold" style={{ color: '#3399FF' }}>{stats.xp_points}</p>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Total XP Earned</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium" style={{ color: '#1C1C1C' }}>
                      Level {stats.level} → Level {stats.level + 1}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full" 
                        style={{ 
                          backgroundColor: '#3399FF', 
                          width: `${levelProgress}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs" style={{ color: '#2E2E2E' }}>
                      {100 - (stats.xp_points % 100)} XP needed for next level
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#F7FAFC' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#1C1C1C' }}>Streak Counters</CardTitle>
                  <CardDescription>Keep the momentum going</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Fire className="w-5 h-5" style={{ color: '#EF4444' }} />
                      <span style={{ color: '#1C1C1C' }}>Current Streak</span>
                    </div>
                    <span className="font-bold" style={{ color: '#EF4444' }}>{stats.streak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5" style={{ color: '#F59E0B' }} />
                      <span style={{ color: '#1C1C1C' }}>Best Streak</span>
                    </div>
                    <span className="font-bold" style={{ color: '#F59E0B' }}>{stats.max_streak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" style={{ color: '#3399FF' }} />
                      <span style={{ color: '#1C1C1C' }}>Daily Streak</span>
                    </div>
                    <span className="font-bold" style={{ color: '#3399FF' }}>{stats.daily_streak} days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements Gallery */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Achievement Gallery</CardTitle>
                <CardDescription>All your earned badges and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stats.badges.map((badge, index) => (
                    <div key={index} className="text-center p-4 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: '#D1E8F9' }}>
                      <div className="text-3xl mb-2">{badge.split(' ')[0]}</div>
                      <p className="text-sm font-medium" style={{ color: '#1C1C1C' }}>
                        {badge.substring(badge.indexOf(' ') + 1)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rewards and Motivation */}
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1C1C1C' }}>Next Milestones</CardTitle>
                <CardDescription>Goals to work towards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5" style={{ color: '#F59E0B' }} />
                      <span style={{ color: '#1C1C1C' }}>Answer 300 questions</span>
                    </div>
                    <span className="text-sm" style={{ color: '#2E2E2E' }}>{stats.total_attempts}/300</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="flex items-center space-x-3">
                      <Medal className="w-5 h-5" style={{ color: '#3399FF' }} />
                      <span style={{ color: '#1C1C1C' }}>Reach Level 30</span>
                    </div>
                    <span className="text-sm" style={{ color: '#2E2E2E' }}>Level {stats.level}/30</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="flex items-center space-x-3">
                      <Fire className="w-5 h-5" style={{ color: '#EF4444' }} />
                      <span style={{ color: '#1C1C1C' }}>Achieve 20-day streak</span>
                    </div>
                    <span className="text-sm" style={{ color: '#2E2E2E' }}>{stats.streak}/20</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}