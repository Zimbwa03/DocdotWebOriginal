import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { useToast } from "@/hooks/use-toast";
import { Users, Video, Calendar, Clock, Plus, ExternalLink, Search, Filter, Settings } from "lucide-react";
import { SiZoom, SiGooglemeet } from "react-icons/si";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
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
    queryKey: ['/api/study-groups'],
    queryFn: async () => {
      console.log("🔍 Fetching study groups...");
      const response = await fetch('/api/study-groups');
      if (!response.ok) {
        console.error("Failed to fetch study groups:", response.status);
        return [];
      }
      const data = await response.json();
      console.log("📚 Study groups received:", data.length);
      return data;
    },
  });

  // Filter study groups based on search and category
  const filteredStudyGroups = studyGroups.filter((group: StudyGroup) => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || group.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
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

      console.log('🔧 Creating study group with data:', groupData);

      const response = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Study group creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create group');
      }
      
      const result = await response.json();
      console.log('✅ Study group created successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      setShowCreateDialog(false);
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
      toast({
        title: "Study group created successfully!",
        description: "Members can now join your study group."
      });
    },
    onError: () => {
      toast({
        title: "Error creating study group",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      toast({
        title: "Successfully joined study group!",
        description: "You'll receive an email reminder 30 minutes before the meeting."
      });
    },
    onError: () => {
      toast({
        title: "Error joining study group",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const isGroupActive = (scheduledTime: string) => {
    const now = new Date();
    const meetingTime = new Date(scheduledTime);
    const timeDiff = meetingTime.getTime() - now.getTime();
    return timeDiff <= 0 && timeDiff > -3600000; // Active for 1 hour after start
  };



  const isMeetingPending = (scheduledTime: string) => {
    const now = new Date();
    const meetingTime = new Date(scheduledTime);
    return meetingTime.getTime() > now.getTime();
  };

  const getMeetingIcon = (meetingType: string) => {
    return meetingType === 'zoom' ? 
      <SiZoom className="w-4 h-4 text-blue-600" /> : 
      <SiGooglemeet className="w-4 h-4 text-green-600" />;
  };

  const handleJoinMeeting = (group: StudyGroup) => {
    if (isGroupActive(group.scheduledTime)) {
      window.open(group.meetingLink, '_blank');
    } else if (isMeetingPending(group.scheduledTime)) {
      joinGroupMutation.mutate(group.id);
    }
  };

  const getButtonText = (group: StudyGroup) => {
    if (isGroupActive(group.scheduledTime)) {
      return "Join Now";
    } else if (isMeetingPending(group.scheduledTime)) {
      return group.isMember ? "Pending" : "Set Reminder";
    }
    return "Meeting Ended";
  };

  const getButtonVariant = (group: StudyGroup) => {
    if (isGroupActive(group.scheduledTime)) {
      return "default";
    } else if (isMeetingPending(group.scheduledTime)) {
      return group.isMember ? "secondary" : "outline";
    }
    return "ghost";
  };

  const handleCreateGroup = () => {
    if (!formData.title || !formData.meetingLink || !formData.scheduledTime) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createGroupMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading study groups...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 mt-2">Join collaborative study sessions with fellow medical students</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Study Group Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Notification Preferences</Label>
                  <p className="text-sm text-gray-500">Manage how you receive study group notifications</p>
                </div>
                <div>
                  <Label>Privacy Settings</Label>
                  <p className="text-sm text-gray-500">Control who can see your study group activity</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Group Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Anatomy Study Group"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the group"
                />
              </div>
              <div>
                <Label htmlFor="meetingType">Meeting Platform *</Label>
                <Select 
                  value={formData.meetingType} 
                  onValueChange={(value: 'zoom' | 'meet') => setFormData({...formData, meetingType: value})}
                >
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
                <Label htmlFor="meetingLink">Meeting Link *</Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime">Scheduled Time *</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Anatomy, Physiology"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxMembers">Max Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateGroup}
                disabled={createGroupMutation.isPending}
                className="w-full"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {searchTerm && (
          <div className="text-sm text-gray-500">
            {filteredStudyGroups.length} group(s) found for "{searchTerm}"
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudyGroups.map((group: StudyGroup) => (
          <Card key={group.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                  {group.category && (
                    <Badge variant="secondary" className="mt-1">
                      {group.category}
                    </Badge>
                  )}
                </div>
                {getMeetingIcon(group.meetingType)}
              </div>
              {group.description && (
                <p className="text-sm text-gray-600 mt-2">{group.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(group.scheduledTime).toLocaleDateString()} at{' '}
                  {new Date(group.scheduledTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {String(group.duration)} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {String(group.currentMembers)}/{String(group.maxMembers)} members
                </div>
                {group.creator && (
                  <div className="text-sm text-gray-500">
                    Created by {group.creator.firstName} {group.creator.lastName}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant={getButtonVariant(group)}
                    size="sm"
                    onClick={() => handleJoinMeeting(group)}
                    disabled={
                      (!isGroupActive(group.scheduledTime) && !isMeetingPending(group.scheduledTime)) ||
                      (isMeetingPending(group.scheduledTime) && group.isMember) ||
                      joinGroupMutation.isPending
                    }
                    className="flex-1"
                  >
                    {isGroupActive(group.scheduledTime) && <Video className="w-4 h-4 mr-1" />}
                    {getButtonText(group)}
                  </Button>
                  {isGroupActive(group.scheduledTime) && (
                    <Badge variant="default" className="bg-green-500 text-white">
                      ACTIVE
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudyGroups.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {studyGroups.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No study groups yet</h3>
              <p className="text-gray-600 mb-4">Be the first to create a study group and start collaborating!</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups match your search</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms or create a new group.</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>

    {/* Create Study Group Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <Label htmlFor="title">Group Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Anatomy Study Session"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the study session"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Anatomy, Physiology"
            />
          </div>
          
          <div>
            <Label htmlFor="meetingType">Meeting Platform</Label>
            <Select value={formData.meetingType} onValueChange={(value: 'zoom' | 'meet') => setFormData(prev => ({ ...prev, meetingType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="meet">Google Meet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="meetingLink">Meeting Link</Label>
            <Input
              id="meetingLink"
              value={formData.meetingLink}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="scheduledTime">Scheduled Time</Label>
            <Input
              id="scheduledTime"
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                min="30"
                max="240"
              />
            </div>
            <div>
              <Label htmlFor="maxMembers">Max Members</Label>
              <Input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                min="2"
                max="20"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
  );
}