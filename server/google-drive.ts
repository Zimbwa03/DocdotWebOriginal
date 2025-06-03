import { google } from 'googleapis';

const credentials = {
  type: "service_account",
  project_id: "docdotwp",
  private_key_id: "4046a45c87a0fe209e9f4eab3ac0be46033e5370",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMkr7pjJELVd7N\nAve7+4Xxf5Mfj4vHPuQhc5QLsr98clF1MgqNfQ51UcXifnPIsGbFtZ0WRvqrsQ8a\nApO5vN9aCfw5cntVaeUCAShAVKmbm4bNU2Mxx/S++iyVte+kBuY5oyFfZz72hkja\nQMdzWTHrA/i0vhaGHmQueb/NIMQhY1svcdgFqZb452CSiDW+nsdm0G6Y4URzbeOk\neJQtnCdVrCUEvIWFeNsDxE/E0bqDGCRFiBTawDSnj2Ym8xDoRFIoPdhpfDErKnRm\nZnOb4OZklDW/+PNH7rVRnYB5tgA6ELR+sbDDU2RVH56bWsv8uQ+zz3fCmijxWtAP\nv1fkSNldAgMBAAECggEAAIQr5Sz/1+muKt6wcpIBvLuxffZMlQK/0qT9bg+6bTCT\n3toMesTvbc5e066CaxkLrI4QlaDPB/Kypg8oAXz/ioIIV+2So0/ygWnKImqhFVp0\nIaQg1cK6bgAo1dixGfBGhN8eudeDdvdpy0GeMnIg+4XcCwciL9Gqndw2AE+H2/zo\nc0aFIwAyttV//XjYKXabrZEdWp9p8N/W8Y+NcPndx/TI4kRx1/GGOnw5knVYQvwp\n4l0nhC+56AlQDvqUVvZPlrjFlFJcZ1IV1VBiwWNZVC4IcQ8xjC93S4G36rOOK9CG\nsehWpUV4paWH2EhT+bZUZ5bUkm2uBUEij9MqMy5AYQKBgQDnZSriLEq1KqBeRbky\nP/ZghrABlrTP+2qdnYxrq25aI4QKWG9AIALSlvAdZlAvZfMKhGhw6GBHVut/ZCDL\nXg9oGklPAm/gpcdaVYtl//wXBcdDKoQZfTrOO/C89LdS2nslOVgVmg3cgslf/2Lf\n8EBKX2NzmjF9KbzR/odoU/fTiQKBgQDiU3RyGisCQlZzBT+jXeQ8gWo4yoEE5LIk\nmENy6WcimPsoNnkOUHYTjd5SvklUH0XOVfVqxWx5mapBUXdjqCet82UOrMovlQln\nJUG3mASDVKT7av5IBmzkCAiqGwQjDMh3YhYyNSnMDOB5GCQZLlwccIl73RuEQkTQ\n70f+gbAeNQKBgF76M4PqUi/Sc0i+ralmf6ZXIl9EkKrds4FGbaC0GPN+qG/mpKNZ\ngE8YDS7EFB2gZwXmG0hc2Ufu8XK0kpFm5kQAph58DZfT8+OsQS94xuxcPtHe3aHo\nuP51s/abK7QiYXGB/BnBxfbA6A8zME5iusDMLnIA1FdfjlVTeBjmfk6hAoGAcQew\nzhNXi2dJ+WOTpqkLhVQ0kmxABwuYFEKe3NLIGTVBqZGa35U7gwSFFdnGkWaU3Dl9\nuXcjd49QwhJHh9PBDVTTEYMl7qGF8qderKwVBOnPA2kp2RqsYy3H9fxMEp0duNGZ\nuDVozGlZ6eAulwzaH7HsV5nTVjgqWhZGZEqshEkCgYEAnj9m3YPdjfvpuQ8hb0vf\nfPoqqaeS+3R246rlVfxwB0S5y6wcG+s+zhUwf8aFhcHJUFi9ixVmZaB97/5XmnU4\nn+0M0pHkuzFRA62RZT35eV8N7b39Hjj3KDoCiFQzgPEiyiYO04tsgUuQCYSJg8Ex\nckuR+CUvBuLVzsswyph3xiM=\n-----END PRIVATE KEY-----\n",
  client_email: "docdot-drive-access@docdotwp.iam.gserviceaccount.com",
  client_id: "110700333561911859060",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/docdot-drive-access%40docdotwp.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({ version: 'v3', auth });

export async function listFiles() {
  try {
    console.log('Fetching files from Google Drive...');

    const response = await drive.files.list({
      q: "mimeType='application/pdf' or mimeType='application/vnd.google-apps.document' or mimeType='application/msword' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, thumbnailLink)',
      pageSize: 100,
      orderBy: 'modifiedTime desc'
    });

    console.log(`Found ${response.data.files?.length || 0} files`);
    return response.data.files || [];
  } catch (error) {
    console.error('Error fetching files from Google Drive:', error);
    throw new Error('Failed to fetch files from Google Drive');
  }
}

export async function getFilePreviewUrl(fileId: string) {
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