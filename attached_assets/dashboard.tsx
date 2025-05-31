import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import type { User, QuizAttempt } from "@shared/schema";

interface UserStats {
  quizzesCompleted: number;
  averageScore: number;
  streak: number;
  rank: number;
}

interface RecentQuiz extends QuizAttempt {
  quiz: {
    title: string;
  };
}

export default function Dashboard() {

  const { data: userProfile } = useQuery<User>({
    queryKey: ['/api/user/profile'],
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
  });

  const { data: recentQuizzes } = useQuery<RecentQuiz[]>({
    queryKey: ['/api/user/recent-quizzes'],
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatScore = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Brain className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-gray-900">QuizMaster</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {userProfile.fullName.split(' ')[0]}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/20 p-8">
          <CardContent className="p-0">
            {/* User Profile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {getInitials(userProfile.fullName)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{userProfile.fullName}</h2>
                  <p className="text-gray-600">{userProfile.email}</p>
                </div>
              </div>
              <LogoutButton variant="ghost" />
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userStats?.quizzesCompleted || 0}
                </div>
                <div className="text-sm text-blue-600">Quizzes</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userStats?.averageScore || 0}%
                </div>
                <div className="text-sm text-green-600">Avg Score</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userStats?.streak || 0}
                </div>
                <div className="text-sm text-purple-600">Day Streak</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  #{userStats?.rank || '--'}
                </div>
                <div className="text-sm text-orange-600">Ranking</div>
              </div>
            </div>

            {/* Recent Quizzes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Quizzes</h3>
              {recentQuizzes && recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {recentQuizzes.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{attempt.quiz.title}</div>
                          <div className="text-sm text-gray-500">
                            Completed {formatTimeAgo(attempt.completedAt.toString())}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {formatScore(attempt.score, attempt.totalQuestions)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {attempt.totalQuestions} questions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
                  <p className="text-gray-500 mb-4">Start your first quiz to see your progress here</p>
                  <Button 
                    onClick={() => window.location.href = '/quizzes'}
                    className="bg-gradient-to-r from-primary to-secondary text-white"
                  >
                    Browse Quizzes
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
