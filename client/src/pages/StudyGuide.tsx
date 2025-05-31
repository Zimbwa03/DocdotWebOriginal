import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, Target, Plus, ArrowLeft } from 'lucide-react';

export default function StudyGuide() {
  const [activeView, setActiveView] = useState<'overview' | 'create'>('overview');

  const studyPlans = [
    {
      id: 1,
      title: 'Anatomy Fundamentals',
      description: 'Complete coverage of human anatomy systems',
      progress: 65,
      dueDate: '2024-02-15',
      topics: ['Head & Neck', 'Upper Limb', 'Thorax'],
      timeCommitment: '2 hours/day'
    },
    {
      id: 2,
      title: 'Cardiovascular System',
      description: 'Deep dive into heart and circulatory system',
      progress: 30,
      dueDate: '2024-02-28',
      topics: ['Heart Anatomy', 'Blood Vessels', 'ECG Basics'],
      timeCommitment: '1.5 hours/day'
    }
  ];

  if (activeView === 'create') {
    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setActiveView('overview')}>
              <ArrowLeft className="mr-2" size={16} />
              Back to Study Plans
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-docdot-heading">Create Study Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="mx-auto mb-4 text-docdot-blue" size={64} />
                <h3 className="text-xl font-semibold text-docdot-heading mb-2">
                  Study Planner Coming Soon
                </h3>
                <p className="text-docdot-text mb-6">
                  We're working on an intelligent study planning system that will help you organize your medical education journey with personalized schedules and progress tracking.
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="text-left">
                    <h4 className="font-medium text-docdot-heading mb-2">Planned Features:</h4>
                    <ul className="text-docdot-text text-sm space-y-1">
                      <li>• AI-powered study schedule optimization</li>
                      <li>• Calendar integration and reminders</li>
                      <li>• Progress tracking and analytics</li>
                      <li>• Adaptive learning recommendations</li>
                      <li>• Goal setting and milestone tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-docdot-bg">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-docdot-heading mb-2">Study Planner</h1>
            <p className="text-docdot-text">Organize your medical education journey</p>
          </div>
          <Button onClick={() => setActiveView('create')} className="bg-docdot-blue">
            <Plus className="mr-2" size={16} />
            Create Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-docdot-heading">Active Study Plans</h2>
              
              {studyPlans.map((plan) => (
                <Card key={plan.id} className="border-2 hover:border-docdot-blue transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-docdot-heading">{plan.title}</CardTitle>
                      <Badge variant="outline">{plan.progress}% Complete</Badge>
                    </div>
                    <p className="text-docdot-text">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-docdot-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-docdot-text">
                        <div className="flex items-center">
                          <Clock className="mr-1" size={14} />
                          <span>{plan.timeCommitment}</span>
                        </div>
                        <div className="flex items-center">
                          <Target className="mr-1" size={14} />
                          <span>Due: {new Date(plan.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {plan.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-docdot-heading">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-docdot-blue-light rounded-lg">
                    <BookOpen className="text-docdot-blue mr-3" size={16} />
                    <div>
                      <p className="font-medium text-docdot-heading text-sm">Anatomy Review</p>
                      <p className="text-docdot-text text-xs">9:00 AM - 11:00 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <Target className="text-green-600 mr-3" size={16} />
                    <div>
                      <p className="font-medium text-docdot-heading text-sm">Quiz Practice</p>
                      <p className="text-docdot-text text-xs">2:00 PM - 3:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <Calendar className="text-purple-600 mr-3" size={16} />
                    <div>
                      <p className="font-medium text-docdot-heading text-sm">Study Group</p>
                      <p className="text-docdot-text text-xs">7:00 PM - 8:30 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-docdot-heading">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-docdot-text">Study Hours This Week</span>
                    <span className="font-semibold text-docdot-heading">14.5 hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-docdot-text">Completed Topics</span>
                    <span className="font-semibold text-docdot-heading">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-docdot-text">Current Streak</span>
                    <span className="font-semibold text-docdot-heading">7 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}