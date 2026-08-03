import { useState, useEffect } from 'react';
import { localDB } from '../db/localDB';
import { googleDriveService } from '../services/googleDrive';
import type { DriveConfig } from '../types';
import { 
  Folder, File, FileText, FileImage, ExternalLink, 
  ArrowLeft, RefreshCw, FolderOpen, ShieldAlert, Cloud
} from 'lucide-react';

interface DriveLibraryProps {
  onSwitchTab?: (tab: 'diary' | 'mythology' | 'library' | 'sync' | 'drive-library') => void;
}

interface FolderBreadcrumb {
  id: string;
  name: string;
}

export const DriveLibrary: React.FC<DriveLibraryProps> = ({ onSwitchTab }) => {
  const ROOT_FOLDER_ID = '130GwmgUF6AO6gEn4XxBsO1BBEWn4sv-g';
  
  const [config, setConfig] = useState<DriveConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderBreadcrumb[]>([
    { id: ROOT_FOLDER_ID, name: 'Biblioteca Principal' }
  ]);
  const [currentFolderId, setCurrentFolderId] = useState(ROOT_FOLDER_ID);

  // Load Google Drive Config from IndexedDB
  useEffect(() => {
    async function loadConfig() {
      const cfg = await localDB.getConfig<DriveConfig>('drive_config');
      if (cfg) {
        setConfig(cfg);
      }
    }
    loadConfig();
  }, []);

  // Fetch files when folder or config changes
  useEffect(() => {
    if (config?.isAuthenticated && config?.accessToken) {
      fetchFiles(currentFolderId);
    }
  }, [config, currentFolderId]);

  const fetchFiles = async (folderId: string) => {
    if (!config?.accessToken) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const fileList = await googleDriveService.listFilesInFolder(folderId, config.accessToken);
      setFiles(fileList);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao carregar arquivos do Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder: any) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    setCurrentFolderId(target.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const handleGoBack = () => {
    if (breadcrumbs.length > 1) {
      handleBreadcrumbClick(breadcrumbs.length - 2);
    }
  };

  const formatBytes = (bytes: number | string, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Number(bytes)) / Math.log(k));
    return parseFloat((Number(bytes) / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="text-amber-500 fill-amber-500/20" size={24} />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="text-red-400" size={24} />;
    }
    if (mimeType.includes('image')) {
      return <FileImage className="text-teal-400" size={24} />;
    }
    return <File className="text-slate-400" size={24} />;
  };

  // If not logged in, show login prompt
  if (!config || !config.isAuthenticated) {
    return (
      <div className="card glass-card border-purple-muted p-6 text-center max-w-xl mx-auto my-12 flex flex-column items-center gap-4 animate-all">
        <FolderOpen size={48} className="icon-purple mb-2 animate-pulse" />
        <h3 className="text-xl font-bold">Biblioteca do Google Drive</h3>
        <p className="text-muted text-sm max-w-md">
          Para acessar a biblioteca de materiais de apoio e livros compartilhados no seu Google Drive, 
          você precisa primeiro conectar sua conta na aba de sincronização.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-3 flex items-center gap-2"
          onClick={() => onSwitchTab && onSwitchTab('sync')}
        >
          <Cloud size={16} />
          Conectar Google Drive
        </button>
      </div>
    );
  }

  const isExpiredError = errorMsg && (
    errorMsg.toLowerCase().includes('credential') || 
    errorMsg.toLowerCase().includes('token') || 
    errorMsg.toLowerCase().includes('401') ||
    errorMsg.toLowerCase().includes('unauthorized') ||
    errorMsg.toLowerCase().includes('auth') ||
    errorMsg.toLowerCase().includes('expire')
  );

  return (
    <div className="drive-library-container flex flex-column gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca do Google Drive</h2>
          <p className="text-muted text-sm mt-1">
            Navegue pelos livros, histórias e materiais pedagógicos hospedados na nuvem.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm flex items-center gap-1"
          onClick={() => fetchFiles(currentFolderId)}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 bg-dark-trans p-3 rounded text-xs border border-purple-muted flex-wrap">
        {breadcrumbs.length > 1 && (
          <button
            type="button"
            className="btn-icon btn-icon-muted p-1 mr-1"
            onClick={handleGoBack}
            title="Voltar pasta"
          >
            <ArrowLeft size={14} />
          </button>
        )}
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.id} className="flex items-center gap-2">
            {idx > 0 && <span className="text-muted">/</span>}
            <span
              className={`cursor-pointer transition-all ${
                idx === breadcrumbs.length - 1 
                  ? 'font-bold text-light' 
                  : 'text-purple-light hover:underline'
              }`}
              onClick={() => handleBreadcrumbClick(idx)}
            >
              {crumb.name}
            </span>
          </span>
        ))}
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="status-alert error flex flex-column gap-2 items-start">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span className="font-semibold text-sm">Falha na Conexão</span>
          </div>
          <p className="text-xs text-muted">{errorMsg}</p>
          {isExpiredError && (
            <button
              type="button"
              className="btn btn-primary btn-sm mt-1"
              onClick={() => onSwitchTab && onSwitchTab('sync')}
            >
              Ir para Sincronização para Reconectar
            </button>
          )}
        </div>
      )}

      {/* File Explorer list */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="animate-spin icon-purple" size={32} />
        </div>
      ) : (
        <div className="card glass-card border-purple-muted">
          <div className="card-body p-0">
            {files.length === 0 && !errorMsg ? (
              <div className="text-center py-16 text-muted text-sm">
                Nenhum arquivo ou subpasta encontrado neste diretório.
              </div>
            ) : (
              <div className="flex flex-column divide-y divider-purple-muted">
                {files.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  return (
                    <div 
                      key={file.id} 
                      className={`flex items-center justify-between p-3.5 hover:bg-purple-trans/10 transition-all ${
                        isFolder ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => isFolder && handleFolderClick(file)}
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        {getFileIcon(file.mimeType)}
                        <div className="flex flex-column overflow-hidden">
                          <span className="font-semibold text-sm text-light truncate max-w-lg">
                            {file.name}
                          </span>
                          <span className="text-xxs text-muted mt-0.5">
                            {isFolder ? 'Pasta' : formatBytes(file.size)} • Criado em {new Date(file.createdTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {!isFolder && file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm flex items-center gap-1.5 py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visualizar
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveLibrary;
