import type { DailyPlanning, WeeklyMythology } from '../types';

export class GoogleDriveService {
  // Local Backup trigger
  exportBackup(plannings: DailyPlanning[], mythology: WeeklyMythology[]): void {
    const dataObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      plannings,
      mythology
    };
    
    const dataStr = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `homeschool-agenda-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import Backup helper
  importBackup(file: File): Promise<{ plannings: DailyPlanning[]; mythology: WeeklyMythology[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed && Array.isArray(parsed.plannings)) {
            resolve({
              plannings: parsed.plannings,
              mythology: parsed.mythology || []
            });
          } else {
            reject(new Error('Formato de arquivo inválido'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // --- Real Google Drive Upload Logic using direct REST API calls ---
  
  // Initiates token client request (Google Identity Services)
  async authenticate(clientId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject('No window context');
      
      // Load Google Identity Services script if not present
      if (!document.getElementById('google-gsi-client')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => this.initTokenClient(clientId, resolve, reject);
        script.onerror = () => reject('Failed to load Google GSI script');
        document.head.appendChild(script);
      } else {
        this.initTokenClient(clientId, resolve, reject);
      }
    });
  }

  private initTokenClient(clientId: string, resolve: (token: string) => void, reject: (err: any) => void) {
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.error) {
            reject(response);
          } else {
            resolve(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  }

  // List files in a Google Drive folder
  async listFilesInFolder(folderId: string, accessToken: string): Promise<any[]> {
    const query = `'${folderId}' in parents and trashed = false`;
    const fields = 'files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=name`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Error listing files');
    }

    const data = await res.json();
    return data.files || [];
  }

  // Create folder inside Google Drive
  async createFolder(folderName: string, accessToken: string, parentId?: string): Promise<string> {
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Error creating folder');
    }

    const data = await res.json();
    return data.id;
  }

  // Find folder by name or return null
  async findFolder(folderName: string, accessToken: string, parentId?: string): Promise<string | null> {
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }

  // Upload file (JSON content or base64 converted to binary blob)
  async uploadFile(
    fileName: string,
    mimeType: string,
    content: Blob | string,
    accessToken: string,
    parentId: string
  ): Promise<string> {
    const metadata = {
      name: fileName,
      parents: [parentId],
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );

    const fileContent = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
    form.append('file', fileContent);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Error uploading file');
    }

    const data = await res.json();
    return data.id;
  }

  // Helper to convert base64 image string to binary Blob for Google Drive
  base64ToBlob(base64Str: string): Blob {
    const parts = base64Str.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }

  // Sync a single day's plan and its photos to Drive
  async syncDayToDrive(
    planning: DailyPlanning,
    accessToken: string,
    rootFolderId: string
  ): Promise<void> {
    // 1. Create a subfolder for the month/year if it doesn't exist
    // date is YYYY-MM-DD
    const [year, month, day] = planning.date.split('-');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthFolderName = `${month}-${monthNames[parseInt(month) - 1]}`;
    
    let yearFolderId = await this.findFolder(year, accessToken, rootFolderId);
    if (!yearFolderId) {
      yearFolderId = await this.createFolder(year, accessToken, rootFolderId);
    }

    let monthFolderId = await this.findFolder(monthFolderName, accessToken, yearFolderId);
    if (!monthFolderId) {
      monthFolderId = await this.createFolder(monthFolderName, accessToken, yearFolderId);
    }

    let dayFolderId = await this.findFolder(`Dia-${day}`, accessToken, monthFolderId);
    if (!dayFolderId) {
      dayFolderId = await this.createFolder(`Dia-${day}`, accessToken, monthFolderId);
    }

    // 2. Upload planning JSON details (omit binary photos to keep it light)
    const planningDetails = { ...planning, photos: {} };
    await this.uploadFile(
      'planejamento.json',
      'application/json',
      JSON.stringify(planningDetails, null, 2),
      accessToken,
      dayFolderId
    );

    // 3. Upload each photo
    const photoSections = Object.keys(planning.photos) as Array<keyof typeof planning.photos>;
    for (const section of photoSections) {
      const urls = planning.photos[section] || [];
      for (let idx = 0; idx < urls.length; idx++) {
        const photoUrl = urls[idx];
        if (photoUrl.startsWith('data:')) {
          const blob = this.base64ToBlob(photoUrl);
          const fileName = `${section}_${idx + 1}.jpg`;
          await this.uploadFile(
            fileName,
            blob.type,
            blob,
            accessToken,
            dayFolderId
          );
        }
      }
    }
  }
}

export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
