
import { google } from 'googleapis';

// Service account credentials from environment variables
const serviceAccountKey = {
  "type": "service_account",
  "project_id": process.env.GOOGLE_PROJECT_ID || "docdotwp",
  "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID || "4046a45c87a0fe209e9f4eab3ac0be46033e5370",
  "private_key": (process.env.GOOGLE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMkr7pjJELVd7N\nAve7+4Xxf5Mfj4vHPuQhc5QLsr98clF1MgqNfQ51UcXifnPIsGbFtZ0WRvqrsQ8a\nApO5vN9aCfw5cntVaeUCAShAVKmbm4bNU2Mxx/S++iyVte+kBuY5oyFfZz72hkja\nQMdzWTHrA/i0vhaGHmQueb/NIMQhY1svcdgFqZb452CSiDW+nsdm0G6Y4URzbeOk\neJQtnCdVrCUEvIWFeNsDxE/E0bqDGCRFiBTawDSnj2Ym8xDoRFIoPdhpfDErKnRm\nZnOb4OZklDW/+PNH7rVRnYB5tgA6ELR+sbDDU2RVH56bWsv8uQ+zz3fCmijxWtAP\nv1fkSNldAgMBAAECggEAAIQr5Sz/1+muKt6wcpIBvLrCqWJSJNtECE1XU3oFpAoI\nzXuWzrHF+6xvqYGP+Uu8LbN4F+TpO9zt3PkLm6JYr5QG0bwVbJu3YZpW8XeJ4CjD\nQr7nF1MVHWP+L3m9q8t5yxZxVV4aGqB2X9nFWt8M5bE0PbS8QvN6C+L/9rYxTlbP\nv1F6I+Jg3fKzOYpCDYR5Rn4VXeL8Yj5q9wKBgQD6JQqnLfYr5aZ6bT7vQrO5PJcE\nvN2WbF4d8C+Y9r3kJ8nJ3vM4a5M6xJz3zO1a9UZ5t4dR6M8G5N9nJQpV+3DkE9vL\nfO1Y5LdYgKBgQDRpJwYz8bQN9O4nL2C6dV8pZ4JQ6mT5eR7Z1dU9L4fWvR9VJ2K\n0rJ8bJ1eL6qO4cF9nDpS3ZsQ5Y2jJ8tV6N4C+8wKBgQDTp9e3WdF4nL6G7Y8oQ9z\nlA2mV5pB1vRu9I5dV7KfJ0Q2P8Q3G1eJ6rO4cF9nDpS3ZsQ5Y2jJ8tV6N4C+8w==\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n'),
  "client_email": process.env.GOOGLE_CLIENT_EMAIL || "docdot-drive-access@docdotwp.iam.gserviceaccount.com",
  "client_id": process.env.GOOGLE_CLIENT_ID || "110700333561911859060",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/docdot-drive-access%40docdotwp.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountKey,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

// Extract folder ID from the shared link
const FOLDER_ID = '1C3IdOlXofYJcUXuVRD8FHsLcPBjSTlEj';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export async function getFilesFromFolder(): Promise<DriveFile[]> {
  try {
    console.log('🔍 Fetching files from Google Drive folder:', FOLDER_ID);
    
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink)',
      orderBy: 'name',
    });

    const files = response.data.files?.map((file: any) => ({
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      size: file.size,
      modifiedTime: file.modifiedTime || '',
      webViewLink: file.webViewLink || '',
      webContentLink: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
    })) || [];

    console.log(`📚 Found ${files.length} files in Google Drive folder`);
    if (files.length > 0) {
      console.log('📖 Sample files:', files.slice(0, 3).map(f => f.name));
    }
    
    return files;
  } catch (error: any) {
    console.error('❌ Error fetching files from Google Drive:', error);
    if (error.code === 404) {
      console.error('🚨 Folder not found or no access. Please check:');
      console.error('1. Folder ID is correct:', FOLDER_ID);
      console.error('2. Folder is shared with service account:', serviceAccountKey.client_email);
      console.error('3. Or folder is publicly accessible');
    }
    throw error;
  }
}

export async function getFileContent(fileId: string): Promise<any> {
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
}

export async function checkFolderAccess(): Promise<boolean> {
  try {
    await drive.files.get({
      fileId: FOLDER_ID,
      fields: 'id, name',
    });
    return true;
  } catch (error) {
    console.error('Error accessing folder:', error);
    return false;
  }
}

export async function getMedicalBooks() {
  try {
    console.log('Fetching medical books from Google Drive...');

    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and (mimeType='application/pdf' or mimeType='application/vnd.google-apps.document' or mimeType='application/msword' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document') and trashed = false`,
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
