
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Book, Download, ExternalLink } from "lucide-react";
import { useSubscription } from "@/context/subscription-context";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isPremium } = useSubscription();

  const { data: books, isLoading } = useQuery({
    queryKey: ['google-drive-files'],
    queryFn: async () => {
      const res = await fetch('/api/google-drive/files');
      if (!res.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await res.json();
      return data.files as DriveFile[];
    }
  });

  const filteredBooks = books?.filter(book => 
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePreview = async (fileId: string) => {
    try {
      const res = await fetch(`/api/google-drive/preview/${fileId}`);
      if (!res.ok) {
        throw new Error('Failed to get preview URL');
      }
      const { previewUrl } = await res.json();
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  return (
    <div className="py-12 bg-white dark:bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-10">
          <h2 className="text-base text-secondary-600 dark:text-secondary-400 font-semibold tracking-wide uppercase">Resources</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Medical Education Library
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            Access our comprehensive collection of medical textbooks and resources.
          </p>
        </div>
        
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search resources..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">Loading resources...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="truncate">{book.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Size: {formatFileSize(parseInt(book.size))}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last modified: {new Date(book.modifiedTime).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://drive.google.com/file/d/${book.id}/preview`, '_blank')}
                  >
                    <Book className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleDownload(book.id)}
                    disabled={!isPremium}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isPremium ? 'Download' : 'Premium Only'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
