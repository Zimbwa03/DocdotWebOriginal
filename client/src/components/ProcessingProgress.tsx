import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProcessingProgressProps {
  lectureId: string;
  onProcessingComplete?: () => void;
}

interface ProgressData {
  id: string;
  status: string;
  progress: number;
  step: string;
  updatedAt: string;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ 
  lectureId, 
  onProcessingComplete 
}) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/lectures/${lectureId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
        
        // Show progress indicator if processing has started
        if (data.status === 'processing') {
          setIsVisible(true);
        }
        
        // Hide and call callback when completed
        if (data.status === 'completed') {
          setIsVisible(false);
          if (onProcessingComplete) {
            onProcessingComplete();
          }
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
        
        // Hide if failed
        if (data.status === 'failed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  useEffect(() => {
    // Start polling when lectureId changes
    if (lectureId) {
      fetchProgress();
      
      // Poll every 2 seconds for progress updates
      const interval = setInterval(fetchProgress, 2000);
      setPollingInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [lectureId]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  if (!isVisible || !progressData) {
    return null;
  }

  const getStatusIcon = () => {
    switch (progressData.status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (progressData.status) {
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border shadow-lg" data-testid="processing-progress-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          AI Processing Status
          <Badge variant="outline" className={`ml-auto text-white ${getStatusColor()}`}>
            {progressData.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium" data-testid="progress-percentage">
              {progressData.progress}%
            </span>
          </div>
          <Progress 
            value={progressData.progress} 
            className="h-2"
            data-testid="progress-bar"
          />
        </div>
        
        {progressData.step && (
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Current Step:</div>
            <div className="text-sm font-medium text-gray-900" data-testid="current-step">
              {progressData.step}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Last updated: {new Date(progressData.updatedAt).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingProgress;