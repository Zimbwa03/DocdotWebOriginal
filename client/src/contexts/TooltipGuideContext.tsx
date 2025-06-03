import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TooltipStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  page: string;
  order: number;
}

interface TooltipGuideContextType {
  isGuideActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentPageSteps: TooltipStep[];
  startGuide: (page: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipGuide: () => void;
  finishGuide: () => void;
  isFirstTimeUser: boolean;
  setIsFirstTimeUser: (value: boolean) => void;
  getCurrentStepData: () => TooltipStep | null;
}

const TooltipGuideContext = createContext<TooltipGuideContextType | undefined>(undefined);

const tooltipSteps: TooltipStep[] = [
  // Home Page
  {
    id: 'home-welcome',
    target: '[data-tooltip="welcome-message"]',
    title: 'Welcome to Docdot!',
    content: 'Your personalized medical learning journey starts here. This dashboard shows your progress and quick access to all features.',
    position: 'bottom',
    page: 'home',
    order: 1
  },
  {
    id: 'home-stats',
    target: '[data-tooltip="user-stats"]',
    title: 'Your Learning Stats',
    content: 'Track your quiz performance, study streaks, and overall progress. Watch your medical knowledge grow over time!',
    position: 'left',
    page: 'home',
    order: 2
  },
  {
    id: 'home-quick-quiz',
    target: '[data-tooltip="quick-quiz"]',
    title: 'Quick Quiz Access',
    content: 'Jump straight into practice with our curated medical questions. Perfect for quick study sessions between classes!',
    position: 'top',
    page: 'home',
    order: 3
  },
  {
    id: 'home-recent-activity',
    target: '[data-tooltip="recent-activity"]',
    title: 'Recent Activity',
    content: 'See your latest quiz attempts and study sessions. Keep track of what you\'ve been working on recently.',
    position: 'right',
    page: 'home',
    order: 4
  },

  // Navigation
  {
    id: 'nav-theme-toggle',
    target: '[data-tooltip="theme-toggle"]',
    title: 'Theme Toggle',
    content: 'Switch between light and dark modes to suit your study environment and reduce eye strain during long sessions.',
    position: 'bottom',
    page: 'navigation',
    order: 1
  },
  {
    id: 'nav-quiz-link',
    target: '[data-tooltip="nav-quiz"]',
    title: 'Quiz Section',
    content: 'Access our comprehensive quiz system with AI-generated questions, cadaver anatomy, and more.',
    position: 'bottom',
    page: 'navigation',
    order: 2
  },
  {
    id: 'nav-study-guide',
    target: '[data-tooltip="nav-study-guide"]',
    title: 'Study Tools',
    content: 'Find all your study tools here: timer, planner, study groups, and medical resources.',
    position: 'bottom',
    page: 'navigation',
    order: 3
  },

  // Quiz Page
  {
    id: 'quiz-ai-generator',
    target: '[data-tooltip="ai-generator"]',
    title: 'AI Question Generator',
    content: 'Generate personalized medical questions using advanced AI. Specify topics, difficulty levels, and learning objectives.',
    position: 'right',
    page: 'quiz',
    order: 1
  },
  {
    id: 'quiz-cadaver',
    target: '[data-tooltip="cadaver-quiz"]',
    title: 'Cadaver Anatomy',
    content: 'Practice with real cadaver images to master anatomical structures. Essential for medical exams and clinical practice.',
    position: 'left',
    page: 'quiz',
    order: 2
  },
  {
    id: 'quiz-categories',
    target: '[data-tooltip="quiz-categories"]',
    title: 'Medical Categories',
    content: 'Browse questions by medical specialties. From cardiology to neurology, we have comprehensive coverage.',
    position: 'top',
    page: 'quiz',
    order: 3
  },

  // Study Guide
  {
    id: 'study-timer',
    target: '[data-tooltip="study-timer"]',
    title: 'Pomodoro Study Timer',
    content: 'Use the advanced Pomodoro technique with background music and session tracking to optimize your study sessions.',
    position: 'bottom',
    page: 'study-guide',
    order: 1
  },
  {
    id: 'study-planner',
    target: '[data-tooltip="study-planner"]',
    title: 'Study Planner',
    content: 'Plan your study sessions, set goals, and track your progress across different medical subjects.',
    position: 'bottom',
    page: 'study-guide',
    order: 2
  },
  {
    id: 'study-groups',
    target: '[data-tooltip="study-groups"]',
    title: 'Study Groups',
    content: 'Join or create study groups with fellow medical students. Collaborate and learn together!',
    position: 'bottom',
    page: 'study-guide',
    order: 3
  },
  {
    id: 'study-resources',
    target: '[data-tooltip="study-resources"]',
    title: 'Medical Resources',
    content: 'Access curated medical books, references, and study materials through our Google Drive integration.',
    position: 'bottom',
    page: 'study-guide',
    order: 4
  },

  // Analytics Page
  {
    id: 'analytics-overview',
    target: '[data-tooltip="analytics-overview"]',
    title: 'Performance Analytics',
    content: 'Comprehensive analysis of your learning progress with charts, trends, and detailed insights.',
    position: 'bottom',
    page: 'analytics',
    order: 1
  },
  {
    id: 'analytics-charts',
    target: '[data-tooltip="analytics-charts"]',
    title: 'Progress Charts',
    content: 'Visual representation of your performance over time. Track improvements and identify areas for focus.',
    position: 'top',
    page: 'analytics',
    order: 2
  }
];

export function TooltipGuideProvider({ children }: { children: ReactNode }) {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPage, setCurrentPage] = useState('');
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if user is first-time visitor
  useEffect(() => {
    const hasVisited = localStorage.getItem('docdot-has-visited');
    if (!hasVisited) {
      setIsFirstTimeUser(true);
      localStorage.setItem('docdot-has-visited', 'true');
    }
  }, []);

  // Auto-start guide for first-time users
  useEffect(() => {
    if (isFirstTimeUser && !isGuideActive) {
      // Small delay to let the page render
      setTimeout(() => {
        startGuide('home');
      }, 1000);
    }
  }, [isFirstTimeUser, isGuideActive]);

  const currentPageSteps = tooltipSteps
    .filter(step => step.page === currentPage)
    .sort((a, b) => a.order - b.order);

  const startGuide = (page: string) => {
    console.log('Starting guide for page:', page);
    setCurrentPage(page);
    setCurrentStep(0);
    setIsGuideActive(true);
    setIsFirstTimeUser(false); // Reset first time user flag when manually triggered
  };

  const nextStep = () => {
    if (currentStep < currentPageSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    setIsGuideActive(false);
    setCurrentStep(0);
    setIsFirstTimeUser(false);
  };

  const finishGuide = () => {
    setIsGuideActive(false);
    setCurrentStep(0);
    setIsFirstTimeUser(false);
    
    // Store completion in localStorage
    localStorage.setItem('docdot-guide-completed', 'true');
  };

  const getCurrentStepData = () => {
    return currentPageSteps[currentStep] || null;
  };

  return (
    <TooltipGuideContext.Provider
      value={{
        isGuideActive,
        currentStep,
        totalSteps: currentPageSteps.length,
        currentPageSteps,
        startGuide,
        nextStep,
        prevStep,
        skipGuide,
        finishGuide,
        isFirstTimeUser,
        setIsFirstTimeUser,
        getCurrentStepData
      }}
    >
      {children}
    </TooltipGuideContext.Provider>
  );
}

export function useTooltipGuide() {
  const context = useContext(TooltipGuideContext);
  if (context === undefined) {
    throw new Error('useTooltipGuide must be used within a TooltipGuideProvider');
  }
  return context;
}