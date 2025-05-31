import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  BarChart2,
  Clock,
  Brain,
  Trophy,
  Users,
  ArrowRight,
} from "lucide-react";
import { Helmet } from "react-helmet";

const HomePage = () => {
  const { currentUser, setIsAuthModalOpen, setAuthModalView } = useAuth();

  const handleGetStarted = () => {
    if (!currentUser) {
      setAuthModalView("register");
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>DocDot - Medical Learning Platform</title>
        <meta
          name="description"
          content="Enhance your medical education with personalized study plans, analytics, and collaborative learning tools."
        />
      </Helmet>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Medical Learning,{" "}
              <span className="text-primary">Revolutionized</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Enhance your medical education with personalized study plans,
              detailed analytics, and collaborative learning tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <>
                  <Link href="/study">
                    <Button size="lg" className="px-8">
                      Go to Study Center
                    </Button>
                  </Link>
                  <Link href="/quiz/all">
                    <Button size="lg" variant="outline">
                      Take a Quiz
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button size="lg" className="px-8" onClick={handleGetStarted}>
                    Get Started
                  </Button>
                  <Link href="/quiz/all">
                    <Button size="lg" variant="outline">
                      Try a Sample Quiz
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Everything You Need to Excel
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 w-fit rounded-md mb-2">
                    <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle>Personalized Learning</CardTitle>
                  <CardDescription>
                    AI-powered recommendations based on your performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get tailored study plans that focus on your weak areas and help you improve efficiently.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 w-fit rounded-md mb-2">
                    <BarChart2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle>Detailed Analytics</CardTitle>
                  <CardDescription>
                    Visualize your progress and identify areas for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track your performance over time with intuitive charts and analytics dashboards.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 w-fit rounded-md mb-2">
                    <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle>Study Planning</CardTitle>
                  <CardDescription>
                    Organize your study schedule for maximum efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and manage study sessions with reminders and recurring schedules.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 w-fit rounded-md mb-2">
                    <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle>Flashcard System</CardTitle>
                  <CardDescription>
                    Create and review custom flashcards for difficult topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Build personalized flashcard decks and use spaced repetition to master medical concepts.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 w-fit rounded-md mb-2">
                    <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle>Study Groups</CardTitle>
                  <CardDescription>
                    Collaborate with peers on similar focus areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Join or create study groups to share resources, discuss difficult concepts, and learn together.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 w-fit rounded-md mb-2">
                    <Trophy className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle>Performance Prediction</CardTitle>
                  <CardDescription>
                    Predict your future performance based on current trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    See how you're likely to perform on upcoming exams and adjust your study strategy accordingly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary-50 dark:bg-primary-900/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to Elevate Your Medical Studies?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of medical students who are improving their knowledge and performance with DocDot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link href="/study">
                  <Button size="lg" className="px-8">
                    Go to Study Center <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="px-8" onClick={handleGetStarted}>
                  Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-primary-600 dark:text-primary-400 text-xl font-bold">
                  DocDot
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  © {new Date().getFullYear()} DocDot Learning Platform. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <Link href="/about">
                  <a className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    About
                  </a>
                </Link>
                <Link href="/privacy">
                  <a className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Privacy
                  </a>
                </Link>
                <Link href="/terms">
                  <a className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Terms
                  </a>
                </Link>
                <Link href="/contact">
                  <a className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Contact
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default HomePage;
