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
  Trophy,
  User,
  LogOut,
  Settings,
  Shield,
  Bell,
  CreditCard,
  HelpCircle,
  ChevronDown,
  UserCircle,
  Lock,
  Mail,
  Smartphone,
  Eye,
  Download,
  Trash2,
  Edit,
  Key
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function Navigation() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // State for profile management
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    institution: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/quiz', label: 'Quiz', icon: GraduationCap },
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/study-guide', label: 'Study Guide', icon: BookOpen },
    { path: '/performance', label: 'Performance', icon: Trophy },
    { path: '/ai-tools', label: 'AI Tools', icon: Brain },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match"
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 8 characters long"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Password Update Failed",
          description: error.message
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated"
        });
        setIsPasswordChangeOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          specialization: profileData.specialization,
          institution: profileData.institution,
          phone: profileData.phone
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Profile Update Failed",
          description: error.message
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated"
        });
        setIsProfileOpen(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
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

          {/* Advanced User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" style={{ color: '#2E2E2E' }} />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0" style={{ backgroundColor: '#3399FF' }}></Badge>
            </Button>

            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-blue-50">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback style={{ backgroundColor: '#3399FF', color: 'white' }}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium" style={{ color: '#1C1C1C' }}>
                      {user?.user_metadata?.firstName || 'Dr. User'}
                    </span>
                    <span className="text-xs" style={{ color: '#2E2E2E' }}>
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" style={{ color: '#2E2E2E' }} />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.firstName || 'Dr. User'} {user?.user_metadata?.lastName || ''}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">Pro Plan</Badge>
                      <Badge variant="outline" className="text-xs" style={{ backgroundColor: '#3399FF', color: 'white' }}>
                        Level 25
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                {/* Profile Management */}
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Profile Settings</DialogTitle>
                      <DialogDescription>
                        Update your personal information and preferences
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={profileData.specialization}
                          onChange={(e) => setProfileData(prev => ({...prev, specialization: e.target.value}))}
                          placeholder="e.g., Cardiology, Internal Medicine"
                        />
                      </div>
                      <div>
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          value={profileData.institution}
                          onChange={(e) => setProfileData(prev => ({...prev, institution: e.target.value}))}
                          placeholder="Medical school or hospital"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleProfileUpdate} disabled={loading} style={{ backgroundColor: '#3399FF' }}>
                        {loading ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Password Change */}
                <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Key className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Update your account password for security
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsPasswordChangeOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handlePasswordChange} disabled={loading} style={{ backgroundColor: '#3399FF' }}>
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Other Menu Items */}
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Privacy & Security</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing & Subscription</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download Data</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}