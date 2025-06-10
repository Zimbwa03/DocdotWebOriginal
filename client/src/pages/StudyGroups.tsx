import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Bell,
  UserPlus,
  Crown,
  MapPin,
  BookOpen,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle2,
  X,
  Settings
} from "lucide-react";
import { SiZoom, SiGooglemeet } from "react-icons/si";
import { format } from "date-fns";

interface StudyGroup {
  id: number;
  title: string;
  description: string;
  meeting_link: string;
  meeting_type: 'zoom' | 'meet';
  scheduled_time: string;
  duration: number;
  max_members: number;
  current_members: number;
  is_active: boolean;
  category: string;
  creator_id: string;
  created_at: string;
  creator?: {
    firstName: string;
    lastName: string;
  };
  isMember?: boolean;
  reminderSent?: boolean;
  isCreator?: boolean;
}

const medicalCategories = [
  'Anatomy',
  'Physiology',
  'Pathology',
  'Pharmacology',
  'Microbiology',
  'Biochemistry',
  'Histology',
  'Embryology',
  'Radiology',
  'Clinical Medicine',
  'Surgery',
  'Internal Medicine',
  'Pediatrics',
  'Psychiatry',
  'Emergency Medicine'
];

export default function StudyGroups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showMyGroups, setShowMyGroups] = useState(false);
  const [enableReminders, setEnableReminders] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_link: '',
    meeting_type: 'zoom' as 'zoom' | 'meet',
    scheduled_time: '',
    duration: 90,
    max_members: 8,
    category: '',
    isPrivate: false
  });

  // Fetch study groups
  const { data: studyGroups = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/study-groups', user?.id],
    queryFn: async () => {
      const url = user?.id ? `/api/study-groups?userId=${user.id}` : '/api/study-groups';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch study groups');
      return response.json();
    },
    enabled: !!user,
  });

  // Filter study groups
  const filteredStudyGroups = studyGroups.filter((group: StudyGroup) => {
    const matchesSearch = !searchTerm.trim() || 
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || group.category === categoryFilter;
    
    const now = new Date();
    const groupTime = new Date(group.scheduled_time);
    const hoursFromNow = (groupTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let matchesTime = true;
    if (timeFilter === 'today') {
      matchesTime = hoursFromNow <= 24 && hoursFromNow > 0;
    } else if (timeFilter === 'week') {
      matchesTime = hoursFromNow <= 168 && hoursFromNow > 0; // 7 days
    } else if (timeFilter === 'upcoming') {
      matchesTime = hoursFromNow > 0;
    }
    
    const matchesMyGroups = !showMyGroups || group.isMember || group.isCreator;
    
    return matchesSearch && matchesCategory && matchesTime && matchesMyGroups;
  });

  // Create study group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating group with data:", data);
      
      const groupData = {
        creatorId: user?.id,
        creator_id: user?.id, // Include both formats for compatibility
        title: data.title.trim(),
        description: data.description?.trim() || null,
        meetingLink: data.meeting_link.trim(),
        meeting_link: data.meeting_link.trim(),
        meetingType: data.meeting_type,
        meeting_type: data.meeting_type,
        scheduledTime: new Date(data.scheduled_time).toISOString(),
        scheduled_time: new Date(data.scheduled_time).toISOString(),
        duration: data.duration || 90,
        maxMembers: data.max_members || 10,
        max_members: data.max_members || 10,
        category: data.category.trim()
      };

      console.log("Sending request with data:", groupData);

      const response = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || 'Failed to create group');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Group created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Study group created successfully!",
        description: "Members can now join your study group and will receive reminders."
      });
    },
    onError: (error: any) => {
      console.error("Error creating group:", error);
      toast({
        title: "Error creating study group",
        description: error.message || "Please try again later.",
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join group');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      setShowJoinDialog(false);
      toast({
        title: "Successfully joined study group!",
        description: "You'll receive an email reminder 30 minutes before the meeting starts."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error joining study group",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/study-groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to leave group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      toast({
        title: "Left study group",
        description: "You'll no longer receive reminders for this group."
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      meeting_link: '',
      meeting_type: 'zoom',
      scheduled_time: '',
      duration: 90,
      max_members: 8,
      category: '',
      isPrivate: false
    });
  };

  const handleCreateGroup = () => {
    console.log("Form data before validation:", formData);
    
    // Check all required fields
    const requiredFields = [
      { field: 'title', name: 'Title' },
      { field: 'meeting_link', name: 'Meeting link' },
      { field: 'scheduled_time', name: 'Scheduled time' },
      { field: 'category', name: 'Category' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(({ name }) => name).join(', ');
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFieldNames}`,
        variant: "destructive"
      });
      return;
    }

    // Validate meeting time is in the future
    const scheduledTime = new Date(formData.scheduled_time);
    if (scheduledTime <= new Date()) {
      toast({
        title: "Invalid meeting time",
        description: "Please select a future date and time.",
        variant: "destructive"
      });
      return;
    }

    // Validate meeting link format
    const linkPattern = /^https?:\/\/.+/;
    if (!linkPattern.test(formData.meeting_link)) {
      toast({
        title: "Invalid meeting link",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    console.log("Creating group with validated data:", formData);
    createGroupMutation.mutate(formData);
  };

  const handleJoinGroup = (group: StudyGroup) => {
    if (group.current_members >= group.max_members) {
      toast({
        title: "Group is full",
        description: "This study group has reached its maximum capacity.",
        variant: "destructive"
      });
      return;
    }

    setSelectedGroup(group);
    setShowJoinDialog(true);
  };

  const confirmJoinGroup = () => {
    if (selectedGroup) {
      joinGroupMutation.mutate(selectedGroup.id);
    }
  };

  const handleJoinMeeting = (group: StudyGroup) => {
    if (group.meeting_link) {
      window.open(group.meeting_link, '_blank');
    }
  };

  const isGroupActive = (scheduledTime: string) => {
    const now = new Date();
    const meetingTime = new Date(scheduledTime);
    const hoursDiff = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 0.5 && hoursDiff > -2; // Active from 30min before to 2 hours after
  };

  const getTimeStatus = (scheduledTime: string) => {
    const now = new Date();
    const meetingTime = new Date(scheduledTime);
    const minutesDiff = (meetingTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (minutesDiff <= 30 && minutesDiff > -120) {
      return { status: 'active', text: 'Live Now', color: 'bg-green-500' };
    } else if (minutesDiff > 30) {
      return { status: 'upcoming', text: 'Upcoming', color: 'bg-blue-500' };
    } else {
      return { status: 'ended', text: 'Ended', color: 'bg-gray-500' };
    }
  };

  const getMeetingIcon = (meetingType: string) => {
    return meetingType === 'zoom' ? 
      <SiZoom className="w-4 h-4 text-blue-600" /> : 
      <SiGooglemeet className="w-4 h-4 text-green-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Groups</h2>
          <p className="text-gray-600">Connect with fellow medical students for collaborative learning</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Create Study Group
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Group Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Cardiovascular Physiology Study Session"
                    className={`mt-1 ${!formData.title.trim() ? 'border-red-300' : ''}`}
                    required
                  />
                  {!formData.title.trim() && (
                    <p className="text-xs text-red-500 mt-1">Title is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="What will you be studying? Any preparation needed?"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Medical Subject *</Label>
                  <Select value={formData.category} onValueChange={(value) => {
                    console.log("Category selected:", value);
                    setFormData({...formData, category: value});
                  }}>
                    <SelectTrigger className={`mt-1 ${!formData.category ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder="Select a medical subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.category && (
                    <p className="text-xs text-red-500 mt-1">Please select a medical subject</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meetingType">Meeting Platform *</Label>
                    <Select 
                      value={formData.meeting_type} 
                      onValueChange={(value: 'zoom' | 'meet') => setFormData({...formData, meeting_type: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">
                          <div className="flex items-center gap-2">
                            <SiZoom className="w-4 h-4" />
                            Zoom
                          </div>
                        </SelectItem>
                        <SelectItem value="meet">
                          <div className="flex items-center gap-2">
                            <SiGooglemeet className="w-4 h-4" />
                            Google Meet
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select 
                      value={formData.duration.toString()} 
                      onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="meetingLink">Meeting Link *</Label>
                  <Input
                    id="meetingLink"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    className={`mt-1 ${!formData.meeting_link.trim() ? 'border-red-300' : ''}`}
                    required
                  />
                  {!formData.meeting_link.trim() && (
                    <p className="text-xs text-red-500 mt-1">Meeting link is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="scheduledTime">Meeting Date & Time *</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                    className={`mt-1 ${!formData.scheduled_time ? 'border-red-300' : ''}`}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  {!formData.scheduled_time && (
                    <p className="text-xs text-red-500 mt-1">Please select a date and time</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Select 
                    value={formData.max_members.toString()} 
                    onValueChange={(value) => setFormData({...formData, max_members: parseInt(value)})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 members</SelectItem>
                      <SelectItem value="6">6 members</SelectItem>
                      <SelectItem value="8">8 members</SelectItem>
                      <SelectItem value="10">10 members</SelectItem>
                      <SelectItem value="15">15 members</SelectItem>
                      <SelectItem value="20">20 members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGroup}
                    disabled={createGroupMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search study groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {medicalCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 px-3 py-2 border rounded-md">
            <Switch
              id="my-groups"
              checked={showMyGroups}
              onCheckedChange={setShowMyGroups}
            />
            <Label htmlFor="my-groups" className="text-sm whitespace-nowrap">My Groups</Label>
          </div>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudyGroups.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all' || timeFilter !== 'all' || showMyGroups
                ? "Try adjusting your filters or search terms"
                : "Be the first to create a study group!"}
            </p>
            {!searchTerm && categoryFilter === 'all' && timeFilter === 'all' && !showMyGroups && (
              <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            )}
          </div>
        ) : (
          filteredStudyGroups.map((group: StudyGroup) => {
            const timeStatus = getTimeStatus(group.scheduled_time);
            const isFull = group.current_members >= group.max_members;
            
            return (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                        {group.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {group.category}
                        </Badge>
                        <Badge className={`text-xs text-white ${timeStatus.color}`}>
                          {timeStatus.text}
                        </Badge>
                      </div>
                    </div>
                    {group.isCreator && (
                      <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                    )}
                  </div>
                  
                  {group.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {group.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(group.scheduled_time), "MMM d, h:mm a")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {group.duration}m
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getMeetingIcon(group.meeting_type)}
                        <span className="capitalize">{group.meeting_type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{group.current_members}/{group.max_members}</span>
                        {isFull && <AlertCircle className="w-4 h-4 text-orange-500" />}
                      </div>
                    </div>

                    {group.creator && (
                      <div className="text-xs text-gray-500">
                        Created by {group.creator.firstName} {group.creator.lastName}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {timeStatus.status === 'active' && group.isMember ? (
                        <Button 
                          onClick={() => handleJoinMeeting(group)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting
                        </Button>
                      ) : group.isMember ? (
                        <div className="flex gap-2 flex-1">
                          <Button 
                            variant="outline" 
                            disabled
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Joined
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => leaveGroupMutation.mutate(group.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Leave
                          </Button>
                        </div>
                      ) : timeStatus.status !== 'ended' ? (
                        <Button 
                          onClick={() => handleJoinGroup(group)}
                          disabled={isFull || joinGroupMutation.isPending}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {isFull ? "Group Full" : "Join Group"}
                        </Button>
                      ) : (
                        <Button variant="outline" disabled className="flex-1">
                          Meeting Ended
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Join Confirmation Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join Study Group</DialogTitle>
          </DialogHeader>
          
          {selectedGroup && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedGroup.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedGroup.description}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium">Reminder Settings</span>
                </div>
                <p className="text-sm text-blue-700">
                  You'll receive an email reminder 30 minutes before the meeting starts.
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Meeting Time:</span>
                  <span>{format(new Date(selectedGroup.scheduled_time), "MMM d, h:mm a")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{selectedGroup.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span className="capitalize">{selectedGroup.meeting_type}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowJoinDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={confirmJoinGroup}
                  disabled={joinGroupMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}