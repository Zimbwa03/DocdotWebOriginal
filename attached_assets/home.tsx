import { Link } from "wouter";
import HeroSection from "@/components/home/hero-section";
import FeaturesSection from "@/components/home/features-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="bg-background">
      <HeroSection />
      <FeaturesSection />
      
      {/* CTA Section */}
      <div className="bg-white dark:bg-dark-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Ready to transform your medical education?
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of medical students who are already using Docdot to enhance their learning experience.
          </p>
          <div className="mt-8 flex justify-center">
            {isAuthenticated ? (
              <Button asChild className="px-8 py-3 text-base font-medium rounded-md shadow">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <div className="space-x-4">
                <Button asChild className="px-8 py-3 text-base font-medium rounded-md shadow">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button variant="outline" asChild className="px-8 py-3 text-base font-medium rounded-md">
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-gray-50 dark:bg-dark-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-secondary-600 dark:text-secondary-400 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              From Our Medical Students
            </p>
          </div>
          
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold mr-4">
                  JS
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">James S.</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">3rd Year Medical Student</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The AI tutor helped me understand complex neuroanatomy concepts that I was struggling with for weeks. The interactive quizzes and personalized feedback are game-changers!"
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold mr-4">
                  ML
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Maria L.</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2nd Year Medical Student</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The flashcard system with spaced repetition has significantly improved my retention of anatomy structures. I've seen a 20% improvement in my grades since using Docdot."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold mr-4">
                  AT
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ahmed T.</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">4th Year Medical Student</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The study timer with Pomodoro technique has revolutionized my study habits. I'm more focused and productive than ever before. Worth every penny of the subscription!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
