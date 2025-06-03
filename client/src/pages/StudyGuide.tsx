import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Book,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Search,
  Star,
  Plus,
  Users,
  Video,
  MessageCircle,
  Settings,
  ExternalLink,
  Download,
  FileText,
  Play,
  ChevronRight,
  Bookmark,
  BarChart3,
  Target,
  TrendingUp,
  Award,
  Brain,
  Lightbulb,
  Timer,
  Zap,
  CheckCircle,
  PlayCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StudyGroupsAdvanced from "@/components/StudyGroupsAdvanced";
import GoogleDriveLibrary from "@/components/GoogleDriveLibrary";

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  notes: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface StudySection {
  id: number;
  title: string;
  description: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

interface StudyTopic {
  id: number;
  section_id: number;
  title: string;
  content: string;
  difficulty_level: string;
  estimated_read_time: number;
  tags: string[];
  order_index: number;
  completion_percentage: number;
  is_bookmarked: boolean;
  notes?: string;
  last_accessed?: string;
  section_title?: string;
}

interface UserProgress {
  topics_started: number;
  topics_completed: number;
  bookmarked_topics: number;
  average_progress: number;
}

export default function StudyGuide() {
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      subject: "",
      topic: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      duration: 60,
      notes: "",
    },
  });

  // Fetch study sections
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ["/api/study-sections"],
  });

  // Fetch study topics
  const { data: topics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ["/api/study-topics", selectedSection],
    enabled: !!selectedSection,
  });

  // Fetch user progress
  const { data: progress } = useQuery<UserProgress>({
    queryKey: ["/api/user-progress"],
  });

  // Fetch study sessions
  const { data: studySessions = [] } = useQuery({
    queryKey: ["/api/study-planner-sessions"],
  });

  // Create study session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      const response = await fetch("/api/study-planner-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-planner-sessions"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: SessionFormData) => {
    createSessionMutation.mutate(data);
  };

  const getSessionsForDate = (date: Date) => {
    return studySessions.filter((session: any) => {
      const sessionDate = new Date(session.date);
      return format(sessionDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <div className="flex items-center gap-4">
            {progress && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{progress.topics_completed || 0} completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4 text-blue-500" />
                  <span>{progress.bookmarked_topics || 0} bookmarked</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content">Study Content</TabsTrigger>
            <TabsTrigger value="planner">Study Planner</TabsTrigger>
            <TabsTrigger value="groups">Study Groups</TabsTrigger>
            <TabsTrigger value="resources">Books & Resources</TabsTrigger>
            <TabsTrigger value="tips">Library</TabsTrigger>
          </TabsList>

          {/* Study Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sections Sidebar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Study Sections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {loadingSections ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      sections.map((section: StudySection) => (
                        <Button
                          key={section.id}
                          variant={selectedSection === section.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <ChevronRight className="w-4 h-4 mr-2" />
                          {section.title}
                        </Button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Topics Content */}
              <div className="lg:col-span-3">
                {selectedSection ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {sections.find((s: StudySection) => s.id === selectedSection)?.title}
                      </CardTitle>
                      <CardDescription>
                        {sections.find((s: StudySection) => s.id === selectedSection)?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingTopics ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg animate-pulse">
                              <div className="h-6 bg-gray-200 rounded mb-2" />
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {topics.map((topic: StudyTopic) => (
                            <Card key={topic.id} className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{topic.title}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge className={getDifficultyColor(topic.difficulty_level)}>
                                    {topic.difficulty_level}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {topic.estimated_read_time} min
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{topic.content}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {topic.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Bookmark className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm">
                                    <PlayCircle className="w-4 h-4 mr-1" />
                                    Study
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Select a Study Section
                      </h3>
                      <p className="text-gray-500">
                        Choose a section from the sidebar to view study topics
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Study Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Study Calendar
                    </CardTitle>
                    <CardDescription>Plan and track your study sessions</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Schedule Study Session</DialogTitle>
                        <DialogDescription>
                          Create a new study session to track your learning progress
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Session Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Anatomy Review" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="subject"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="anatomy">Anatomy</SelectItem>
                                      <SelectItem value="physiology">Physiology</SelectItem>
                                      <SelectItem value="pathology">Pathology</SelectItem>
                                      <SelectItem value="pharmacology">Pharmacology</SelectItem>
                                      <SelectItem value="biochemistry">Biochemistry</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="topic"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Topic</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Specific topic" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="startTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="endTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (min)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="15"
                                      step="15"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Add any notes or goals for this session..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={createSessionMutation.isPending}
                              className="flex-1"
                            >
                              {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Sessions for Selected Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {selectedDate ? format(selectedDate, "MMM d") : "Today's"} Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSessionsForDate(selectedDate || new Date()).map((session: any) => (
                      <Card key={session.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{session.title}</h4>
                            <Badge variant="outline">{session.subject}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{session.topic}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {session.start_time} - {session.end_time}
                          </div>
                        </div>
                      </Card>
                    ))}
                    {getSessionsForDate(selectedDate || new Date()).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No sessions scheduled for this date
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <StudyGroupsAdvanced />
          </TabsContent>

          {/* Books & Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search books and resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 1,
                  title: "Gray's Anatomy",
                  description: "Comprehensive human anatomy reference",
                  category: "Anatomy",
                  type: "textbook",
                  difficulty: "intermediate",
                  url: "https://example.com/grays-anatomy"
                },
                {
                  id: 2,
                  title: "Robbins Basic Pathology",
                  description: "Essential pathology concepts and cases",
                  category: "Pathology",
                  type: "textbook",
                  difficulty: "advanced",
                  url: "https://example.com/robbins-pathology"
                },
                {
                  id: 3,
                  title: "Physiology Lectures",
                  description: "Video series on human physiology",
                  category: "Physiology",
                  type: "video",
                  difficulty: "beginner",
                  url: "https://example.com/physiology-videos"
                }
              ].map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {resource.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <Button 
                      onClick={() => window.open(resource.url, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="tips" className="space-y-6">
            <GoogleDriveLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}