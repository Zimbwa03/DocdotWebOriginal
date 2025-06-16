import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { 
  GraduationCap, 
  BookOpen, 
  Brain, 
  Target, 
  Users, 
  Trophy,
  CheckCircle,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';

export default function SimpleLanding() {
  const features = [
    {
      icon: GraduationCap,
      title: "Interactive Medical Quizzes",
      description: "Test your knowledge with comprehensive MCQs covering anatomy, physiology, and clinical scenarios."
    },
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Get personalized study recommendations and explanations powered by advanced AI technology."
    },
    {
      icon: BookOpen,
      title: "Comprehensive Study Materials",
      description: "Access detailed notes, diagrams, and resources for all medical subjects."
    },
    {
      icon: Target,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and identify areas for improvement."
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Collaborate with fellow medical students in organized study groups and discussions."
    },
    {
      icon: Trophy,
      title: "Competitive Learning",
      description: "Join leaderboards and earn badges to make your medical education journey engaging."
    }
  ];

  const benefits = [
    "Access to 10,000+ medical questions",
    "AI-powered explanations for every answer",
    "Personalized study plans",
    "Progress tracking and analytics",
    "Study groups and collaboration",
    "Mobile-friendly interface"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="/attached_assets/DocDot Medical Student Logo.png" 
                alt="DocDot Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="p-2 rounded-lg hidden" style={{ backgroundColor: '#3399FF' }}>
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">DocDot</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="text-gray-700 border-gray-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="text-white" style={{ backgroundColor: '#3399FF' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Master Medical Education with
              <span className="block text-blue-600">AI-Powered Learning</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The most comprehensive medical learning platform designed for students, residents, and healthcare professionals. 
              Study smarter with personalized quizzes, AI explanations, and collaborative tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-white px-8 py-3" style={{ backgroundColor: '#3399FF' }}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3">
                View Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">Free forever • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel in Medical Studies
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven educational methods 
              to accelerate your medical learning journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#3399FF' }}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose DocDot?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/auth">
                  <Button size="lg" className="text-white" style={{ backgroundColor: '#3399FF' }}>
                    Join Thousands of Students
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="text-center">
                  <div className="flex justify-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-600 mb-4">
                    "DocDot has completely transformed how I study for medical exams. 
                    The AI explanations are incredibly detailed and the progress tracking 
                    keeps me motivated."
                  </blockquote>
                  <div className="text-sm text-gray-500">
                    <p className="font-semibold">Sarah Chen</p>
                    <p>Medical Student, Johns Hopkins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Accelerate Your Medical Education?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of medical students who trust DocDot for their studies.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Get Started Today - It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">DocDot</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 DocDot. All rights reserved. Empowering medical education.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}