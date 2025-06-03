import { google } from 'googleapis';

// Service account credentials from environment
const serviceAccountCredentials = {
  type: "service_account",
  project_id: "docdotwp",
  private_key_id: "4046a45c87a0fe209e9f4eab3ac0be46033e5370",
  private_key: process.env.GOOGLE_PRIVATE_KEY || "",
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
      console.error('Google Drive credentials not configured');
      return [];
    }

    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,thumbnailLink)',
      orderBy: 'name'
    });

    const files = response.data.files || [];
    
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
    
    // Return empty array instead of throwing error to prevent 500 status
    return [];
  }
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