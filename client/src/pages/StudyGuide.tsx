import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Target, 
  Plus, 
  ArrowLeft,
  Brain,
  FileText,
  Video,
  Headphones,
  Download,
  Search,
  Filter,
  Star,
  CheckCircle,
  PlayCircle,
  BookmarkPlus,
  Share2,
  Printer,
  Eye,
  Timer,
  TrendingUp,
  Users,
  Lightbulb,
  Map,
  Zap,
  Award,
  BarChart3
} from 'lucide-react';

export default function StudyGuide() {
  const [activeView, setActiveView] = useState<'overview' | 'resources' | 'planner' | 'tools'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const studyResources = [
    {
      id: 1,
      title: 'Anatomy Atlas - Complete Human Body',
      type: 'Interactive Guide',
      category: 'anatomy',
      description: 'Comprehensive visual guide with 3D models and detailed explanations',
      duration: '2-3 hours',
      difficulty: 'Beginner',
      rating: 4.9,
      downloads: 15420,
      topics: ['Musculoskeletal', 'Cardiovascular', 'Nervous System'],
      format: 'PDF + Interactive'
    },
    {
      id: 2,
      title: 'Physiology Mastery: Cardiovascular System',
      type: 'Video Series',
      category: 'physiology',
      description: 'In-depth video lectures covering heart function, circulation, and blood pressure regulation',
      duration: '4.5 hours',
      difficulty: 'Intermediate',
      rating: 4.8,
      downloads: 12850,
      topics: ['Heart Function', 'Blood Circulation', 'ECG Interpretation'],
      format: 'Video + Notes'
    },
    {
      id: 3,
      title: 'Histology Slide Collection',
      type: 'Image Database',
      category: 'histology',
      description: 'High-resolution microscopic images with annotations and explanations',
      duration: '1-2 hours',
      difficulty: 'Advanced',
      rating: 4.7,
      downloads: 9240,
      topics: ['Tissue Types', 'Organ Systems', 'Pathology'],
      format: 'Image Gallery'
    },
    {
      id: 4,
      title: 'Clinical Case Studies: Emergency Medicine',
      type: 'Case Studies',
      category: 'clinical',
      description: 'Real patient cases with differential diagnosis and treatment protocols',
      duration: '3 hours',
      difficulty: 'Advanced',
      rating: 4.9,
      downloads: 8760,
      topics: ['Emergency Protocols', 'Diagnosis', 'Treatment'],
      format: 'Interactive Cases'
    },
    {
      id: 5,
      title: 'Pharmacology Quick Reference',
      type: 'Reference Guide',
      category: 'pharmacology',
      description: 'Drug mechanisms, interactions, and clinical applications',
      duration: '30 min',
      difficulty: 'Intermediate',
      rating: 4.6,
      downloads: 18920,
      topics: ['Drug Classes', 'Mechanisms', 'Side Effects'],
      format: 'Quick Reference'
    },
    {
      id: 6,
      title: 'Medical Terminology Masterclass',
      type: 'Audio Course',
      category: 'terminology',
      description: 'Complete audio course for medical terminology with pronunciation guide',
      duration: '6 hours',
      difficulty: 'Beginner',
      rating: 4.5,
      downloads: 11430,
      topics: ['Prefixes', 'Suffixes', 'Root Words'],
      format: 'Audio + Transcripts'
    }
  ];

  const studyTools = [
    {
      id: 1,
      title: 'Flashcard Generator',
      description: 'Create custom flashcards from any medical topic',
      icon: Brain,
      features: ['AI-powered generation', 'Spaced repetition', 'Progress tracking']
    },
    {
      id: 2,
      title: 'Study Schedule Optimizer',
      description: 'AI-powered schedule based on your learning patterns',
      icon: Calendar,
      features: ['Personalized timing', 'Deadline management', 'Break reminders']
    },
    {
      id: 3,
      title: 'Concept Mapper',
      description: 'Visual mind maps for complex medical concepts',
      icon: Map,
      features: ['Interactive diagrams', 'Relationship mapping', 'Collaborative editing']
    },
    {
      id: 4,
      title: 'Progress Analytics',
      description: 'Detailed insights into your learning progress',
      icon: BarChart3,
      features: ['Performance metrics', 'Weakness identification', 'Goal tracking']
    },
    {
      id: 5,
      title: 'Memory Palace Builder',
      description: 'Create memory palaces for complex information',
      icon: Lightbulb,
      features: ['Visual associations', 'Location-based learning', 'Retention testing']
    },
    {
      id: 6,
      title: 'Study Group Finder',
      description: 'Connect with other medical students',
      icon: Users,
      features: ['Topic-based groups', 'Schedule coordination', 'Resource sharing']
    }
  ];

  const filteredResources = studyResources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const renderResourcesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Study Resources</h2>
          <p style={{ color: '#2E2E2E' }}>Comprehensive medical learning materials and guides</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setActiveView('overview')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#2E2E2E' }} />
            <Input
              placeholder="Search resources, topics, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="anatomy">Anatomy</SelectItem>
            <SelectItem value="physiology">Physiology</SelectItem>
            <SelectItem value="histology">Histology</SelectItem>
            <SelectItem value="clinical">Clinical</SelectItem>
            <SelectItem value="pharmacology">Pharmacology</SelectItem>
            <SelectItem value="terminology">Terminology</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-all" style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2" style={{ color: '#1C1C1C' }}>{resource.title}</CardTitle>
                  <Badge variant="outline" className="mb-2">{resource.type}</Badge>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm" style={{ color: '#2E2E2E' }}>{resource.rating}</span>
                </div>
              </div>
              <CardDescription style={{ color: '#2E2E2E' }}>
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 mr-2" style={{ color: '#3399FF' }} />
                    <span style={{ color: '#2E2E2E' }}>{resource.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" style={{ color: '#3399FF' }} />
                    <span style={{ color: '#2E2E2E' }}>{resource.difficulty}</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-2" style={{ color: '#3399FF' }} />
                    <span style={{ color: '#2E2E2E' }}>{resource.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" style={{ color: '#3399FF' }} />
                    <span style={{ color: '#2E2E2E' }}>{resource.format}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {resource.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{topic}</Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" style={{ backgroundColor: '#3399FF' }} className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderToolsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Study Tools</h2>
          <p style={{ color: '#2E2E2E' }}>Advanced learning tools to enhance your medical education</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setActiveView('overview')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card key={tool.id} className="hover:shadow-lg transition-all cursor-pointer" style={{ backgroundColor: '#F7FAFC' }}>
              <CardHeader className="text-center">
                <IconComponent className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
                <CardTitle style={{ color: '#1C1C1C' }}>{tool.title}</CardTitle>
                <CardDescription style={{ color: '#2E2E2E' }}>
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span style={{ color: '#2E2E2E' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" style={{ backgroundColor: '#3399FF' }}>
                    <Zap className="w-4 h-4 mr-2" />
                    Launch Tool
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderPlannerView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Study Planner</h2>
          <p style={{ color: '#2E2E2E' }}>Create and manage your personalized study schedule</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setActiveView('overview')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1C1C1C' }}>Weekly Study Schedule</CardTitle>
              <CardDescription>Plan your study sessions for optimal learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="space-y-2">
                    <h4 className="font-medium text-center" style={{ color: '#1C1C1C' }}>{day}</h4>
                    <div className="space-y-1">
                      <div className="p-2 bg-blue-100 rounded text-xs text-center">
                        <div className="font-medium">Anatomy</div>
                        <div className="text-gray-600">9:00-11:00</div>
                      </div>
                      <div className="p-2 bg-green-100 rounded text-xs text-center">
                        <div className="font-medium">Physiology</div>
                        <div className="text-gray-600">14:00-16:00</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1C1C1C' }}>Learning Goals</CardTitle>
              <CardDescription>Set and track your medical education objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3" style={{ color: '#1C1C1C' }}>Current Goals</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Complete Anatomy Module</div>
                          <div className="text-sm text-gray-600">Progress: 75%</div>
                        </div>
                        <Award className="w-5 h-5" style={{ color: '#3399FF' }} />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Master Cardiovascular System</div>
                          <div className="text-sm text-gray-600">Progress: 45%</div>
                        </div>
                        <Award className="w-5 h-5" style={{ color: '#3399FF' }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3" style={{ color: '#1C1C1C' }}>Add New Goal</h4>
                    <div className="space-y-3">
                      <Input placeholder="Goal title" />
                      <Textarea placeholder="Goal description" />
                      <Input type="date" />
                      <Button style={{ backgroundColor: '#3399FF' }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Goal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Study Hours</p>
                    <p className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>42.5</p>
                  </div>
                  <Clock className="w-8 h-8" style={{ color: '#3399FF' }} />
                </div>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Topics Completed</p>
                    <p className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>18</p>
                  </div>
                  <CheckCircle className="w-8 h-8" style={{ color: '#3399FF' }} />
                </div>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Current Streak</p>
                    <p className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>12</p>
                  </div>
                  <Zap className="w-8 h-8" style={{ color: '#3399FF' }} />
                </div>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: '#F7FAFC' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>Overall Progress</p>
                    <p className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>68%</p>
                  </div>
                  <TrendingUp className="w-8 h-8" style={{ color: '#3399FF' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1C1C1C' }}>Learning Analytics</CardTitle>
              <CardDescription>Detailed insights into your study patterns and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C1C1C' }}>Advanced Analytics</h3>
                <p style={{ color: '#2E2E2E' }}>Detailed performance charts and learning insights coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (activeView === 'resources') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderResourcesView()}
        </div>
      </div>
    );
  }

  if (activeView === 'tools') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderToolsView()}
        </div>
      </div>
    );
  }

  if (activeView === 'planner') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {renderPlannerView()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Advanced Study Guide</h1>
          <p className="text-lg" style={{ color: '#2E2E2E' }}>Comprehensive medical learning resources and tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Study Resources */}
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
            style={{ backgroundColor: '#F7FAFC' }}
            onClick={() => setActiveView('resources')}
          >
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <CardTitle style={{ color: '#1C1C1C' }}>Study Resources</CardTitle>
              <CardDescription style={{ color: '#2E2E2E' }}>
                Comprehensive learning materials and guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Interactive Guides</Badge>
                <Badge variant="secondary">Video Series</Badge>
                <Badge variant="secondary">Reference Materials</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Study Tools */}
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
            style={{ backgroundColor: '#F7FAFC' }}
            onClick={() => setActiveView('tools')}
          >
            <CardHeader className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <CardTitle style={{ color: '#1C1C1C' }}>Study Tools</CardTitle>
              <CardDescription style={{ color: '#2E2E2E' }}>
                Advanced learning tools and utilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Flashcards</Badge>
                <Badge variant="secondary">Mind Maps</Badge>
                <Badge variant="secondary">Analytics</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Study Planner */}
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
            style={{ backgroundColor: '#F7FAFC' }}
            onClick={() => setActiveView('planner')}
          >
            <CardHeader className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <CardTitle style={{ color: '#1C1C1C' }}>Study Planner</CardTitle>
              <CardDescription style={{ color: '#2E2E2E' }}>
                Personalized schedule and goal management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Smart Scheduling</Badge>
                <Badge variant="secondary">Goal Tracking</Badge>
                <Badge variant="secondary">Progress Analytics</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card className="hover:shadow-lg transition-all" style={{ backgroundColor: '#F7FAFC' }}>
            <CardHeader className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <CardTitle style={{ color: '#1C1C1C' }}>Quick Access</CardTitle>
              <CardDescription style={{ color: '#2E2E2E' }}>
                Shortcuts to your most used features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Recent Notes
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Saved Resources
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Timer className="w-4 h-4 mr-2" />
                  Study Timer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Resources Section */}
        <Card style={{ backgroundColor: '#F7FAFC' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#1C1C1C' }}>
              <Star className="w-5 h-5 mr-2" style={{ color: '#3399FF' }} />
              Featured Resources
            </CardTitle>
            <CardDescription>Top-rated study materials for medical students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" style={{ color: '#1C1C1C' }}>Anatomy Atlas</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm">4.9</span>
                  </div>
                </div>
                <p className="text-sm mb-3" style={{ color: '#2E2E2E' }}>Complete human body visualization</p>
                <div className="flex gap-2">
                  <Button size="sm" style={{ backgroundColor: '#3399FF' }}>
                    <PlayCircle className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" style={{ color: '#1C1C1C' }}>Physiology Videos</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
                <p className="text-sm mb-3" style={{ color: '#2E2E2E' }}>Interactive cardiovascular system</p>
                <div className="flex gap-2">
                  <Button size="sm" style={{ backgroundColor: '#3399FF' }}>
                    <Video className="w-4 h-4 mr-1" />
                    Watch
                  </Button>
                  <Button size="sm" variant="outline">
                    <BookmarkPlus className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" style={{ color: '#1C1C1C' }}>Clinical Cases</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm">4.9</span>
                  </div>
                </div>
                <p className="text-sm mb-3" style={{ color: '#2E2E2E' }}>Real patient scenarios and diagnosis</p>
                <div className="flex gap-2">
                  <Button size="sm" style={{ backgroundColor: '#3399FF' }}>
                    <Eye className="w-4 h-4 mr-1" />
                    Study
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}