
import { google } from 'googleapis';

// Use environment variables for Google Drive service account
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID || "docdotwp",
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({ version: 'v3', auth });

export async function getMedicalBooks() {
  try {
    console.log('Fetching medical books from Google Drive...');

    const response = await drive.files.list({
      q: "mimeType='application/pdf' or mimeType='application/vnd.google-apps.document' or mimeType='application/msword' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, thumbnailLink)',
      pageSize: 100,
      orderBy: 'modifiedTime desc'
    });

    console.log(`Found ${response.data.files?.length || 0} medical books`);
    return response.data.files || [];
  } catch (error) {
    console.error('Error fetching medical books from Google Drive:', error);
    throw new Error('Failed to fetch medical books from Google Drive');
  }
}

export async function getFilePreview(fileId: string) {
  try {
    // For PDFs and documents, return Google Drive viewer URL
    return `https://drive.google.com/file/d/${fileId}/preview`;
  } catch (error) {
    console.error('Error getting preview URL:', error);
    throw new Error('Failed to get preview URL');
  }
}

export async function downloadFile(fileId: string) {
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    });

    return response.data;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
}

export async function getFileMetadata(fileId: string) {
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink'
    });

    return response.data;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
}

export async function checkFolderAccess() {
  try {
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)'
    });
    return response.data.files && response.data.files.length >= 0;
  } catch (error) {
    console.error('Error checking folder access:', error);
    return false;
  }
}
