import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocation } from 'wouter';
import { 
  GraduationCap, 
  User, 
  BookOpen, 
  Target, 
  Clock,
  Brain,
  CheckCircle,
  ArrowRight,
  Calendar,
  Award
} from 'lucide-react';

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    
    // Education Background
    educationLevel: '',
    institution: '',
    yearOfStudy: '',
    specialization: '',
    
    // Learning Preferences
    studyGoals: [] as string[],
    preferredTopics: [] as string[],
    learningStyle: '',
    studyTimePerDay: '',
    
    // Experience Level
    medicalBackground: '',
    priorKnowledge: [] as string[],
    difficultyPreference: '',
    
    // Study Habits
    bestStudyTime: '',
    weeklyStudyDays: [] as string[],
    motivationFactors: [] as string[]
  });

  const totalSteps = 5;

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup and redirect to home
      localStorage.setItem('profileSetupComplete', 'true');
      setLocation('/home');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Welcome to Docdot!</h2>
              <p style={{ color: '#2E2E2E' }}>Let's personalize your medical learning experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={profileData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="ng">Nigeria</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Education Background</h2>
              <p style={{ color: '#2E2E2E' }}>Tell us about your medical education journey</p>
            </div>

            <div>
              <Label>Current Education Level</Label>
              <RadioGroup 
                value={profileData.educationLevel} 
                onValueChange={(value) => handleInputChange('educationLevel', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pre-med" id="pre-med" />
                  <Label htmlFor="pre-med">Pre-medical Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medical-student" id="medical-student" />
                  <Label htmlFor="medical-student">Medical Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resident" id="resident" />
                  <Label htmlFor="resident">Resident/Intern</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fellow" id="fellow" />
                  <Label htmlFor="fellow">Fellow</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="practicing" id="practicing" />
                  <Label htmlFor="practicing">Practicing Physician</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other-healthcare" id="other-healthcare" />
                  <Label htmlFor="other-healthcare">Other Healthcare Professional</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="institution">Institution/Medical School</Label>
              <Input
                id="institution"
                value={profileData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                placeholder="Enter your institution name"
              />
            </div>

            {profileData.educationLevel === 'medical-student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Year of Study</Label>
                  <Select value={profileData.yearOfStudy} onValueChange={(value) => handleInputChange('yearOfStudy', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Year</SelectItem>
                      <SelectItem value="2nd">2nd Year</SelectItem>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                      <SelectItem value="5th">5th Year</SelectItem>
                      <SelectItem value="6th">6th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="specialization">Intended Specialization (Optional)</Label>
                  <Input
                    id="specialization"
                    value={profileData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="e.g., Cardiology, Surgery"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Learning Goals & Preferences</h2>
              <p style={{ color: '#2E2E2E' }}>What do you want to achieve with your studies?</p>
            </div>

            <div>
              <Label className="text-base font-medium">Primary Study Goals (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {[
                  'Pass medical school exams',
                  'Prepare for USMLE/board exams',
                  'Improve clinical knowledge',
                  'Learn anatomy fundamentals',
                  'Master physiology concepts',
                  'Review for residency',
                  'Continuing medical education',
                  'Personal interest'
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={profileData.studyGoals.includes(goal)}
                      onCheckedChange={() => handleArrayToggle('studyGoals', goal)}
                    />
                    <Label htmlFor={goal} className="text-sm">{goal}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Preferred Topics (Select your interests)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {[
                  'Anatomy',
                  'Physiology',
                  'Histology and Embryology',
                  'Pathology',
                  'Pharmacology',
                  'Biochemistry',
                  'Microbiology',
                  'Immunology',
                  'Clinical Medicine',
                  'Surgery',
                  'Radiology',
                  'Laboratory Medicine'
                ].map((topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      id={topic}
                      checked={profileData.preferredTopics.includes(topic)}
                      onCheckedChange={() => handleArrayToggle('preferredTopics', topic)}
                    />
                    <Label htmlFor={topic} className="text-sm">{topic}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Daily Study Time Goal</Label>
              <Select value={profileData.studyTimePerDay} onValueChange={(value) => handleInputChange('studyTimePerDay', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select daily study time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15-30">15-30 minutes</SelectItem>
                  <SelectItem value="30-60">30-60 minutes</SelectItem>
                  <SelectItem value="1-2">1-2 hours</SelectItem>
                  <SelectItem value="2-4">2-4 hours</SelectItem>
                  <SelectItem value="4+">4+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Learning Style & Experience</h2>
              <p style={{ color: '#2E2E2E' }}>Help us understand how you learn best</p>
            </div>

            <div>
              <Label>Preferred Learning Style</Label>
              <RadioGroup 
                value={profileData.learningStyle} 
                onValueChange={(value) => handleInputChange('learningStyle', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visual" id="visual" />
                  <Label htmlFor="visual">Visual (diagrams, images, charts)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auditory" id="auditory" />
                  <Label htmlFor="auditory">Auditory (listening, discussions)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kinesthetic" id="kinesthetic" />
                  <Label htmlFor="kinesthetic">Kinesthetic (hands-on, interactive)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reading" id="reading" />
                  <Label htmlFor="reading">Reading/Writing (text-based)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mixed approach</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Medical Background</Label>
              <RadioGroup 
                value={profileData.medicalBackground} 
                onValueChange={(value) => handleInputChange('medicalBackground', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner (new to medical studies)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate (some medical background)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Advanced (extensive medical knowledge)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Preferred Question Difficulty</Label>
              <RadioGroup 
                value={profileData.difficultyPreference} 
                onValueChange={(value) => handleInputChange('difficultyPreference', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="adaptive" id="adaptive" />
                  <Label htmlFor="adaptive">Adaptive (AI adjusts based on performance)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy">Start with easier questions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Balanced difficulty</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard">Challenge me with harder questions</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#3399FF' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Study Schedule & Motivation</h2>
              <p style={{ color: '#2E2E2E' }}>Let's set up your optimal study routine</p>
            </div>

            <div>
              <Label>Best Time to Study</Label>
              <RadioGroup 
                value={profileData.bestStudyTime} 
                onValueChange={(value) => handleInputChange('bestStudyTime', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="early-morning" id="early-morning" />
                  <Label htmlFor="early-morning">Early Morning (5-8 AM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">Morning (8-12 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon">Afternoon (12-5 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">Evening (5-9 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="night" id="night" />
                  <Label htmlFor="night">Night (9 PM - 12 AM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Flexible/No preference</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Weekly Study Days (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={profileData.weeklyStudyDays.includes(day)}
                      onCheckedChange={() => handleArrayToggle('weeklyStudyDays', day)}
                    />
                    <Label htmlFor={day} className="text-sm">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">What motivates you to study? (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {[
                  'Achieving high scores',
                  'Competition with peers',
                  'Personal growth',
                  'Career advancement',
                  'Helping patients',
                  'Earning badges/rewards',
                  'Progress tracking',
                  'Learning new concepts'
                ].map((factor) => (
                  <div key={factor} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor}
                      checked={profileData.motivationFactors.includes(factor)}
                      onCheckedChange={() => handleArrayToggle('motivationFactors', factor)}
                    />
                    <Label htmlFor={factor} className="text-sm">{factor}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold" style={{ color: '#1C1C1C' }}>Profile Setup</h1>
            <span className="text-sm" style={{ color: '#2E2E2E' }}>
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300" 
              style={{ 
                backgroundColor: '#3399FF', 
                width: `${(currentStep / totalSteps) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <Card style={{ backgroundColor: '#F7FAFC' }}>
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6"
          >
            Previous
          </Button>
          
          <Button 
            onClick={nextStep}
            className="px-6"
            style={{ backgroundColor: '#3399FF' }}
          >
            {currentStep === totalSteps ? (
              <>
                Complete Setup
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}