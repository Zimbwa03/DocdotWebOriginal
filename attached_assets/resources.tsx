
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch('/api/resources/books');
      if (!res.ok) {
        throw new Error('Failed to fetch books');
      }
      return res.json() as Promise<DriveFile[]>;
    }
  });

  const filteredBooks = books?.filter(book => 
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDownload = async (fileId: string) => {
    try {
      const res = await fetch(`/api/resources/books/${fileId}/download`);
      if (!res.ok) {
        throw new Error('Failed to generate download URL');
      }
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-10">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Resources</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
            Medical Education Library
          </p>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto">
            Access our comprehensive collection of medical textbooks and resources.
          </p>
        </div>
        
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
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
        ) : filteredBooks.length === 0 ? (
          <div className="text-center text-muted-foreground">No resources found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="truncate">{book.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(parseInt(book.size))}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
