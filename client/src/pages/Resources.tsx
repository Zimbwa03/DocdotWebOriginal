import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Book, ExternalLink, Eye } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
  webViewLink: string;
  thumbnailLink?: string;
}

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: books, isLoading, error } = useQuery({
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

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="py-12 bg-white dark:bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-10">
          <h2 className="text-base text-secondary-600 dark:text-secondary-400 font-semibold tracking-wide uppercase">Resources</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Medical Books & Resources
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            Access comprehensive medical textbooks and reference materials from authoritative sources.
          </p>
        </div>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="journals">Journals</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search medical books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading medical books...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">Failed to load books. Please check your connection.</p>
              </div>
            )}

            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-2">
                        <Book className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm font-medium line-clamp-2">{book.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Type: {book.mimeType.includes('pdf') ? 'PDF' : 'Document'}</p>
                        <p>Size: {formatFileSize(parseInt(book.size) || 0)}</p>
                        <p>Modified: {new Date(book.modifiedTime).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="space-x-2">
                      <Button 
                        onClick={() => handlePreview(book.id)}
                        className="flex-1"
                        variant="default"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        onClick={() => window.open(book.webViewLink, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && !error && filteredBooks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No books found matching your search.' : 'No books available.'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="journals" className="space-y-6">
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Medical Journals</h3>
              <p className="text-gray-600 dark:text-gray-400">Access to latest medical research and publications coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-6">
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Clinical Guidelines</h3>
              <p className="text-gray-600 dark:text-gray-400">Evidence-based clinical practice guidelines coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Educational Media</h3>
              <p className="text-gray-600 dark:text-gray-400">Medical videos, animations, and interactive content coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}