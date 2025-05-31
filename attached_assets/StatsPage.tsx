import { Link } from "wouter";
import UserStats from "@/components/stats/UserStats";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Helmet } from "react-helmet";

const StatsPage = () => {
  const { currentUser, setIsAuthModalOpen, setAuthModalView } = useAuth();
  
  const handleLoginClick = () => {
    setAuthModalView("login");
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Your Statistics - DocDot</title>
        <meta 
          name="description" 
          content="Track your progress, view your performance statistics, and see your achievements across all medical quiz categories."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation breadcrumb */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="inline-flex items-center px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-primary" />
            Your Performance Statistics
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Track your progress and identify areas for improvement.
          </p>
        </div>
        
        {/* Main content */}
        {!currentUser ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to view your stats</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Create an account or sign in to track your progress, analyze your performance, and unlock achievements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleLoginClick} size="lg">
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
        ) : (
          <UserStats />
        )}
        
        {/* Call to action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to improve your stats? Take more quizzes to build your knowledge and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz/all">
              <Button variant="default" size="lg">
                Take a Quiz
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" size="lg">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsPage;