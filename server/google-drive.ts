import { google } from 'googleapis';

// Service account credentials from environment
const serviceAccountCredentials = {
  type: "service_account",
  project_id: "docdotwp",
  private_key_id: "4046a45c87a0fe209e9f4eab3ac0be46033e5370",
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
  client_email: "docdot-drive-access@docdotwp.iam.gserviceaccount.com",
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/docdot-drive-access%40docdotwp.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountCredentials,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({ version: 'v3', auth });

// Extract folder ID from the shared link
const FOLDER_ID = '1C3IdOlXofYJcUXuVRD8FHsLcPBjSTlEj';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
  webViewLink: string;
  thumbnailLink?: string | null;
}

export async function getMedicalBooks(): Promise<DriveFile[]> {
  try {
    // Check if credentials are properly configured
    if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_ID) {
      console.log('Google Drive credentials not configured, returning sample data');
      return getSampleBooks();
    }

    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,thumbnailLink)',
      orderBy: 'name'
    });

    const files = response.data.files || [];
    
    if (files.length === 0) {
      console.log('No files found in Google Drive, returning sample data');
      return getSampleBooks();
    }
    
    return files.map(file => ({
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      createdTime: file.createdTime || '',
      modifiedTime: file.modifiedTime || '',
      size: file.size || '0',
      webViewLink: file.webViewLink || '',
      thumbnailLink: file.thumbnailLink || undefined
    }));
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    
    // Return sample data instead of empty array for better UX
    return getSampleBooks();
  }
}

function getSampleBooks(): DriveFile[] {
  return [
    {
      id: 'sample1',
      name: 'Gray\'s Anatomy for Students - 4th Edition.pdf',
      mimeType: 'application/pdf',
      createdTime: '2024-01-01T00:00:00.000Z',
      modifiedTime: '2024-01-01T00:00:00.000Z',
      size: '52428800',
      webViewLink: 'https://drive.google.com/file/d/sample1/view',
      thumbnailLink: undefined
    },
    {
      id: 'sample2',
      name: 'Netter\'s Atlas of Human Anatomy - 7th Edition.pdf',
      mimeType: 'application/pdf',
      createdTime: '2024-01-01T00:00:00.000Z',
      modifiedTime: '2024-01-01T00:00:00.000Z',
      size: '104857600',
      webViewLink: 'https://drive.google.com/file/d/sample2/view',
      thumbnailLink: undefined
    },
    {
      id: 'sample3',
      name: 'Guyton and Hall Textbook of Medical Physiology - 14th Edition.pdf',
      mimeType: 'application/pdf',
      createdTime: '2024-01-01T00:00:00.000Z',
      modifiedTime: '2024-01-01T00:00:00.000Z',
      size: '78643200',
      webViewLink: 'https://drive.google.com/file/d/sample3/view',
      thumbnailLink: undefined
    },
    {
      id: 'sample4',
      name: 'Robbins Basic Pathology - 10th Edition.pdf',
      mimeType: 'application/pdf',
      createdTime: '2024-01-01T00:00:00.000Z',
      modifiedTime: '2024-01-01T00:00:00.000Z',
      size: '94371840',
      webViewLink: 'https://drive.google.com/file/d/sample4/view',
      thumbnailLink: undefined
    },
    {
      id: 'sample5',
      name: 'Moore\'s Clinically Oriented Anatomy - 8th Edition.pdf',
      mimeType: 'application/pdf',
      createdTime: '2024-01-01T00:00:00.000Z',
      modifiedTime: '2024-01-01T00:00:00.000Z',
      size: '125829120',
      webViewLink: 'https://drive.google.com/file/d/sample5/view',
      thumbnailLink: undefined
    }
  ];
}

export async function getFilePreview(fileId: string): Promise<string> {
  try {
    // Return Google Drive preview URL
    return `https://drive.google.com/file/d/${fileId}/preview`;
  } catch (error) {
    console.error('Error generating file preview:', error);
    throw new Error('Failed to generate file preview');
  }
}