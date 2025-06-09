import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Home, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Brain, 
  GraduationCap,
  Trophy,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Star,
  Clock,
  Zap,
  Target,
  BarChart3,
  Users,
  BookOpenCheck,
  Key,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function SidebarNavigation() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/quiz', label: 'Quiz', icon: Brain },
    { path: '/notes', label: 'Notes', icon: BookOpen },
    { path: '/study-guide', label: 'Study Guide', icon: GraduationCap },
    { path: '/study-timer', label: 'Study Timer', icon: Clock },
    { path: '/study-planner', label: 'Study Planner', icon: Target },
    { path: '/study-groups', label: 'Study Groups', icon: Users },
    { path: '/ai-tools', label: 'AI Tools', icon: Brain },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/badges', label: 'Badges', icon: Star },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/resources', label: 'Resources', icon: BookOpenCheck },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
  ];

  const quickActions = [
    { label: 'Start Quiz', icon: Zap, action: () => window.location.href = '/quiz' },
    { label: 'Study Timer', icon: Clock, action: () => window.location.href = '/study-timer' },
    { label: 'AI Tutor', icon: Brain, action: () => window.location.href = '/ai-tools' },
    { label: 'View Analytics', icon: BarChart3, action: () => window.location.href = '/analytics' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocDot
              </span>
            )}
          </div>
          
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:flex absolute -right-3 top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'} ${
                    location === item.path 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } h-10 relative group`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} shrink-0`} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Quick Actions Section */}
          {!isCollapsed && (
            <div className="mt-8 px-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                Quick Actions
              </div>
              <div className="space-y-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={action.action}
                    className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 h-9"
                  >
                    <action.icon className="h-4 w-4 mr-3 shrink-0" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'justify-between'}`}>
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={`${isCollapsed ? 'w-8 h-8 p-0' : 'flex items-center space-x-2'} text-gray-600 dark:text-gray-300 relative group`}
              title={isCollapsed ? 'Toggle Theme' : undefined}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!isCollapsed && <span className="text-sm">Toggle Theme</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  Toggle Theme
                </div>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${isCollapsed ? 'w-8 h-8 p-0' : 'flex items-center space-x-2'} relative group`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user?.user_metadata?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-medium truncate max-w-32">
                          {user?.user_metadata?.firstName || 'User'}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-32">
                          {user?.email}
                        </span>
                      </div>
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                      Account Menu
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCollapsed ? "end" : "start"} className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DocDot
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {user?.user_metadata?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}