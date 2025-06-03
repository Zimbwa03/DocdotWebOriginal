import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Users, Video, Calendar, Clock, Plus, Search, Settings, MessageSquare } from "lucide-react";
import { SiZoom, SiGooglemeet } from "react-icons/si";

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
}

export default function StudyGroupsAdvanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_link: '',
    meeting_type: 'zoom' as 'zoom' | 'meet',
    scheduled_time: '',
    duration: 60,
    max_members: 10,
    category: ''
  });

  // Fetch study groups
  const { data: studyGroups = [], isLoading } = useQuery({
    queryKey: ['/api/study-groups'],
    queryFn: async () => {
      const response = await fetch('/api/study-groups');
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Create study group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          creator_id: user?.id,
          scheduled_time: new Date(data.scheduled_time).toISOString()
        })
      });
      if (!response.ok) throw new Error('Failed to create group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        meeting_link: '',
        meeting_type: 'zoom',
        scheduled_time: '',
        duration: 60,
        max_members: 10,
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
    if (isGroupActive(group.scheduled_time)) {
      window.open(group.meeting_link, '_blank');
    } else if (isMeetingPending(group.scheduled_time)) {
      joinGroupMutation.mutate(group.id);
    }
  };

  const getButtonText = (group: StudyGroup) => {
    if (isGroupActive(group.scheduled_time)) {
      return "Join Now";
    } else if (isMeetingPending(group.scheduled_time)) {
      return group.isMember ? "Pending" : "Set Reminder";
    }
    return "Meeting Ended";
  };

  const getButtonVariant = (group: StudyGroup) => {
    if (isGroupActive(group.scheduled_time)) {
      return "default";
    } else if (isMeetingPending(group.scheduled_time)) {
      return group.isMember ? "secondary" : "outline";
    }
    return "ghost";
  };

  const handleCreateGroup = () => {
    if (!formData.title || !formData.meeting_link || !formData.scheduled_time) {
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
      <div className="flex justify-center items-center py-8">
        <div className="text-center">Loading study groups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Groups */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Study Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyGroups.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No study groups yet</h3>
                  <p className="text-gray-600 mb-4">Create your first study group to start collaborating!</p>
                </div>
              ) : (
                studyGroups.map((group: StudyGroup) => (
                  <Card key={group.id} className={`p-4 border-l-4 ${isGroupActive(group.scheduled_time) ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{group.title}</h4>
                          {getMeetingIcon(group.meeting_type)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {String(group.current_members)}/{String(group.max_members)} members
                          </span>
                          {group.category && (
                            <Badge variant="outline" className="text-xs">
                              {group.category}
                            </Badge>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(group.scheduled_time).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(group.scheduled_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-600 mt-2">{group.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isGroupActive(group.scheduled_time) && (
                          <Badge variant="default" className="bg-green-500">
                            ACTIVE
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                        <Button
                          variant={getButtonVariant(group) as any}
                          size="sm"
                          onClick={() => handleJoinMeeting(group)}
                          disabled={
                            (!isGroupActive(group.scheduled_time) && !isMeetingPending(group.scheduled_time)) ||
                            (isMeetingPending(group.scheduled_time) && group.isMember) ||
                            joinGroupMutation.isPending
                          }
                        >
                          {isGroupActive(group.scheduled_time) && <Video className="w-4 h-4 mr-1" />}
                          {getButtonText(group)}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Group
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
                        value={formData.meeting_type} 
                        onValueChange={(value: 'zoom' | 'meet') => setFormData({...formData, meeting_type: value})}
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
                        value={formData.meeting_link}
                        onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                        placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledTime">Scheduled Time *</Label>
                      <Input
                        id="scheduledTime"
                        type="datetime-local"
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
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
                          value={formData.max_members}
                          onChange={(e) => setFormData({...formData, max_members: parseInt(e.target.value)})}
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
              
              <Button variant="outline" className="w-full justify-start">
                <Search className="w-4 h-4 mr-2" />
                Find Groups
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Group Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      {studyGroups.filter((group: StudyGroup) => isGroupActive(group.scheduled_time)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyGroups
                .filter((group: StudyGroup) => isGroupActive(group.scheduled_time))
                .map((group: StudyGroup) => (
                  <Card key={group.id} className="p-4 border-green-200 bg-green-50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="bg-green-500">LIVE</Badge>
                        <span className="text-xs text-gray-500">{String(group.duration)} minutes</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{group.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {String(group.current_members)} participants
                        </span>
                        <Button size="sm" onClick={() => window.open(group.meeting_link, '_blank')}>
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}