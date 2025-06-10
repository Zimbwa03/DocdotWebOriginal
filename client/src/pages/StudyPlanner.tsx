import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyState } from "@/contexts/StudyStateContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, Target, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().optional().default(""),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(1).default(60),
  notes: z.string().optional().default(""),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface StudySession {
  id: number;
  userId: string;
  title: string;
  subject: string;
  topic?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudyPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedDate, setSelectedDate } = useStudyState();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      subject: "",
      topic: "",
      date: selectedDate || new Date(),
      startTime: "",
      endTime: "",
      duration: 60,
      notes: "",
    },
  });

  // Update form date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate);
    }
  }, [selectedDate, form]);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['/api/study-sessions', user?.id],
    enabled: !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: SessionFormData) => {
      if (!user) throw new Error('User not authenticated');

      const payload = {
        userId: user.id,
        title: sessionData.title,
        subject: sessionData.subject,
        topic: sessionData.topic || "",
        date: sessionData.date.toISOString().split('T')[0],
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: sessionData.duration,
        notes: sessionData.notes || "",
        status: 'planned'
      };

      return apiRequest('/api/study-sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast({
        title: "Study session created!",
        description: "Your study session has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions', user?.id] });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Error creating study session:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create study session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return apiRequest(`/api/study-sessions/${sessionId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Session deleted",
        description: "The study session has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    try {
      await createSessionMutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getSessionsForDate = (date: Date) => {
    if (!Array.isArray(sessions)) return [];

    const dateString = date.toISOString().split('T')[0];
    return sessions.filter((session: StudySession) => 
      session.date === dateString
    );
  };

  const sessionsForSelectedDate = selectedDate ? getSessionsForDate(selectedDate) : [];

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to access the study planner.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Study Calendar
              </CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Create Study Session</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
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
                              <FormControl>
                                <Input placeholder="e.g., Anatomy" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="topic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Topic (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Cardiovascular System" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                                  onChange={(e) => field.onChange(Number(e.target.value) || 60)}
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
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-4">
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
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date && !isNaN(date.getTime())) {
                  setSelectedDate(date);
                }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Sessions for selected date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {selectedDate ? format(selectedDate, "MMM d") : "Today"}'s Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">Loading sessions...</p>
                  </div>
                ) : sessionsForSelectedDate.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No sessions planned</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Session
                    </Button>
                  </div>
                ) : (
                  sessionsForSelectedDate.map((session: StudySession) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-gray-600">
                            {session.subject}
                            {session.topic && ` - ${session.topic}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-xs text-gray-500 mt-2">{session.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {session.duration}min
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSessionMutation.mutate(session.id)}
                            disabled={deleteSessionMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Study Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Study Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Array.isArray(sessions) ? sessions.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Array.isArray(sessions) 
                  ? sessions.reduce((total: number, session: StudySession) => total + session.duration, 0)
                  : 0
                }
              </div>
              <div className="text-sm text-muted-foreground">Minutes Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {sessionsForSelectedDate.length}
              </div>
              <div className="text-sm text-muted-foreground">Today's Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}