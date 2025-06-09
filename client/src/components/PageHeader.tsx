import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Brain, 
  GraduationCap,
  Trophy,
  Star,
  Clock,
  Target,
  BarChart3,
  Users,
  BookOpenCheck,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  const [location] = useLocation();

  const pageConfig = {
    '/home': { title: 'Dashboard', description: 'Welcome back to your medical learning journey', icon: Home },
    '/quiz': { title: 'Quiz Center', description: 'Test your knowledge with adaptive quizzes', icon: Brain },
    '/notes': { title: 'Study Notes', description: 'Organize and review your medical notes', icon: FileText },
    '/study-guide': { title: 'Study Guide', description: 'Comprehensive medical study materials', icon: GraduationCap },
    '/study-timer': { title: 'Study Timer', description: 'Focus with Pomodoro technique and ambient sounds', icon: Clock },
    '/study-planner': { title: 'Study Planner', description: 'Schedule and organize your study sessions', icon: Target },
    '/study-groups': { title: 'Study Groups', description: 'Collaborate with fellow medical students', icon: Users },
    '/ai-tools': { title: 'AI Tools', description: 'Intelligent tutoring and study assistance', icon: Brain },
    '/analytics': { title: 'Analytics', description: 'Track your learning progress and performance', icon: BarChart3 },
    '/badges': { title: 'Achievements', description: 'Your earned badges and milestones', icon: Star },
    '/leaderboard': { title: 'Leaderboard', description: 'See how you rank among peers', icon: Trophy },
    '/resources': { title: 'Resources', description: 'Medical references and study materials', icon: BookOpenCheck },
    '/pricing': { title: 'Pricing', description: 'Choose your subscription plan', icon: DollarSign },
  };

  const currentPage = pageConfig[location as keyof typeof pageConfig];
  const pageTitle = title || currentPage?.title || 'DocDot';
  const pageDescription = description || currentPage?.description;
  const PageIcon = currentPage?.icon || BookOpen;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {item.href ? (
                    <a href={item.href} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Main Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            {/* Page Icon */}
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <PageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            {/* Title and Description */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {pageDescription}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}