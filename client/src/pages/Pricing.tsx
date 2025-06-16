import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Brain, 
  BookOpen, 
  Bot,
  Calendar,
  Trophy,
  CreditCard
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: Feature[];
  popular?: boolean;
  ctaText: string;
  color: string;
}

interface Feature {
  name: string;
  included: boolean;
  description?: string;
}

export default function Pricing() {
  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      color: 'gray',
      ctaText: 'Current Plan',
      features: [
        { name: 'Limited quizzes (5 per day)', included: true, description: 'Basic quiz access to test knowledge' },
        { name: 'View study notes', included: true, description: 'Access to free anatomy and physiology notes' },
        { name: 'Basic progress stats', included: true, description: 'Track XP, level, and study streak' },
        { name: 'Preview book library', included: true, description: 'Browse available study materials' },
        { name: 'View topic videos', included: true, description: 'Educational video content' },
        { name: 'Unlimited quizzes', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Book downloads', included: false },
        { name: 'AI tutoring', included: false },
        { name: 'Concept mastery tracking', included: false },
        { name: 'Study planner', included: false },
        { name: 'AI flashcards & mnemonics', included: false },
        { name: 'Priority support', included: false }
      ]
    },
    {
      name: 'Starter',
      price: '$9.99',
      description: 'For serious medical students',
      color: 'blue',
      ctaText: 'Upgrade to Starter',
      features: [
        { name: 'Limited quizzes (5 per day)', included: false },
        { name: 'View study notes', included: true },
        { name: 'Basic progress stats', included: true },
        { name: 'Preview book library', included: true },
        { name: 'View topic videos', included: true },
        { name: 'Unlimited quizzes', included: true, description: 'Take as many quizzes as you want' },
        { name: 'Advanced analytics', included: true, description: 'Detailed performance insights and progress tracking' },
        { name: 'Book downloads', included: true, description: 'Download PDF study materials for offline use' },
        { name: 'AI tutoring', included: false },
        { name: 'Concept mastery tracking', included: false },
        { name: 'Study planner', included: false },
        { name: 'AI flashcards & mnemonics', included: false },
        { name: 'Priority support', included: true, description: 'Get help when you need it' }
      ]
    },
    {
      name: 'Premium',
      price: '$20',
      description: 'Complete medical education suite',
      color: 'purple',
      popular: true,
      ctaText: 'Upgrade to Premium',
      features: [
        { name: 'Limited quizzes (5 per day)', included: false },
        { name: 'View study notes', included: true },
        { name: 'Basic progress stats', included: true },
        { name: 'Preview book library', included: true },
        { name: 'View topic videos', included: true },
        { name: 'Unlimited quizzes', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Book downloads', included: true },
        { name: 'AI tutoring', included: true, description: 'Chat with AI for personalized explanations' },
        { name: 'Concept mastery tracking', included: true, description: 'Advanced learning analytics and weak area identification' },
        { name: 'Study planner', included: true, description: 'Intelligent scheduling and calendar integration' },
        { name: 'AI flashcards & mnemonics', included: true, description: 'AI-generated study aids and memory techniques' },
        { name: 'Priority support', included: true }
      ]
    }
  ];

  const getFeatureIcon = (included: boolean) => {
    return included ? (
      <Check className="text-green-600" size={16} />
    ) : (
      <X className="text-gray-400" size={16} />
    );
  };

  const getCardStyle = (tier: PricingTier) => {
    if (tier.popular) {
      return "border-2 border-purple-500 shadow-lg relative";
    }
    return "border border-gray-200";
  };

  const getButtonStyle = (tier: PricingTier) => {
    if (tier.name === 'Free') {
      return "bg-gray-500 text-white cursor-not-allowed";
    }
    if (tier.popular) {
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    }
    return "bg-docdot-blue text-white";
  };

  return (
    <div className="min-h-screen bg-docdot-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/DocDot Medical Student Logo.png" 
              alt="DocDot Medical Student Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#1C1C1C' }}>Choose Your Plan</h1>
            </div>
          </div>
          <p className="text-xl text-docdot-text max-w-2xl mx-auto">
            Unlock advanced features and accelerate your medical education journey with our comprehensive plans
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-docdot-heading mb-2">Comprehensive Notes</h3>
            <p className="text-docdot-text text-sm">Access detailed study materials across all medical subjects</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-docdot-heading mb-2">Interactive Quizzes</h3>
            <p className="text-docdot-text text-sm">Test your knowledge with unlimited practice questions</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bot className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-docdot-heading mb-2">AI-Powered Learning</h3>
            <p className="text-docdot-text text-sm">Get personalized tutoring and AI-generated study aids</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <h3 className="font-semibold text-docdot-heading mb-2">Study Planning</h3>
            <p className="text-docdot-text text-sm">Organize your learning with intelligent scheduling</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={getCardStyle(tier)}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    <Star className="mr-1" size={14} />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-docdot-heading mb-2">
                  {tier.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-docdot-heading">
                    {tier.price}
                  </span>
                  {tier.price !== '$0' && (
                    <span className="text-docdot-text">/month</span>
                  )}
                </div>
                <p className="text-docdot-text">{tier.description}</p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {getFeatureIcon(feature.included)}
                      <div className="flex-1">
                        <span className={`text-sm ${
                          feature.included ? 'text-docdot-heading' : 'text-gray-400 line-through'
                        }`}>
                          {feature.name}
                        </span>
                        {feature.description && feature.included && (
                          <p className="text-xs text-docdot-text mt-1">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${getButtonStyle(tier)}`}
                  disabled={tier.name === 'Free'}
                >
                  {tier.ctaText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-docdot-heading text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-docdot-heading mb-2">
                Can I upgrade or downgrade my plan anytime?
              </h3>
              <p className="text-docdot-text text-sm">
                Yes, you can change your subscription plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-docdot-heading mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-docdot-text text-sm">
                We accept all major credit cards, PayPal, and EcoCash for local payments in Zimbabwe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-docdot-heading mb-2">
                Is there a student discount available?
              </h3>
              <p className="text-docdot-text text-sm">
                Yes! Medical students can get 50% off any plan with valid student ID verification.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-docdot-heading mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-docdot-text text-sm">
                Your study progress and notes are preserved for 90 days after cancellation, allowing you to reactivate without losing data.
              </p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <Card className="mt-12 bg-gradient-to-r from-docdot-blue to-blue-600 text-white">
          <CardContent className="text-center py-8">
            <Trophy className="mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-4">
              Ready to Excel in Your Medical Studies?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of medical students who have transformed their learning with Docdot
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-docdot-blue hover:bg-gray-100">
                Start Free Trial
              </Button>
              <Link href="/home">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-docdot-blue">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Donation Section */}
        <Card className="mt-8 border-2 border-green-200 bg-green-50">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-docdot-heading mb-2">
              Support Open Medical Education
            </h3>
            <p className="text-docdot-text mb-4">
              Help us keep quality medical education accessible to students worldwide
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-docdot-text">
              <div className="flex items-center">
                <CreditCard className="mr-2" size={16} />
                <span>EcoCash: +263 78 483 7096</span>
              </div>
              <span>|</span>
              <span>Takudzwa Zimbwa</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}