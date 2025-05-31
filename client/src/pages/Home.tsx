import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, BookOpen, TrendingUp, Users, LogOut } from 'lucide-react';

export default function Home() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setLocation('/');
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-docdot-blue rounded-full flex items-center justify-center">
                <Stethoscope className="text-white text-sm" size={16} />
              </div>
              <span className="ml-2 text-xl font-bold text-docdot-heading">Docdot</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-docdot-text">
                {getUserDisplayName()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-500 hover:text-docdot-blue"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-docdot-heading mb-4">
            Welcome to Docdot,{' '}
            <span className="text-docdot-blue">{getUserDisplayName()}</span>!
          </h1>
          <p className="text-xl text-docdot-text mb-8">
            Your medical education journey continues here.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Quick Access Cards */}
            <Card className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <BookOpen className="text-docdot-blue text-3xl mb-4 mx-auto" size={48} />
                <h3 className="text-lg font-semibold text-docdot-heading mb-2">
                  Study Materials
                </h3>
                <p className="text-docdot-text text-sm">
                  Access your medical study resources and documentation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="text-docdot-blue text-3xl mb-4 mx-auto" size={48} />
                <h3 className="text-lg font-semibold text-docdot-heading mb-2">
                  Progress Tracking
                </h3>
                <p className="text-docdot-text text-sm">
                  Monitor your learning progress and achievements.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <Users className="text-docdot-blue text-3xl mb-4 mx-auto" size={48} />
                <h3 className="text-lg font-semibold text-docdot-heading mb-2">
                  Community
                </h3>
                <p className="text-docdot-text text-sm">
                  Connect with fellow medical professionals and students.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Info Card */}
          <Card className="mt-12 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-docdot-heading mb-4">
                Account Information
              </h2>
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-docdot-heading">Email:</span>
                  <span className="text-docdot-text">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-docdot-heading">Account Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.email_confirmed_at 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-docdot-heading">Member Since:</span>
                  <span className="text-docdot-text">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
