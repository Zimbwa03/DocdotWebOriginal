import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Timer, Target, Users, Book, TrendingUp, Award, Clock, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import StudyTimer from "./StudyTimer";
import StudyPlanner from "./StudyPlanner";
import StudyGroups from "./StudyGroups";
import GoogleDriveResourcesGrid from "@/components/GoogleDriveResourcesGrid";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function StudyGuide() {
  const [activeTab, setActiveTab] = useState("timer");
  const [studyStats] = useState({
    totalTime: 245,
    sessionsCompleted: 18,
    averageSession: 25,
    currentStreak: 7
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging
  console.log('StudyGuide searchQuery:', searchQuery);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Guide</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive medical education resources and study tools
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="timer" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Study Timer
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Study Planner
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Books & Resources
            </TabsTrigger>
          </TabsList>

          {/* Study Timer Tab */}
          <TabsContent value="timer" className="space-y-6" forceMount>
            <div className={cn("space-y-6", { "hidden": activeTab !== "timer" })}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Pomodoro Study Timer
                  </CardTitle>
                  <CardDescription>
                    Focus your study sessions with timed intervals and break reminders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudyTimer />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Planner Tab */}
          <TabsContent value="planner" className="space-y-6" forceMount>
            <div className={cn("space-y-6", { "hidden": activeTab !== "planner" })}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Study Session Planner
                  </CardTitle>
                  <CardDescription>
                    Schedule and organize your study sessions for optimal learning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudyPlanner />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6" forceMount>
            <div className={cn("space-y-6", { "hidden": activeTab !== "groups" })}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Collaborative Study Groups
                  </CardTitle>
                  <CardDescription>
                    Join or create study groups with fellow medical students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudyGroups />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Books & Resources Tab */}
          <TabsContent value="resources" className="space-y-6" forceMount>
            <div className={cn("space-y-6", { "hidden": activeTab !== "resources" })}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Medical Books & Resources
                  </CardTitle>
                  <CardDescription>
                    Access your medical textbooks and study materials from Google Drive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary>
                    <GoogleDriveResourcesGrid searchQuery={searchQuery} />
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}