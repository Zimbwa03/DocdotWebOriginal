import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Download, ExternalLink } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}

interface GoogleDriveResourcesGridProps {
  searchQuery: string;
}

export default function GoogleDriveResourcesGrid({ searchQuery }: GoogleDriveResourcesGridProps) {
  const { data: books, isLoading } = useQuery({
    queryKey: ['google-drive-files'],
    queryFn: async () => {
      const res = await fetch('/api/google-drive/files');
      if (!res.ok) {
        throw new Error('Failed to fetch files');
      }
      return res.json() as Promise<DriveFile[]>;
    }
  });

  const filteredBooks = books?.filter(book => 
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDownload = async (fileId: string) => {
    try {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
            <CardFooter>
              <div className="h-8 bg-gray-200 rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredBooks.map((book) => (
        <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="truncate text-lg">{book.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Size: {formatFileSize(parseInt(book.size || '0'))}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last modified: {new Date(book.modifiedTime).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://drive.google.com/file/d/${book.id}/preview`, '_blank')}
              className="flex-1"
            >
              <Book className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button 
              size="sm"
              onClick={() => handleDownload(book.id)}
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Button>
          </CardFooter>
        </Card>
      ))}
      {filteredBooks.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-12">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No books found
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms' : 'Connect your Google Drive to access your medical books'}
          </p>
        </div>
      )}
    </div>
  );
}