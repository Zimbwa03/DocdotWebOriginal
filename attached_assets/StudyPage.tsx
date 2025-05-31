import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import StudyTabs from "@/components/study/StudyTabs";
import StatCard from "@/components/study/StatCard";
import LearningProgressChart from "@/components/study/LearningProgressChart";
import WeakTopicsAnalyzer from "@/components/study/WeakTopicsAnalyzer";
import PersonalizedRecommendations from "@/components/study/PersonalizedRecommendations";
import UpcomingStudySessions from "@/components/study/UpcomingStudySessions";
import StudyGroupCard from "@/components/study/StudyGroupCard";
import FlashcardsCard from "@/components/study/FlashcardsCard";
import QuizHistoryCard from "@/components/study/QuizHistoryCard";
import PerformancePrediction from "@/components/study/PerformancePrediction";
import { fetchUserAnalytics, fetchUserStats } from "@/lib/apiClient";
import { 
  Timer,
  HelpCircle,
  Award,
  Flame
} from "lucide-react";

const StudyPage = () => {
  // Fetch analytics data for the stats
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/analytics/user', '30days'],
    refetchOnWindowFocus: false,
  });

  // Fetch user stats for streak information
  const { data: userStats } = useQuery({
    queryKey: ['/api/stats/user'],
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <Helmet>
        <title>Study Center - DocDot</title>
        <meta 
          name="description" 
          content="Track your progress, plan your study sessions, and improve your performance with personalized recommendations."
        />
      </Helmet>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Center</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Track your progress, plan your study sessions, and improve your performance.
            </p>
          </div>
        </div>

        {/* Study Tabs Navigation */}
        <StudyTabs />

        {/* Top Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            title="Weekly Study Time"
            value={`${analyticsData?.studyTime?.reduce((sum: number, item: any) => sum + item.hours, 0)?.toFixed(1) || 0}h`}
            icon={<Timer className="h-5 w-5 text-primary-500" />}
            change={15}
            trend="up"
            timeframe="from last week"
          />
          
          <StatCard 
            title="Questions Answered"
            value={analyticsData?.questionsAnswered || 0}
            icon={<HelpCircle className="h-5 w-5 text-primary-500" />}
            change={8}
            trend="up"
            timeframe="from last month"
          />
          
          <StatCard 
            title="Average Accuracy"
            value={`${analyticsData?.averageAccuracy || 0}%`}
            icon={<Award className="h-5 w-5 text-primary-500" />}
            change={3}
            trend="down"
            timeframe="from last month"
          />
          
          <StatCard 
            title="Study Streak"
            value={`${userStats?.studyStreak || 0} days`}
            icon={<Flame className="h-5 w-5 text-primary-500" />}
            timeframe="Keep it up!"
          />
        </div>

        {/* Charts & Analytics */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
          <LearningProgressChart />
          <WeakTopicsAnalyzer />
        </div>

        {/* Recommendations & Upcoming Sessions */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
          <PersonalizedRecommendations />
          <UpcomingStudySessions />
        </div>

        {/* Cards Section */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <StudyGroupCard />
          <FlashcardsCard />
          <QuizHistoryCard />
        </div>

        {/* Performance Prediction */}
        <PerformancePrediction />
      </main>
    </>
  );
};

export default StudyPage;
