import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, Download, Play, Pause, Clock, BookOpen, 
  User, MapPin, Calendar, Mic, MicOff, Volume2, 
  Settings, Copy, Eye, Brain, RefreshCcw 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Lecture, LectureTranscript, LectureNotes } from "@shared/schema";

interface LectureViewerProps {
  lecture: Lecture;
  onBack: () => void;
}

export function LectureViewer({ lecture, onBack }: LectureViewerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch transcript
  const { data: transcript, isLoading: transcriptLoading } = useQuery({
    queryKey: [`/api/lectures/${lecture.id}/transcript`],
  }) as { data: LectureTranscript | undefined, isLoading: boolean };

  // Fetch notes
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: [`/api/lectures/${lecture.id}/notes`],
  }) as { data: LectureNotes | undefined, isLoading: boolean };

  // Fetch processing status for lectures that are still processing
  const { data: processingStatus, isLoading: statusLoading } = useQuery({
    queryKey: [`/api/lectures/${lecture.id}/processing-status`],
    enabled: lecture.status === 'processing',
    refetchInterval: lecture.status === 'processing' ? 5000 : false, // Poll every 5 seconds if processing
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(mins / 60);
    const displayMins = mins % 60;
    
    if (hours > 0) {
      return `${hours}:${displayMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${displayMins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadPDF = async () => {
    try {
      // Generate PDF first
      const response = await apiRequest("POST", `/api/lectures/${lecture.id}/generate-pdf`);
      
      // Then download
      const downloadResponse = await fetch(`/api/lectures/${lecture.id}/download-pdf`);
      if (downloadResponse.ok) {
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lecture.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "PDF Downloaded",
          description: "Lecture notes have been saved to your device",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate or download PDF",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        variant: "default"
      });
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-4"
          data-testid="button-back-to-lectures"
        >
          ← Back to Lectures
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
              <Badge className={getStatusColor(lecture.status)} data-testid={`lecture-status-${lecture.status}`}>
                {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
              </Badge>
            </div>
            
            <p className="text-xl text-gray-600 mb-4">
              {lecture.module} {lecture.topic && `- ${lecture.topic}`}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              {lecture.lecturer && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{lecture.lecturer}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(lecture.duration || 0)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(lecture.createdAt || lecture.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {lecture.status === 'completed' && (
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2"
                data-testid="button-download-pdf"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Processing Status for ongoing lectures */}
      {lecture.status === 'processing' && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-yellow-700">Processing in Progress</span>
              </div>
              <RefreshCcw className="w-4 h-4 text-yellow-600 animate-spin" />
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              AI is transcribing audio, detecting languages, and generating comprehensive notes. This may take a few minutes.
            </p>
            
            {processingStatus?.logs && processingStatus.logs.length > 0 && (
              <div className="mt-4 space-y-2">
                {processingStatus.logs.slice(0, 3).map((log: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-yellow-600">
                    <div className={`w-2 h-2 rounded-full ${log.status === 'completed' ? 'bg-green-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <span className="capitalize">{log.step.replace(/_/g, ' ')}</span>
                    <span>-</span>
                    <span className="capitalize">{log.status}</span>
                    {log.duration && <span>({log.duration}ms)</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="transcript" data-testid="tab-transcript">Transcript</TabsTrigger>
          <TabsTrigger value="notes" data-testid="tab-notes">Notes</TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Lecture Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Module</label>
                  <p className="text-lg">{lecture.module}</p>
                </div>
                {lecture.topic && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Topic</label>
                    <p className="text-lg">{lecture.topic}</p>
                  </div>
                )}
                {lecture.lecturer && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lecturer</label>
                    <p className="text-lg">{lecture.lecturer}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-lg">{formatDuration(lecture.duration || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Recorded</label>
                  <p className="text-lg">{new Date(lecture.createdAt || lecture.date).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>AI Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transcription</span>
                  <Badge variant={transcript ? "default" : "secondary"}>
                    {transcript ? "Completed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Language Detection</span>
                  <Badge variant={transcript?.languageDetected ? "default" : "secondary"}>
                    {transcript?.languageDetected ? transcript.languageDetected : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Notes Generation</span>
                  <Badge variant={notes ? "default" : "secondary"}>
                    {notes ? "Completed" : "Pending"}
                  </Badge>
                </div>
                {transcript?.confidence && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className="text-sm">{Math.round(transcript.confidence * 100)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Lecture Transcript</span>
              </CardTitle>
              {transcript && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(
                    transcript.unifiedTranscript || transcript.rawTranscript || '',
                    "Transcript"
                  )}
                  data-testid="button-copy-transcript"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {transcriptLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading transcript...</p>
                </div>
              ) : transcript ? (
                <div className="space-y-4">
                  {transcript.languageDetected && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Languages detected:</span>
                      <Badge variant="outline">{transcript.languageDetected}</Badge>
                      {transcript.confidence && (
                        <span>({Math.round(transcript.confidence * 100)}% confidence)</span>
                      )}
                    </div>
                  )}
                  
                  <Separator />
                  
                  {transcript.unifiedTranscript && (
                    <div>
                      <h4 className="font-medium mb-2">English Translation:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                        {transcript.unifiedTranscript}
                      </div>
                    </div>
                  )}
                  
                  {transcript.rawTranscript && transcript.rawTranscript !== transcript.unifiedTranscript && (
                    <div>
                      <h4 className="font-medium mb-2">Original Transcript:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                        {transcript.rawTranscript}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">No transcript available</p>
                  <p className="text-sm">Transcript will appear here after processing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>AI-Generated Notes</span>
              </CardTitle>
              {notes && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(
                    notes.finalNotes || notes.liveNotes || '',
                    "Notes"
                  )}
                  data-testid="button-copy-notes"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading notes...</p>
                </div>
              ) : notes ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Processing status:</span>
                    <Badge variant={notes.processingStatus === 'completed' ? "default" : "secondary"}>
                      {notes.processingStatus}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-white p-6 rounded-lg border whitespace-pre-wrap leading-relaxed">
                      {notes.finalNotes || notes.liveNotes || 'No notes available'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">No notes available</p>
                  <p className="text-sm">AI-generated notes will appear here after processing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Technical Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transcript && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transcript Length</label>
                    <p className="text-lg">
                      {transcript.unifiedTranscript?.length || transcript.rawTranscript?.length || 0} characters
                    </p>
                  </div>
                )}
                {notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Notes Length</label>
                    <p className="text-lg">
                      {(notes.finalNotes || notes.liveNotes || '').length} characters
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Processing Status</label>
                  <p className="text-lg capitalize">{lecture.status}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Content Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notes?.keyPoints && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Key Points Extracted</label>
                    <p className="text-lg">{Array.isArray(notes.keyPoints) ? notes.keyPoints.length : 0}</p>
                  </div>
                )}
                {notes?.medicalTerms && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Medical Terms</label>
                    <p className="text-lg">
                      {typeof notes.medicalTerms === 'object' ? Object.keys(notes.medicalTerms).length : 0}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">AI Provider</label>
                  <p className="text-lg">Gemini AI</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}