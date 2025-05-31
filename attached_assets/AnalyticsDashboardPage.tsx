import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Line,
  Area,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  CalendarDays, 
  Calendar, 
  Clock, 
  BarChart2, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Award, 
  Target, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/context/AuthContext";

// Time range options for filtering data
const timeRangeOptions = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'all', label: 'All Time' }
];

// Colors for charts
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
  '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
];

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [category, setCategory] = useState('all');
  const { currentUser } = useAuth();
  
  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/analytics/user', currentUser?.id || 'demo', timeRange, category],
    enabled: !!currentUser?.id,
  });

  // Fetch available categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Helper function to format percentages
  const formatPercentage = (value: number) => `${value}%`;

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Learning Analytics - DocDot</title>
          <meta 
            name="description" 
            content="Track your learning progress, identify strengths and areas for improvement with our detailed analytics dashboard."
          />
        </Helmet>
        
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="inline-flex items-center px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
            <BarChart2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to view analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Create an account or sign in to access detailed analytics about your learning journey and progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => {
              setAuthModalView("login");
              setIsAuthModalOpen(true);
            }} size="lg">
              Sign In
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setAuthModalView("register");
                setIsAuthModalOpen(true);
              }}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingAnalytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Learning Analytics - DocDot</title>
        </Helmet>
        <div className="flex items-center justify-center h-80">
          <div className="text-xl text-gray-500">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Learning Analytics - DocDot</title>
        </Helmet>
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="inline-flex items-center px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <BarChart2 className="h-12 w-12 text-gray-400 mb-4" />
          <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No analytics data available</div>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            Start taking quizzes and tracking your study sessions to generate detailed analytics about your learning progress.
          </p>
          <Link href="/quiz/all">
            <Button>
              Take Your First Quiz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Learning Analytics - DocDot</title>
        <meta 
          name="description" 
          content="Track your learning progress, identify strengths and areas for improvement with our detailed analytics dashboard."
        />
      </Helmet>
      
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="inline-flex items-center px-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Learning Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your learning progress, identify strengths and areas for improvement.
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <BarChart2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories && categories.map((cat: string) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quizzes Taken</p>
                <p className="text-3xl font-bold">{analyticsData.quizzesTaken}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questions Answered</p>
                <p className="text-3xl font-bold">{analyticsData.questionsAnswered}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Accuracy</p>
                <p className="text-3xl font-bold">{analyticsData.averageAccuracy}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
                <p className="text-3xl font-bold">{analyticsData.studyStreak} days</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Study Time Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Study Time
                </CardTitle>
                <CardDescription>Hours spent studying per day</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.studyTime} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={timeRange === '7days' ? 0 : 'preserveEnd'}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value} hours`, 'Study Time']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="hours" fill="#8884d8" name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Accuracy Over Time */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Accuracy Trend
                </CardTitle>
                <CardDescription>Your answer accuracy over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.accuracy.filter((item: any) => item.accuracy !== null)} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={timeRange === '7days' ? 0 : 'preserveEnd'}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tickFormatter={formatPercentage}
                      label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Category Performance */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 size={20} />
                  Category Performance
                </CardTitle>
                <CardDescription>Accuracy by medical category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={analyticsData.categoryPerformance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      tickFormatter={formatPercentage}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Accuracy']}
                    />
                    <Bar dataKey="score" fill="#8884d8">
                      {analyticsData.categoryPerformance.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Difficulty Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon size={20} />
                  Question Difficulty
                </CardTitle>
                <CardDescription>Distribution of questions by difficulty</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Pie
                      data={analyticsData.difficultyDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.name}
                      labelLine
                    >
                      {analyticsData.difficultyDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} questions`, 'Count']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Learning Velocity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                Learning Velocity
              </CardTitle>
              <CardDescription>How quickly you're absorbing new information</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.learningVelocity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="velocity" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorVelocity)" 
                    name="Learning Velocity"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Retention Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  Knowledge Retention
                </CardTitle>
                <CardDescription>How well you remember content over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.retentionRate} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="days" label={{ value: 'Days Since Learning', position: 'insideBottom', offset: -5 }} />
                    <YAxis domain={[0, 100]} tickFormatter={formatPercentage} />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Retention']} />
                    <Line type="monotone" dataKey="retention" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Error Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Error Analysis
                </CardTitle>
                <CardDescription>Types of errors in incorrect answers</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Pie
                      data={analyticsData.errorTypes}
                      dataKey="value"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.type}
                    >
                      {analyticsData.errorTypes.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} occurrences`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Improvement Over Time */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Performance Improvement
                </CardTitle>
                <CardDescription>Category performance change over time</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={analyticsData.improvement}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tickFormatter={formatPercentage}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Accuracy']}
                    />
                    <Legend />
                    {analyticsData.improvement && analyticsData.improvement.length > 0 && 
                     analyticsData.improvement[0] && 
                     Object.keys(analyticsData.improvement[0])
                      .filter(key => key !== 'date')
                      .map((key, index) => (
                        <Line 
                          key={key}
                          type="monotone" 
                          dataKey={key} 
                          stroke={COLORS[index % COLORS.length]} 
                          activeDot={{ r: 8 }}
                        />
                      ))
                    }
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Time Analysis Tab */}
        <TabsContent value="time" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Time of Day */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Study Time of Day
                </CardTitle>
                <CardDescription>When you study most frequently</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.timeOfDay} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: any) => [`${value} hours`, 'Study Time']} />
                    <Bar dataKey="hours" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Day of Week */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays size={20} />
                  Study Day of Week
                </CardTitle>
                <CardDescription>Which days you study most</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.dayOfWeek} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: any) => [`${value} hours`, 'Study Time']} />
                    <Bar dataKey="hours" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Session Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Session Duration
                </CardTitle>
                <CardDescription>Length of your study sessions</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Pie
                      data={analyticsData.sessionDuration}
                      dataKey="count"
                      nameKey="duration"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.duration}
                    >
                      {analyticsData.sessionDuration.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} sessions`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Study Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Study Efficiency
                </CardTitle>
                <CardDescription>Knowledge gain per hour studied</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.studyEfficiency} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value} points/hour`, 'Efficiency']} />
                    <Line type="monotone" dataKey="efficiency" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Topic Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon size={20} />
                  Topic Coverage
                </CardTitle>
                <CardDescription>Distribution of topics studied</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Pie
                      data={analyticsData.topicCoverage}
                      dataKey="value"
                      nameKey="topic"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.topic}
                    >
                      {analyticsData.topicCoverage.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Coverage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Topic Mastery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award size={20} />
                  Topic Mastery
                </CardTitle>
                <CardDescription>Mastery level of each topic</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={analyticsData.topicMastery}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      tickFormatter={formatPercentage}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="topic" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Mastery']}
                    />
                    <Bar dataKey="mastery" fill="#8884d8">
                      {analyticsData.topicMastery.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Knowledge Gaps */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Knowledge Gaps
                </CardTitle>
                <CardDescription>Topics that need more attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {analyticsData.knowledgeGaps.map((gap: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2">{gap.topic}</h3>
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${gap.proficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm whitespace-nowrap">{gap.proficiency}%</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {gap.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}