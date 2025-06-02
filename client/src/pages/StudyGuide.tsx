import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Bookmark, 
  BookmarkCheck,
  ArrowLeft, 
  CheckCircle,
  Target,
  Brain,
  Activity,
  Heart,
  Pill,
  Microscope,
  ChevronRight,
  User,
  Trophy,
  Calendar,
  PlayCircle
} from 'lucide-react';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  // Fetch study guide sections
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['/api/study-guide/sections'],
    queryFn: async () => {
      const response = await fetch('/api/study-guide/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      return response.json();
    },
  });

  // Fetch topics for selected section
  const { data: topics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ['/api/study-guide/topics', selectedSection, user?.id],
    queryFn: async () => {
      if (!selectedSection) return [];
      const response = await fetch(`/api/study-guide/topics/${selectedSection}?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      return response.json();
    },
    enabled: !!selectedSection && !!user?.id,
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ['/api/study-guide/user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/study-guide/user-progress/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user progress');
      return response.json();
    },
    enabled: !!user?.id,
  }) as { data: UserProgress | undefined };

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { 
      topicId: number; 
      completionPercentage: number; 
      notes?: string; 
      isBookmarked?: boolean 
    }) => {
      const response = await fetch('/api/study-guide/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...data
        })
      });
      if (!response.ok) throw new Error('Failed to update progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-guide/topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-guide/user-progress'] });
    },
  });

  // Load topic content
  const loadTopic = async (topicId: number) => {
    try {
      const response = await fetch(`/api/study-guide/topic/${topicId}?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      const topic = await response.json();
      setSelectedTopic(topic);
      setUserNotes(topic.notes || '');
      setReadingProgress(topic.completion_percentage || 0);
    } catch (error) {
      console.error('Error loading topic:', error);
    }
  };

  // Handle bookmark toggle
  const toggleBookmark = () => {
    if (!selectedTopic) return;
    
    const newBookmarkStatus = !selectedTopic.is_bookmarked;
    updateProgressMutation.mutate({
      topicId: selectedTopic.id,
      completionPercentage: readingProgress,
      notes: userNotes,
      isBookmarked: newBookmarkStatus
    });
    
    setSelectedTopic(prev => prev ? { ...prev, is_bookmarked: newBookmarkStatus } : null);
  };

  // Handle progress update
  const updateProgress = (progress: number) => {
    if (!selectedTopic) return;
    
    setReadingProgress(progress);
    updateProgressMutation.mutate({
      topicId: selectedTopic.id,
      completionPercentage: progress,
      notes: userNotes,
      isBookmarked: selectedTopic.is_bookmarked
    });
  };

  // Handle notes save
  const saveNotes = () => {
    if (!selectedTopic) return;
    
    updateProgressMutation.mutate({
      topicId: selectedTopic.id,
      completionPercentage: readingProgress,
      notes: userNotes,
      isBookmarked: selectedTopic.is_bookmarked
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'anatomy': return Heart;
      case 'physiology': return Activity;
      case 'pathology': return Microscope;
      case 'clinical': return User;
      case 'pharmacology': return Pill;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingSections) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Topic Detail View
  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTopic(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedTopic.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {selectedTopic.section_title}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedTopic.estimated_read_time} min read
                  </span>
                  <Badge className={getDifficultyColor(selectedTopic.difficulty_level)}>
                    {selectedTopic.difficulty_level}
                  </Badge>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={toggleBookmark}
                className={selectedTopic.is_bookmarked ? 'bg-yellow-50 border-yellow-300' : ''}
              >
                {selectedTopic.is_bookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reading Progress</h3>
                <span className="text-sm text-gray-600">{readingProgress}% complete</span>
              </div>
              <Progress value={readingProgress} className="mb-4" />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateProgress(25)}
                  disabled={readingProgress >= 25}
                >
                  25%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateProgress(50)}
                  disabled={readingProgress >= 50}
                >
                  50%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateProgress(75)}
                  disabled={readingProgress >= 75}
                >
                  75%
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateProgress(100)}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={readingProgress >= 100}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedTopic.content}
                </div>
              </div>
              
              {selectedTopic.tags && selectedTopic.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Notes</CardTitle>
              <CardDescription>
                Add your own notes and insights about this topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Write your notes here..."
                className="min-h-[120px] mb-4"
              />
              <Button onClick={saveNotes} disabled={updateProgressMutation.isPending}>
                {updateProgressMutation.isPending ? 'Saving...' : 'Save Notes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Topics List View
  if (selectedSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSection(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sections
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {sections.find((s: StudySection) => s.id === selectedSection)?.title}
            </h1>
            <p className="text-gray-600">
              {sections.find((s: StudySection) => s.id === selectedSection)?.description}
            </p>
          </div>

          {loadingTopics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic: StudyTopic) => (
                <Card 
                  key={topic.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => loadTopic(topic.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {topic.title}
                      </h3>
                      {topic.is_bookmarked && (
                        <BookmarkCheck className="w-5 h-5 text-yellow-500 ml-2" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {topic.estimated_read_time} min
                      </span>
                      <Badge className={getDifficultyColor(topic.difficulty_level)}>
                        {topic.difficulty_level}
                      </Badge>
                    </div>

                    {topic.completion_percentage > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{topic.completion_percentage}%</span>
                        </div>
                        <Progress value={topic.completion_percentage} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {topic.tags?.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {topic.tags?.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{topic.tags.length - 2} more
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Sections View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Study Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive study materials covering essential medical topics with progress tracking
          </p>
        </div>

        {/* User Progress Overview */}
        {userProgress && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Your Study Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userProgress.topics_started}
                    </div>
                    <div className="text-sm text-gray-600">Topics Started</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userProgress.topics_completed}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {userProgress.bookmarked_topics}
                    </div>
                    <div className="text-sm text-gray-600">Bookmarked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(userProgress.average_progress || 0)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Study Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section: StudySection) => {
            const IconComponent = getCategoryIcon(section.category);
            return (
              <Card 
                key={section.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedSection(section.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {section.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    {section.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="group-hover:bg-blue-50 group-hover:border-blue-300"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}