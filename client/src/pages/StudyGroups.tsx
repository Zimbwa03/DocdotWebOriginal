import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyState } from "@/contexts/StudyStateContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Users, Video, Calendar, Clock, Plus, ExternalLink, Search, Filter, UserPlus, UserMinus } from "lucide-react";
import { SiZoom, SiGooglemeet } from "react-icons/si";
import { format, parseISO, isAfter, isBefore, addMinutes } from "date-fns";

interface StudyGroup {
  id: number;
  title: string;
  description: string;
  meetingLink: string;
  meetingType: 'zoom' | 'meet';
  scheduledTime: string;
  duration: number;
  maxMembers: number;
  currentMembers: number;
  isActive: boolean;
  category: string;
  creatorId: string;
  createdAt: string;
  creator?: {
    firstName: string;
    lastName: string;
  };
  isMember?: boolean;
  reminderSent?: boolean;
}

export default function StudyGroups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedGroup, setSelectedGroup } = useStudyState();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingLink: '',
    meetingType: 'zoom' as 'zoom' | 'meet',
    scheduledTime: '',
    duration: 60,
    maxMembers: 10,
    category: ''
  });

  // Fetch study groups
  const { data: studyGroups = [], isLoading } = useQuery({
    queryKey: ['/api/study-groups', user?.id],
    queryFn: async () => {
      const url = user?.id ? `/api/study-groups?userId=${user.id}` : '/api/study-groups';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch study groups');
      }
      return response.json();
    },
    enabled: !!user
  });

  // Filter study groups
  const filteredStudyGroups = studyGroups.filter((group: StudyGroup) => {
    const matchesSearch = !searchTerm.trim() || 
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || group.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(studyGroups.map((group: StudyGroup) => group.category).filter(Boolean)));

  // Create study group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const groupData = {
        creatorId: user?.id,
        title: data.title,
        description: data.description,
        meetingLink: data.meetingLink,
        meetingType: data.meetingType,
        scheduledTime: new Date(data.scheduledTime).toISOString(),
        duration: data.duration,
        maxMembers: data.maxMembers,
        category: data.category
      };

      const response = await fetch('/api/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create study group');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Study group created!",
        description: "Your study group has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      setFormData({
        title: '',
        description: '',
        meetingLink: '',
        meetingType: 'zoom',
        scheduledTime: '',
        duration: 60,
        maxMembers: 10,
        category: ''
      });
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      console.error('Error creating study group:', error);
      toast({
        title: "Error",
        description: "Failed to create study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join study group');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined study group!",
        description: "You've successfully joined the study group.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
    },
    onError: (error: any) => {
      console.error('Error joining study group:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/study-groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave study group');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Left study group",
        description: "You've left the study group.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
    },
    onError: (error: any) => {
      console.error('Error leaving study group:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to leave study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateGroup = () => {
    if (!formData.title || !formData.meetingLink || !formData.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate(formData);
  };

  const handleJoinMeeting = (group: StudyGroup) => {
    try {
      const now = new Date();
      const scheduledTime = parseISO(group.scheduledTime);
      const endTime = addMinutes(scheduledTime, group.duration);

      // Check if meeting is currently active (within scheduled time + duration)
      if (isBefore(now, scheduledTime)) {
        toast({
          title: "Meeting Not Started",
          description: `This meeting is scheduled for ${format(scheduledTime, 'PPp')}`,
          variant: "destructive",
        });
        return;
      }

      if (isAfter(now, endTime)) {
        toast({
          title: "Meeting Ended",
          description: "This meeting has already ended.",
          variant: "destructive",
        });
        return;
      }

      // Validate meeting link
      if (!group.meetingLink || !group.meetingLink.startsWith('http')) {
        toast({
          title: "Invalid Meeting Link",
          description: "The meeting link is not valid.",
          variant: "destructive",
        });
        return;
      }

      // Open meeting link in new tab
      window.open(group.meetingLink, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Joining Meeting",
        description: "Opening meeting in a new tab...",
      });
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast({
        title: "Error",
        description: "Failed to join meeting. Please check the meeting link.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (group: StudyGroup) => {
    const now = new Date();
    const scheduledTime = parseISO(group.scheduledTime);
    const endTime = addMinutes(scheduledTime, group.duration);

    if (isBefore(now, scheduledTime)) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (isAfter(now, endTime)) {
      return <Badge variant="secondary">Ended</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500">Live</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Please log in to access study groups.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-muted-foreground">Join or create collaborative study sessions</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Group Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Anatomy Study Session"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What will you be studying?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anatomy">Anatomy</SelectItem>
                      <SelectItem value="physiology">Physiology</SelectItem>
                      <SelectItem value="pathology">Pathology</SelectItem>
                      <SelectItem value="pharmacology">Pharmacology</SelectItem>
                      <SelectItem value="clinical">Clinical</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meetingType">Meeting Platform</Label>
                    <Select value={formData.meetingType} onValueChange={(value: 'zoom' | 'meet') => setFormData({ ...formData, meetingType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="meet">Google Meet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxMembers">Max Members</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min="2"
                      max="50"
                      value={formData.maxMembers}
                      onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateGroup} 
                    disabled={createGroupMutation.isPending}
                    className="flex-1"
                  >
                    {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Study Groups Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading study groups...</p>
        </div>
      ) : filteredStudyGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No study groups found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? "Try adjusting your search or filter criteria" 
              : "Be the first to create a study group!"}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Study Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudyGroups.map((group: StudyGroup) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{group.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(group)}
                      <Badge variant="outline">{group.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {group.meetingType === 'zoom' ? (
                      <SiZoom className="w-4 h-4" />
                    ) : (
                      <SiGooglemeet className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(parseISO(group.scheduledTime), 'PPp')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{group.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{group.currentMembers}/{group.maxMembers} members</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {group.isMember ? (
                    <>
                      <Button 
                        onClick={() => handleJoinMeeting(group)}
                        className="flex-1"
                        disabled={!group.isActive}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => leaveGroupMutation.mutate(group.id)}
                        disabled={leaveGroupMutation.isPending}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      disabled={group.currentMembers >= group.maxMembers || joinGroupMutation.isPending}
                      className="flex-1"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {group.currentMembers >= group.maxMembers ? 'Full' : 'Join Group'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}