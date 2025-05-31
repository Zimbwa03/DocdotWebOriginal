import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays, parseISO, isEqual, isToday } from "date-fns";
import StudyTabs from "@/components/study/StudyTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Calendar as CalendarIcon, Clock, Edit, Trash2 } from "lucide-react";
import { fetchStudySessions, createStudySession, updateStudySession, deleteStudySession, fetchCategories } from "@/lib/apiClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Schema for study session form
const sessionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const StudyPlannerPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch study sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/study-sessions'],
    queryFn: fetchStudySessions
  });

  // Fetch categories for form select
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: fetchCategories
  });

  // Session form
  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      startTime: "",
      endTime: "",
      status: "scheduled",
      isRecurring: false,
      recurringPattern: "",
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: createStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Study session created successfully",
      });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<SessionFormData> }) => 
      updateStudySession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      setIsDialogOpen(false);
      setSelectedSession(null);
      form.reset();
      toast({
        title: "Success",
        description: "Study session updated successfully",
      });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (id: number) => deleteStudySession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      setSelectedSession(null);
      toast({
        title: "Success",
        description: "Study session deleted successfully",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SessionFormData) => {
    if (selectedSession) {
      updateSessionMutation.mutate({ id: selectedSession.id, data });
    } else {
      createSessionMutation.mutate(data);
    }
  };

  // Open form dialog to add new session
  const handleAddSession = () => {
    // Set default times for the selected date
    const today = new Date(selectedDate);
    today.setHours(9, 0, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(10, 30, 0, 0);

    form.reset({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      startTime: today.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16),
      status: "scheduled",
      isRecurring: false,
      recurringPattern: "",
    });
    setSelectedSession(null);
    setIsDialogOpen(true);
  };

  // Open form dialog to edit session
  const handleEditSession = (session: any) => {
    form.reset({
      title: session.title,
      description: session.description || "",
      category: session.category,
      subcategory: session.subcategory || "",
      startTime: new Date(session.startTime).toISOString().slice(0, 16),
      endTime: new Date(session.endTime).toISOString().slice(0, 16),
      status: session.status,
      isRecurring: session.isRecurring || false,
      recurringPattern: session.recurringPattern || "",
    });
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  // Handle delete session
  const handleDeleteSession = () => {
    if (selectedSession) {
      deleteSessionMutation.mutate(selectedSession.id);
      setIsDialogOpen(false);
    }
  };

  // Filter sessions for the selected date
  const getSessionsForDate = (date: Date) => {
    if (!sessions) return [];
    
    return sessions.filter((session: any) => {
      const sessionDate = new Date(session.startTime);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    }).sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  // Format session time
  const formatSessionTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <>
      <Helmet>
        <title>Study Planner - DocDot</title>
        <meta 
          name="description" 
          content="Plan and schedule your study sessions to optimize your learning and stay organized."
        />
      </Helmet>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/study">
            <Button variant="ghost" className="inline-flex items-center px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Study Center
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Schedule and organize your study sessions to maximize productivity.
            </p>
          </div>
          <Button onClick={handleAddSession} className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            New Study Session
          </Button>
        </div>

        <StudyTabs />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view or add study sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar 
                mode="single" 
                selected={selectedDate} 
                onSelect={(date) => date && setSelectedDate(date)} 
                className="rounded-md border"
                modifiers={{
                  booked: sessions?.map((s: any) => new Date(s.startTime)) || [],
                }}
                modifiersStyles={{
                  booked: { 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    color: 'var(--primary)', 
                    borderRadius: '0' 
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Sessions for selected date */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  {isToday(selectedDate) && " (Today)"}
                </CardTitle>
                <CardDescription>
                  Your study sessions for the selected date
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleAddSession}>
                <Plus className="mr-2 h-4 w-4" />
                Add Session
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  {getSessionsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
                      {getSessionsForDate(selectedDate).map((session: any) => (
                        <div 
                          key={session.id} 
                          className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                            <CalendarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{session.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(session.status)}`}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </span>
                            </div>
                            {session.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {session.description}
                              </p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatSessionTime(session.startTime, session.endTime)}
                              <span className="mx-2">•</span>
                              {session.category}
                              {session.subcategory && ` / ${session.subcategory}`}
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditSession(session)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No study sessions scheduled
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You don't have any study sessions scheduled for this date.
                      </p>
                      <Button onClick={handleAddSession}>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule a Session
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Session Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedSession ? "Edit Study Session" : "Create Study Session"}</DialogTitle>
              <DialogDescription>
                {selectedSession 
                  ? "Update the details of your study session" 
                  : "Schedule a new study session to stay organized"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cardiovascular System Review" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of what you'll study" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: string) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Heart Anatomy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
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
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {selectedSession && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter className="flex justify-between items-center">
                  {selectedSession && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleDeleteSession}
                      disabled={deleteSessionMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  <div>
                    <Button 
                      type="submit" 
                      disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                    >
                      {selectedSession 
                        ? updateSessionMutation.isPending ? "Updating..." : "Update Session"
                        : createSessionMutation.isPending ? "Creating..." : "Create Session"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default StudyPlannerPage;
