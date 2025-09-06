import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { useState, useEffect } from 'react';
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
  Star,
  Zap,
  Clock,
  Award,
  TrendingUp,
  Heart,
  Shield
} from 'lucide-react';
import logoPath from '@assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png';

export default function SimpleLanding() {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    { number: "50,000+", label: "Questions Answered Daily", icon: Brain },
    { number: "95%", label: "Pass Rate Improvement", icon: TrendingUp },
    { number: "24/7", label: "AI Tutor Available", icon: Clock },
    { number: "15,000+", label: "Active Students", icon: Users }
  ];

  const features = [
    {
      icon: GraduationCap,
      title: "Interactive Medical Quizzes",
      description: "Test your knowledge with comprehensive MCQs covering anatomy, physiology, and clinical scenarios.",
      color: "bg-blue-500"
    },
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Get personalized study recommendations and explanations powered by advanced AI technology.",
      color: "bg-purple-500"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Study Materials",
      description: "Access detailed notes, diagrams, and resources for all medical subjects.",
      color: "bg-green-500"
    },
    {
      icon: Target,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and identify areas for improvement.",
      color: "bg-red-500"
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Collaborate with fellow medical students in organized study groups and discussions.",
      color: "bg-indigo-500"
    },
    {
      icon: Trophy,
      title: "Competitive Learning",
      description: "Join leaderboards and earn badges to make your medical education journey engaging.",
      color: "bg-yellow-500"
    }
  ];

  const benefits = [
    { text: "Access to 10,000+ medical questions", icon: BookOpen },
    { text: "AI-powered explanations for every answer", icon: Brain },
    { text: "Personalized study plans", icon: Target },
    { text: "Progress tracking and analytics", icon: TrendingUp },
    { text: "Study groups and collaboration", icon: Users },
    { text: "Mobile-friendly interface", icon: Shield }
  ];

  // Auto-rotate stats every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath}
                alt="DocDot Medical Student Logo" 
                className="h-12 w-auto transform hover:scale-105 transition-transform duration-200"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                DocDot
              </span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth">
                <Button 
                  variant="outline" 
                  className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating elements background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-bounce delay-1000"></div>
          <div className="absolute bottom-60 right-10 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
                <Zap className="w-4 h-4 mr-2" />
                Trusted by 15,000+ Medical Students
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Master Medical Education with
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
                  AI-Powered Learning
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                The most comprehensive medical learning platform designed for students, residents, and healthcare professionals. 
                Study smarter with personalized quizzes, AI explanations, and collaborative tools.
              </p>

              {/* Interactive Stats */}
              <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {(() => {
                      const IconComponent = stats[currentStat].icon;
                      return <IconComponent className="w-8 h-8 text-blue-600 mr-3" />;
                    })()}
                    <span className="text-3xl font-bold text-gray-900 dark:text-white transition-all duration-500">
                      {stats[currentStat].number}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 transition-all duration-500">
                    {stats[currentStat].label}
                  </p>
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                  {stats.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStat ? 'bg-blue-600 w-8' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning Free
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center lg:justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Free forever • No credit card required • HIPAA Compliant
              </p>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Logo with Animation */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <img 
                      src={logoPath}
                      alt="DocDot Medical Student" 
                      className="h-80 w-auto mx-auto transform hover:scale-105 transition-transform duration-300 filter drop-shadow-2xl"
                    />
                    {/* Floating badges around the logo */}
                    <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                      AI-Powered
                    </div>
                    <div className="absolute -bottom-2 -left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      24/7 Available
                    </div>
                    <div className="absolute top-1/2 -right-8 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce delay-500">
                      Expert Level
                    </div>
                  </div>
                </div>

                {/* Interactive Feature Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1">
                    <div className="text-center">
                      <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-900">AI Tutor</p>
                      <p className="text-xs text-gray-600">Instant Help</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1">
                    <div className="text-center">
                      <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Leaderboard</p>
                      <p className="text-xs text-gray-600">Compete & Win</p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl transform rotate-3 opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-green-100 to-blue-100 rounded-3xl transform -rotate-2 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Loved by Medical Students Worldwide
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Excel in Medical Studies
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven educational methods 
              to accelerate your medical learning journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 hover:border-blue-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Visual separator with medical icons */}
          <div className="mt-16 flex justify-center items-center space-x-8 opacity-30">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <Heart className="w-6 h-6 text-blue-400" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
            <Brain className="w-6 h-6 text-purple-400" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
            <GraduationCap className="w-6 h-6 text-green-400" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-1500"></div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <div className="inline-flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                Why Choose DocDot?
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Join the Future of Medical Education
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                      <benefit.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-medium">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    Join Thousands of Students
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:pl-8 space-y-6">
              {/* Main Testimonial */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="text-center">
                  <div className="flex justify-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-600 dark:text-gray-300 mb-6 italic">
                    "DocDot has completely transformed how I study for medical exams. 
                    The AI explanations are incredibly detailed and the progress tracking 
                    keeps me motivated every single day."
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <img 
                      src={logoPath}
                      alt="Student Avatar" 
                      className="h-12 w-12 rounded-full border-2 border-blue-200"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Sarah Chen</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Medical Student, Johns Hopkins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini testimonials */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">"Best study platform ever!"</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">- Alex M., Harvard</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">"AI tutor is amazing!"</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">- Maria L., Stanford</p>
                </div>
              </div>

              {/* Achievement badges */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-xl font-bold mb-2">Award-Winning Platform</h3>
                  <p className="text-blue-100 text-sm">
                    Recognized by medical education institutions worldwide
                  </p>
                  <div className="flex justify-center items-center mt-4 space-x-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">4.9/5</p>
                      <p className="text-xs text-blue-200">Rating</p>
                    </div>
                    <div className="w-px h-8 bg-blue-300"></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">99%</p>
                      <p className="text-xs text-blue-200">Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-5 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <img 
              src={logoPath}
              alt="DocDot Medical Student" 
              className="h-20 w-auto mx-auto mb-4 filter brightness-0 invert opacity-90"
            />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Accelerate Your Medical Education?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of medical students who trust DocDot for their studies. 
            Start your journey to medical excellence today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 font-semibold">
                <GraduationCap className="w-5 h-5 mr-2" />
                Get Started Today - It's Free
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200 text-sm">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2" />
              <span>Award-Winning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={logoPath}
                  alt="DocDot Logo" 
                  className="h-8 w-auto filter brightness-0 invert"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DocDot
                </span>
              </div>
              <p className="text-gray-400 dark:text-gray-300 mb-4 max-w-md">
                Empowering the next generation of medical professionals with AI-powered learning tools, 
                comprehensive study materials, and collaborative features.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors cursor-pointer">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">Platform</h3>
              <div className="space-y-2">
                <Link href="/auth" className="block text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Features</Link>
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">AI Tutor</Link>
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">Study Groups</Link>
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">Analytics</Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400 dark:text-purple-300">Support</h3>
              <div className="space-y-2">
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">Help Center</Link>
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">Contact Us</Link>
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 DocDot. All rights reserved. Empowering medical education worldwide.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span>System Status: All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}