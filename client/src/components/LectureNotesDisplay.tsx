import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Loader2, 
  BookOpen, 
  Brain, 
  Target,
  ExternalLink,
  Star
} from 'lucide-react';

interface LectureNotesProps {
  lectureId: string;
}

interface LectureNotes {
  id: string;
  lectureId: string;
  liveNotes: string;
  finalNotes: string;
  summary: string;
  keyPoints: string[];
  medicalTerms: { term: string; definition: string }[];
  researchContext: string;
  processingStatus: string;
}

export const LectureNotesDisplay: React.FC<LectureNotesProps> = ({ lectureId }) => {
  // Fetch lecture notes
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['/api/lectures', lectureId, 'notes'],
    queryFn: async () => {
      const response = await fetch(`/api/lectures/${lectureId}/notes`);
      if (!response.ok) {
        throw new Error('Failed to fetch lecture notes');
      }
      return response.json();
    },
    enabled: !!lectureId
  });

  const downloadNotes = async () => {
    try {
      const response = await fetch(`/api/lectures/${lectureId}/download-notes`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lecture-notes-${lectureId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading notes:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading lecture notes...</span>
      </div>
    );
  }

  if (error || !notes) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No notes available for this lecture</p>
        <p className="text-sm text-gray-400 mt-2">The lecture may still be processing or failed to generate notes</p>
      </div>
    );
  }

  // Clean and parse data that might be in JSON format
  let keyPoints: string[] = [];
  let medicalTerms: { term: string; definition: string }[] = [];
  let cleanSummary = notes.summary || '';
  let cleanFinalNotes = notes.finalNotes || '';
  
  // Clean JSON formatting from summary if it exists
  if (cleanSummary.includes('```json') || cleanSummary.startsWith('{')) {
    try {
      // Extract JSON content if wrapped in markdown code blocks
      let jsonStr = cleanSummary.replace(/```json\s*/, '').replace(/```\s*$/, '');
      if (jsonStr.startsWith('{')) {
        const parsed = JSON.parse(jsonStr);
        cleanSummary = parsed.summary || cleanSummary;
      }
    } catch {
      // If parsing fails, try to extract readable text
      cleanSummary = cleanSummary.replace(/```json\s*/, '').replace(/```\s*$/, '').replace(/^\{.*?"summary":\s*"/, '').replace(/",.*\}$/, '').trim();
    }
  }
  
  // Clean JSON formatting from final notes if it exists
  if (cleanFinalNotes.includes('```json') || cleanFinalNotes.startsWith('{')) {
    try {
      let jsonStr = cleanFinalNotes.replace(/```json\s*/, '').replace(/```\s*$/, '');
      if (jsonStr.startsWith('{')) {
        const parsed = JSON.parse(jsonStr);
        cleanFinalNotes = parsed.summary || parsed.notes || cleanFinalNotes;
        
        // Extract key points and medical terms if available
        if (parsed.keyPoints) keyPoints = parsed.keyPoints;
        if (parsed.medicalTerms) medicalTerms = parsed.medicalTerms;
      }
    } catch {
      // Keep original if parsing fails
      cleanFinalNotes = cleanFinalNotes.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
  }
  
  // Parse key points if not already parsed
  if (keyPoints.length === 0) {
    try {
      const keyPointsData = typeof notes.keyPoints === 'string' 
        ? JSON.parse(notes.keyPoints) 
        : notes.keyPoints || [];
      keyPoints = Array.isArray(keyPointsData) ? keyPointsData : [];
    } catch {
      keyPoints = [];
    }
  }
  
  // Parse medical terms if not already parsed
  if (medicalTerms.length === 0) {
    try {
      const medicalTermsData = typeof notes.medicalTerms === 'string' 
        ? JSON.parse(notes.medicalTerms) 
        : notes.medicalTerms || [];
      medicalTerms = Array.isArray(medicalTermsData) ? medicalTermsData : [];
    } catch {
      medicalTerms = [];
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with download button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Generated Lecture Notes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive notes with medical terminology and research context
          </p>
        </div>
        <Button 
          onClick={downloadNotes}
          variant="outline"
          className="flex items-center space-x-2"
          data-testid="download-notes-button"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
      </div>

      {/* Status badge */}
      <Badge 
        variant="outline" 
        className="bg-green-50 text-green-700 border-green-200"
      >
        <Star className="w-3 h-3 mr-1" />
        Processing Status: {notes.processingStatus}
      </Badge>

      {/* Live Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Structured Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 leading-relaxed">
              {notes.liveNotes || cleanFinalNotes || 'No notes content available'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {cleanSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Comprehensive Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                {cleanSummary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Points Section */}
      {keyPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-600" />
              <span>Key Learning Points</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {keyPoints.map((point: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center justify-center mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 flex-1">{point}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Terms Section */}
      {medicalTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-green-600" />
              <span>Medical Terminology</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {medicalTerms.map((term: { term: string; definition: string }, index: number) => (
                <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    {term.term}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {term.definition}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Context Section */}
      {notes.researchContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-indigo-600" />
              <span>Research Context & Clinical Applications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                {notes.researchContext}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LectureNotesDisplay;