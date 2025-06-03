import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Download, ExternalLink, Search, FileText, File, Image, Video } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export default function GoogleDriveLibrary() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Fetch Google Drive files
  const { data: driveFiles = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/google-drive/files', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await fetch(`/api/google-drive/files?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          setIsConnected(false);
          return [];
        }
        throw new Error('Failed to fetch files');
      }
      setIsConnected(true);
      return response.json();
    },
    enabled: isConnected,
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <Image className="w-5 h-5 text-green-500" />;
    } else if (mimeType.includes('video')) {
      return <Video className="w-5 h-5 text-blue-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (size?: string) => {
    if (!size) return 'Unknown size';
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const connectToGoogleDrive = async () => {
    try {
      const response = await fetch('/api/google-drive/auth');
      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }
      const { authUrl } = await response.json();
      window.open(authUrl, '_blank');
      
      // Check for connection status periodically
      const checkConnection = setInterval(async () => {
        try {
          const statusResponse = await fetch('/api/google-drive/status');
          if (statusResponse.ok) {
            const { connected } = await statusResponse.json();
            if (connected) {
              setIsConnected(true);
              clearInterval(checkConnection);
              refetch();
              toast({
                title: "Google Drive Connected",
                description: "Successfully connected to your Google Drive account."
              });
            }
          }
        } catch (error) {
          console.log('Checking connection status...');
        }
      }, 2000);

      // Stop checking after 60 seconds
      setTimeout(() => clearInterval(checkConnection), 60000);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Drive. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Medical Library
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Google Drive</h3>
            <p className="text-gray-600 mb-4">
              Access your medical textbooks, study materials, and documents from Google Drive
            </p>
            <Button onClick={connectToGoogleDrive} className="mt-4">
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Google Drive
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Medical Library
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-center">Loading your library...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Medical Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search your medical books and documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {driveFiles.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try a different search term' : 'No medical books or documents in your Google Drive'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {driveFiles.map((file: DriveFile) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {file.thumbnailLink ? (
                        <img 
                          src={file.thumbnailLink} 
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center">
                          {getFileIcon(file.mimeType)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {file.mimeType.includes('pdf') ? 'PDF' : 
                             file.mimeType.includes('document') ? 'Doc' :
                             file.mimeType.includes('image') ? 'Image' : 'File'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(file.webViewLink, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {file.webContentLink && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(file.webContentLink, '_blank')}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}