import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Book,
  Search,
  Users,
  Target,
  Timer
} from "lucide-react";
import StudyGroups from "./StudyGroups";
import StudyTimer from "./StudyTimer";
import StudyPlanner from "./StudyPlanner";
import GoogleDriveResourcesGrid from "@/components/GoogleDriveResourcesGrid";

export default function StudyGuide() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
              alt="DocDot Medical Student Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Study Guide</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive medical education resources and study tools
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="timer" className="space-y-6">
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
          <TabsContent value="timer" className="space-y-6">
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
          </TabsContent>

          {/* Study Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
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
          </TabsContent>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
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
          </TabsContent>

          {/* Books & Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center mb-10">
                <h2 className="text-base text-secondary-600 dark:text-secondary-400 font-semibold tracking-wide uppercase">Resources</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Medical Education Library
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                  Access our comprehensive collection of medical textbooks and resources.
                </p>
              </div>
              
              <div className="mb-8 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search resources..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <GoogleDriveResourcesGrid searchQuery={searchQuery} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}