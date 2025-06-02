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
  Key,
  Menu,
  X,
  Search,
  Star,
  Clock,
  Zap,
  Target,
  BarChart3,
  Users,
  BookOpenCheck
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
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function Navigation() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for mobile menu and profile management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Fetch user profile data
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user/${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/user/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated"
      });
      setIsProfileOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile"
      });
    }
  });

  // Load current profile data when modal opens
  useEffect(() => {
    if (isProfileOpen && userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        specialization: userProfile.specialization || '',
        institution: userProfile.institution || '',
        phone: userProfile.phone || ''
      });
    }
  }, [isProfileOpen, userProfile]);

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/quiz', label: 'Quiz', icon: Brain },
    { path: '/notes', label: 'Notes', icon: BookOpen },
    { path: '/study-guide', label: 'Study Guide', icon: GraduationCap },
    { path: '/ai-tools', label: 'AI Tools', icon: Brain },
    { path: '/analytics', label: 'Analytics', icon: Target },
    { path: '/badges', label: 'Badges', icon: Star },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
  ];

  const quickActions = [
    { label: 'Start Quiz', icon: Zap, action: () => window.location.href = '/quiz' },
    { label: 'Study Timer', icon: Clock, action: () => window.location.href = '/study-guide' },
    { label: 'AI Tutor', icon: Brain, action: () => window.location.href = '/ai-tools' },
    { label: 'View Analytics', icon: BarChart3, action: () => window.location.href = '/analytics' },
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
      // Update both Supabase auth metadata and our database
      await supabase.auth.updateUser({
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          specialization: profileData.specialization,
          institution: profileData.institution,
          phone: profileData.phone
        }
      });

      // Update our database
      await updateProfileMutation.mutateAsync(profileData);
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
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile?.firstName) {
      return userProfile.firstName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile?.firstName) {
      return userProfile.firstName;
    }
    if (userProfile?.fullName) {
      return userProfile.fullName;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <>
      <nav className="border-b" style={{ backgroundColor: '#D1E8F9' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img 
                src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview.png" 
                alt="DocDot Medical Student Logo" 
                className="w-12 h-12 object-contain rounded-lg"
              />
              <span className="text-lg lg:text-xl font-bold" style={{ color: '#1C1C1C' }}>
                DocDot
              </span>
            </div>
          </Link>

          {/* Navigation Links - Hidden on mobile, visible on larger screens */}
          <div className="hidden lg:flex items-center space-x-1">
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

          {/* Mobile Menu Button & Desktop Navigation */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Desktop Quick Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" style={{ color: '#2E2E2E' }} />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0" style={{ backgroundColor: '#3399FF' }}></Badge>
              </Button>

              {/* Search */}
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" style={{ color: '#2E2E2E' }} />
              </Button>
            </div>

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
                      {getDisplayName()}
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
                      {getDisplayName()}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {userProfile?.subscriptionTier || 'Free'} Plan
                      </Badge>
                      <Badge variant="outline" className="text-xs" style={{ backgroundColor: '#3399FF', color: 'white' }}>
                        Level {userProfile?.level || 1}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* User Profile Section */}
            <div className="flex items-center space-x-3 mb-6 p-4 bg-blue-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarFallback style={{ backgroundColor: '#3399FF', color: 'white' }}>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{getDisplayName()}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {userProfile?.subscriptionTier || 'Free'} Plan
                  </Badge>
                  <Badge variant="outline" className="text-xs" style={{ backgroundColor: '#3399FF', color: 'white' }}>
                    Level {userProfile?.level || 1}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex items-center space-x-2 h-12 justify-start"
                    onClick={() => {
                      action.action();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <action.icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
              <div className="space-y-2">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link key={path} href={path}>
                    <Button
                      variant={location === path ? "default" : "ghost"}
                      className={`w-full justify-start h-12 ${
                        location === path 
                          ? 'text-white' 
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      style={location === path ? { backgroundColor: '#3399FF' } : {}}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span>{label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Settings */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Account Settings</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setIsProfileOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <UserCircle className="w-4 h-4 mr-3" />
                  <span>Profile Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setIsPasswordChangeOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Lock className="w-4 h-4 mr-3" />
                  <span>Change Password</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Bell className="w-4 h-4 mr-3" />
                  <span>Notifications</span>
                  <Badge className="ml-auto" style={{ backgroundColor: '#3399FF' }}>3</Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  <span>Help & Support</span>
                </Button>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>

    {/* Profile Settings Dialog */}
    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
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
              placeholder="e.g., Cardiology, Pediatrics"
            />
          </div>
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={profileData.institution}
              onChange={(e) => setProfileData(prev => ({...prev, institution: e.target.value}))}
              placeholder="e.g., Harvard Medical School"
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
          <Button onClick={handleProfileUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Change Password Dialog */}
    <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your account password
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
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
          <Button onClick={handlePasswordChange} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}