import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, Target, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().optional(),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(1),
  notes: z.string().optional(),
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Fetch study sessions with user authentication
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['/api/study-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log("🔍 Fetching study sessions for user:", user.id);
      const response = await fetch(`/api/study-sessions?userId=${user.id}`);
      if (!response.ok) {
        console.error("Failed to fetch study sessions:", response.status);
        return [];
      }
      const data = await response.json();
      console.log("📚 Study sessions received:", data?.length || 0);
      // Ensure we return an array and filter out any null/invalid entries
      return Array.isArray(data) ? data.filter(session => session && session.id) : [];
    },
    enabled: !!user?.id,
  });

  // Form setup
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

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      const sessionData = {
        userId: user.id,
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        date: data.date.toISOString().split('T')[0],
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        notes: data.notes,
      };

      console.log('🔧 Creating study session with data:', sessionData);

      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Study session creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create session');
      }
      
      const result = await response.json();
      console.log('✅ Study session created successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions', user?.id] });
      setShowCreateDialog(false);
      setEditingSession(null);
      form.reset();
      toast({
        title: "Study session created successfully!",
        description: "Your session has been added to your planner."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating study session",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SessionFormData> }) => {
      const response = await fetch(`/api/study-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions', user?.id] });
      setEditingSession(null);
      form.reset();
      toast({
        title: "Study session updated successfully!"
      });
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/study-sessions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions', user?.id] });
      toast({
        title: "Study session deleted successfully!"
      });
    }
  });

  const onSubmit = (data: SessionFormData) => {
    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, data });
    } else {
      createSessionMutation.mutate(data);
    }
  };

  const handleEdit = (session: StudySession) => {
    setEditingSession(session);
    form.reset({
      title: session.title,
      subject: session.subject,
      topic: session.topic || "",
      date: new Date(session.date),
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      notes: session.notes || "",
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this study session?")) {
      deleteSessionMutation.mutate(id);
    }
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter((session: StudySession) => 
      session && session.date && session.date.startsWith(dateStr)
    );
  };

  const selectedDateSessions = getSessionsForDate(selectedDate);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading study planner...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Planner</h1>
          <p className="text-gray-600 mt-2">Schedule and organize your study sessions</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSession(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Edit Study Session" : "Create Study Session"}
              </DialogTitle>
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
                        <Input placeholder="e.g., Upper Limb" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes or goals for this session" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                  >
                    {createSessionMutation.isPending || updateSessionMutation.isPending 
                      ? (editingSession ? 'Updating...' : 'Creating...') 
                      : (editingSession ? 'Update Session' : 'Create Session')
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Sessions for Selected Date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Sessions for {format(selectedDate, 'MMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateSessions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions planned</h3>
                <p className="text-gray-600 mb-4">Create a new study session to get started.</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateSessions.filter(session => session && session.id).map((session: StudySession) => (
                  <div 
                    key={session.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{session.title || 'Untitled Session'}</h4>
                        <p className="text-sm text-gray-600">{session.subject || 'No Subject'}</p>
                        {session.topic && (
                          <Badge variant="secondary" className="mt-1">
                            {session.topic}
                          </Badge>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.startTime} - {session.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {session.duration} min
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-2">{session.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(session)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Statistics */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Study Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sessions.filter(session => session && typeof session.duration === 'number').reduce((total: number, session: StudySession) => total + session.duration, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(sessions.filter(session => session && session.subject).map((session: StudySession) => session.subject)).size}
                </div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {sessions.filter((session: StudySession) => 
                    session && session.date && new Date(session.date) >= new Date(new Date().setDate(new Date().getDate() - 7))
                  ).length}
                </div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}