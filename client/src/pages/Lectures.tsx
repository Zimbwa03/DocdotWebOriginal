import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Mic, MicOff, Play, Pause, Square, FileText, Download, 
  Search, Filter, Plus, Trash2, Eye, Clock, BookOpen, User, MapPin 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { LectureViewer } from "@/components/LectureViewer";
import type { Lecture, LectureNotes } from "@shared/schema";

interface LectureRecorderProps {
  onLectureStarted: (lectureId: string) => void;
  onLectureStopped: () => void;
  isRecording: boolean;
  currentLectureId: string | null;
}

function LectureRecorder({ onLectureStarted, onLectureStopped, isRecording, currentLectureId }: LectureRecorderProps) {
  const [formData, setFormData] = useState({
    title: "",
    module: "",
    topic: "",
    lecturer: "",
    venue: ""
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const startRecordingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/lectures/start-recording", {
        userId: user?.id,
        ...data
      });
      return await response.json();
    },
    onSuccess: (response) => {
      onLectureStarted(response.lectureId);
      toast({
        title: "Recording Started",
        description: `Started recording "${formData.title}"`,
        variant: "default"
      });
      // Reset form
      setFormData({ title: "", module: "", topic: "", lecturer: "", venue: "" });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Recording",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  const stopRecordingMutation = useMutation({
    mutationFn: async () => {
      if (!currentLectureId) return;
      const response = await apiRequest("POST", `/api/lectures/${currentLectureId}/stop-recording`);
      return await response.json();
    },
    onSuccess: () => {
      onLectureStopped();
      queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
      toast({
        title: "Recording Stopped",
        description: "Lecture is being processed with AI",
        variant: "default"
      });
    }
  });

  const handleStartRecording = () => {
    if (!formData.title || !formData.module) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the title and module",
        variant: "destructive"
      });
      return;
    }
    startRecordingMutation.mutate(formData);
  };

  const handleStopRecording = () => {
    stopRecordingMutation.mutate();
  };

  if (isRecording) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-red-700">Recording in Progress</span>
              </div>
            </div>
            <Button 
              onClick={handleStopRecording}
              disabled={stopRecordingMutation.isPending}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Stop Recording</span>
            </Button>
          </div>
          <p className="text-sm text-red-600 mt-2">Lecture is being recorded and transcribed in real-time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="w-5 h-5" />
          <span>Start New Lecture Recording</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Lecture Title *</label>
            <Input
              placeholder="e.g., Introduction to Anatomy"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-testid="input-lecture-title"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Module *</label>
            <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
              <SelectTrigger data-testid="select-module">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Anatomy">Anatomy</SelectItem>
                <SelectItem value="Physiology">Physiology</SelectItem>
                <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                <SelectItem value="Pathology">Pathology</SelectItem>
                <SelectItem value="Pharmacology">Pharmacology</SelectItem>
                <SelectItem value="Clinical Medicine">Clinical Medicine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Topic</label>
            <Input
              placeholder="e.g., Upper Limb, Cardiovascular System"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              data-testid="input-topic"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Lecturer</label>
            <Input
              placeholder="Lecturer name"
              value={formData.lecturer}
              onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
              data-testid="input-lecturer"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Venue</label>
            <Input
              placeholder="Lecture hall or location"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              data-testid="input-venue"
            />
          </div>
        </div>
        <Button 
          onClick={handleStartRecording}
          disabled={startRecordingMutation.isPending}
          className="w-full bg-red-600 hover:bg-red-700"
          data-testid="button-start-recording"
        >
          <Mic className="w-4 h-4 mr-2" />
          Start Recording
        </Button>
      </CardContent>
    </Card>
  );
}

interface LectureListProps {
  lectures: Lecture[];
  onLectureSelect: (lecture: Lecture) => void;
  onLectureDelete: (lectureId: string) => void;
  filters: {
    search: string;
    module: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

function LectureList({ lectures, onLectureSelect, onLectureDelete, filters, onFiltersChange }: LectureListProps) {
  const deleteMutation = useMutation({
    mutationFn: async (lectureId: string) => {
      const response = await apiRequest("DELETE", `/api/lectures/${lectureId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lecture Deleted",
        description: "Lecture and all associated data has been removed",
        variant: "default"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Lectures</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search lectures..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 w-64"
              data-testid="input-search-lectures"
            />
          </div>
          <Select value={filters.module} onValueChange={(value) => onFiltersChange({ ...filters, module: value })}>
            <SelectTrigger className="w-40" data-testid="select-filter-module">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All modules</SelectItem>
              <SelectItem value="Anatomy">Anatomy</SelectItem>
              <SelectItem value="Physiology">Physiology</SelectItem>
              <SelectItem value="Biochemistry">Biochemistry</SelectItem>
              <SelectItem value="Pathology">Pathology</SelectItem>
              <SelectItem value="Pharmacology">Pharmacology</SelectItem>
              <SelectItem value="Clinical Medicine">Clinical Medicine</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
            <SelectTrigger className="w-40" data-testid="select-filter-status">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All status</SelectItem>
              <SelectItem value="recording">Recording</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {lectures.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No lectures found</p>
            <p className="text-gray-400 text-sm">Start your first lecture recording above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <Card key={lecture.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{lecture.title}</h3>
                      <Badge className={getStatusColor(lecture.status)} data-testid={`status-${lecture.id}`}>
                        {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{lecture.module}</span>
                      </div>
                      {lecture.topic && (
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>{lecture.topic}</span>
                        </div>
                      )}
                      {lecture.lecturer && (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{lecture.lecturer}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(lecture.duration || 0)}</span>
                      </div>
                    </div>
                    
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(lecture.createdAt || lecture.date).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLectureSelect(lecture)}
                      data-testid={`button-view-${lecture.id}`}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLectureDelete(lecture.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${lecture.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Lectures() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLectureId, setCurrentLectureId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    module: '',
    status: ''
  });

  // Fetch user's lectures
  const { data: lectures = [], isLoading } = useQuery({
    queryKey: ["/api/lectures", user?.id, filters],
    enabled: !!user?.id,
  }) as { data: Lecture[], isLoading: boolean };

  const handleLectureStarted = (lectureId: string) => {
    setIsRecording(true);
    setCurrentLectureId(lectureId);
  };

  const handleLectureStopped = () => {
    setIsRecording(false);
    setCurrentLectureId(null);
  };

  const handleLectureDelete = (lectureId: string) => {
    if (lectureId === currentLectureId) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete a lecture that is currently being recorded",
        variant: "destructive"
      });
      return;
    }
    
    // The delete mutation is handled in LectureList component
    queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
  };

  if (selectedLecture) {
    return (
      <LectureViewer 
        lecture={selectedLecture} 
        onBack={() => setSelectedLecture(null)} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lecture Assistant</h1>
        <p className="text-gray-600">
          Record lectures with real-time transcription, mixed-language support (Shona & English), 
          and AI-powered intelligent note generation
        </p>
      </div>

      <LectureRecorder 
        onLectureStarted={handleLectureStarted}
        onLectureStopped={handleLectureStopped}
        isRecording={isRecording}
        currentLectureId={currentLectureId}
      />

      <Separator className="my-8" />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading lectures...</p>
        </div>
      ) : (
        <LectureList
          lectures={lectures}
          onLectureSelect={setSelectedLecture}
          onLectureDelete={handleLectureDelete}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}
    </div>
  );
}