import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTooltipGuide } from '@/contexts/TooltipGuideContext';
import { X, ArrowRight, ArrowLeft, SkipForward, Lightbulb } from 'lucide-react';

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TooltipGuide() {
  const {
    isGuideActive,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipGuide,
    finishGuide,
    getCurrentStepData
  } = useTooltipGuide();

  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const stepData = getCurrentStepData();

  useEffect(() => {
    if (!isGuideActive || !stepData) {
      setShowTooltip(false);
      return;
    }

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      const targetElement = document.querySelector(stepData.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        setShowTooltip(true);

        // Add highlight effect to target element
        targetElement.classList.add('tooltip-highlight');
        
        // Scroll target into view if needed
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Remove highlight from all elements
      document.querySelectorAll('.tooltip-highlight').forEach(el => {
        el.classList.remove('tooltip-highlight');
      });
    };
  }, [isGuideActive, stepData, currentStep]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (stepData && showTooltip) {
        const targetElement = document.querySelector(stepData.target);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          setTooltipPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [stepData, showTooltip]);

  if (!isGuideActive || !showTooltip || !stepData || !tooltipPosition) {
    return null;
  }

  const getTooltipStyles = () => {
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate height
    const offset = 16;
    
    let styles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      width: `${tooltipWidth}px`,
      maxWidth: '90vw'
    };

    switch (stepData.position) {
      case 'top':
        styles.top = tooltipPosition.top - tooltipHeight - offset;
        styles.left = tooltipPosition.left + (tooltipPosition.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        styles.top = tooltipPosition.top + tooltipPosition.height + offset;
        styles.left = tooltipPosition.left + (tooltipPosition.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        styles.top = tooltipPosition.top + (tooltipPosition.height / 2) - (tooltipHeight / 2);
        styles.left = tooltipPosition.left - tooltipWidth - offset;
        break;
      case 'right':
        styles.top = tooltipPosition.top + (tooltipPosition.height / 2) - (tooltipHeight / 2);
        styles.left = tooltipPosition.left + tooltipPosition.width + offset;
        break;
    }

    // Ensure tooltip stays within viewport
    if (styles.left && typeof styles.left === 'number') {
      if (styles.left < 16) styles.left = 16;
      if (styles.left + tooltipWidth > window.innerWidth - 16) {
        styles.left = window.innerWidth - tooltipWidth - 16;
      }
    }

    if (styles.top && typeof styles.top === 'number') {
      if (styles.top < 16) styles.top = 16;
      if (styles.top + tooltipHeight > window.innerHeight - 16) {
        styles.top = window.innerHeight - tooltipHeight - 16;
      }
    }

    return styles;
  };

  const getArrowStyles = () => {
    const arrowSize = 8;
    let arrowStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    };

    switch (stepData.position) {
      case 'top':
        arrowStyles.bottom = -arrowSize;
        arrowStyles.left = '50%';
        arrowStyles.marginLeft = -arrowSize;
        arrowStyles.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
        arrowStyles.borderColor = 'hsl(var(--border)) transparent transparent transparent';
        break;
      case 'bottom':
        arrowStyles.top = -arrowSize;
        arrowStyles.left = '50%';
        arrowStyles.marginLeft = -arrowSize;
        arrowStyles.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
        arrowStyles.borderColor = 'transparent transparent hsl(var(--border)) transparent';
        break;
      case 'left':
        arrowStyles.right = -arrowSize;
        arrowStyles.top = '50%';
        arrowStyles.marginTop = -arrowSize;
        arrowStyles.borderWidth = `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`;
        arrowStyles.borderColor = 'transparent transparent transparent hsl(var(--border))';
        break;
      case 'right':
        arrowStyles.left = -arrowSize;
        arrowStyles.top = '50%';
        arrowStyles.marginTop = -arrowSize;
        arrowStyles.borderWidth = `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`;
        arrowStyles.borderColor = 'transparent hsl(var(--border)) transparent transparent';
        break;
    }

    return arrowStyles;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={skipGuide}
      />
      
      {/* Spotlight effect on target element */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          top: tooltipPosition.top - 4,
          left: tooltipPosition.left - 4,
          width: tooltipPosition.width + 8,
          height: tooltipPosition.height + 8,
          background: 'transparent',
          border: '2px solid hsl(var(--primary))',
          borderRadius: '8px',
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1), 0 0 20px rgba(59, 130, 246, 0.3)',
          animation: 'pulse 2s infinite'
        }}
      />

      {/* Tooltip */}
      <Card 
        ref={tooltipRef}
        className="bg-background border-2 border-primary/20 shadow-2xl"
        style={getTooltipStyles()}
      >
        <div style={getArrowStyles()} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{stepData.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} of {totalSteps}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipGuide}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {stepData.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="text-xs"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipGuide}
                className="text-xs"
              >
                <SkipForward className="w-3 h-3 mr-1" />
                Skip Tour
              </Button>
              
              {currentStep < totalSteps - 1 ? (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="text-xs"
                >
                  Next
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={finishGuide}
                  className="text-xs bg-green-600 hover:bg-green-700"
                >
                  Finish Tour
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .tooltip-highlight {
          position: relative;
          z-index: 10000 !important;
        }
      `}</style>
    </>
  );
}