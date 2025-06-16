import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
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

export default function Landing() {
  const { user, loading } = useAuth();

  // If user is authenticated, redirect to home
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#3399FF' }}></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/home" />;
  }
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
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and performance insights."
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Collaborate with peers and join study groups to enhance your learning experience."
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Earn badges and track milestones as you progress through your medical education."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Medical Student",
      comment: "Docdot transformed my study routine. The interactive quizzes and AI explanations helped me ace my anatomy exams.",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Resident Physician",
      comment: "The comprehensive question bank and detailed explanations make this an essential tool for medical education.",
      rating: 5
    },
    {
      name: "Dr. Emily Johnson",
      role: "Medical Student",
      comment: "I love how the platform adapts to my learning style. The progress tracking keeps me motivated every day.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
      <section className="relative py-20 px-8" style={{ backgroundColor: '#D1E8F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
                  alt="DocDot Medical Student Logo" 
                  className="h-12 w-auto"
                />
                <span className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>
                  DocDot
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#1C1C1C' }}>
                Master Medical Knowledge with 
                <span style={{ color: '#3399FF' }}> AI-Powered</span> Learning
              </h1>
              
              <p className="text-xl mb-8" style={{ color: '#2E2E2E' }}>
                Comprehensive medical education platform designed for students and professionals. 
                Interactive quizzes, detailed study materials, and personalized AI guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="text-lg px-8 py-4" style={{ backgroundColor: '#3399FF' }}>
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4" style={{ borderColor: '#3399FF', color: '#3399FF' }}>
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center mt-8 space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#3399FF' }} />
                  <span className="text-sm" style={{ color: '#2E2E2E' }}>Free to get started</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#3399FF' }} />
                  <span className="text-sm" style={{ color: '#2E2E2E' }}>10,000+ medical questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#3399FF' }} />
                  <span className="text-sm" style={{ color: '#2E2E2E' }}>AI-powered explanations</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Anatomical Imagery */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop" 
                  alt="Human anatomy skeleton" 
                  className="rounded-lg shadow-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300&h=200&fit=crop" 
                  alt="Medical microscopy" 
                  className="rounded-lg shadow-lg mt-8"
                />
                <img 
                  src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&h=200&fit=crop" 
                  alt="Medical stethoscope" 
                  className="rounded-lg shadow-lg -mt-8"
                />
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=200&fit=crop" 
                  alt="Human heart anatomy" 
                  className="rounded-lg shadow-lg"
                />
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#3399FF' }}>98%</div>
                  <div className="text-sm" style={{ color: '#2E2E2E' }}>Pass Rate</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#3399FF' }}>50K+</div>
                  <div className="text-sm" style={{ color: '#2E2E2E' }}>Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C1C1C' }}>
              Everything You Need to Excel in Medical Education
            </h2>
            <p className="text-xl" style={{ color: '#2E2E2E' }}>
              Comprehensive tools and resources designed by medical professionals for medical professionals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F7FAFC' }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#D1E8F9' }}>
                      <feature.icon className="w-6 h-6" style={{ color: '#3399FF' }} />
                    </div>
                    <h3 className="text-xl font-semibold" style={{ color: '#1C1C1C' }}>
                      {feature.title}
                    </h3>
                  </div>
                  <p style={{ color: '#2E2E2E' }}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-8" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C1C1C' }}>
              Trusted by Medical Students Worldwide
            </h2>
            <p className="text-xl" style={{ color: '#2E2E2E' }}>
              See what our users have to say about their learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#3399FF' }} />
                    ))}
                  </div>
                  <p className="mb-4" style={{ color: '#2E2E2E' }}>
                    "{testimonial.comment}"
                  </p>
                  <div>
                    <div className="font-semibold" style={{ color: '#1C1C1C' }}>
                      {testimonial.name}
                    </div>
                    <div className="text-sm" style={{ color: '#2E2E2E' }}>
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-8" style={{ backgroundColor: '#3399FF' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Medical Education?
          </h2>
          <p className="text-xl mb-8 text-white opacity-90">
            Join thousands of medical students and professionals who are already using Docdot to excel in their studies.
          </p>
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 py-4 bg-white hover:bg-gray-100" style={{ color: '#3399FF' }}>
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8" style={{ backgroundColor: '#1C1C1C' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
              alt="DocDot Medical Student Logo" 
              className="h-8 w-auto filter brightness-0 invert"
            />
            <span className="text-xl font-bold text-white">
              DocDot
            </span>
          </div>
          <p className="text-gray-400">
            © 2024 DocDot. Empowering medical education worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}