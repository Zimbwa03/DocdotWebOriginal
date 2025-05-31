import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Brain, 
  GraduationCap,
  User,
  LogOut
} from 'lucide-react';

export function Navigation() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/quiz', label: 'Quiz', icon: GraduationCap },
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/study-guide', label: 'Study Guide', icon: BookOpen },
    { path: '/ai-tools', label: 'AI Tools', icon: Brain },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="border-b" style={{ backgroundColor: '#D1E8F9' }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3399FF' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#1C1C1C' }}>
                Docdot
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <Button
                  variant={location === path ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    location === path 
                      ? 'text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={location === path ? { backgroundColor: '#3399FF' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" style={{ color: '#2E2E2E' }} />
              <span className="text-sm" style={{ color: '#2E2E2E' }}>
                {user?.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
              style={{ borderColor: '#3399FF', color: '#3399FF' }}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}