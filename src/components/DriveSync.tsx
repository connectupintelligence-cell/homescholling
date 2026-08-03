import { useState, useEffect } from 'react';
import { localDB } from '../db/localDB';
import { googleDriveService } from '../services/googleDrive';
import type { DriveConfig } from '../types';
import { Cloud, CloudOff, RefreshCw, Download, Upload, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DriveSyncProps {
  onSyncComplete?: () => void;
}

export const DriveSync: React.FC<DriveSyncProps> = ({ onSyncComplete }) => {
  const [config, setConfig] = useState<DriveConfig>({
    clientId: '',
    apiKey: '',
    folderId: '',
    accessToken: '',
    refreshToken: '',
    isAuthenticated: false,
    lastSync: null
  });

  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const stored = await localDB.getConfig<DriveConfig>('drive_config');
      if (stored) {
        setConfig(stored);
      }
    }
    loadConfig();
  }, []);

  const handleConfigChange = (key: keyof DriveConfig, val: any) => {
    const updated = { ...config, [key]: val };
    setConfig(updated);
    localDB.saveConfig('drive_config', updated);
  };

  const handleConnect = async () => {
    if (!config.clientId) {
      alert('Por favor, insira o seu Client ID do Google Cloud Console.');
      return;
    }
    try {
      setSyncing(true);
      setStatusMsg('Conectando ao Google Drive...');
      const token = await googleDriveService.authenticate(config.clientId);
      
      const updated: DriveConfig = {
        ...config,
        accessToken: token,
        isAuthenticated: true,
        lastSync: new Date().toLocaleString()
      };
      
      // Extrair ID da pasta se o usuário colou o link completo
      const extractFolderId = (input: string): string => {
        if (!input) return '';
        const match = input.match(/\/folders\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : input.trim();
      };

      // Try to find or create the root folder
      setStatusMsg('Verificando pasta de destino...');
      let folderId = extractFolderId(config.folderId);
      if (!folderId) {
        folderId = await googleDriveService.findFolder('Homeschooling_Agenda', token) || '';
        if (!folderId) {
          folderId = await googleDriveService.createFolder('Homeschooling_Agenda', token);
        }
      }
      updated.folderId = folderId;

      setConfig(updated);
      await localDB.saveConfig('drive_config', updated);
      
      setSyncStatus('success');
      setStatusMsg('Google Drive conectado e pasta configurada com sucesso!');
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMsg(`Erro de conexão: ${err.message || JSON.stringify(err)}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    const updated: DriveConfig = {
      ...config,
      accessToken: '',
      isAuthenticated: false
    };
    setConfig(updated);
    await localDB.saveConfig('drive_config', updated);
    setSyncStatus('idle');
    setStatusMsg('Desconectado do Google Drive.');
  };

  const handleReauthenticate = async () => {
    if (!config.clientId) {
      alert('Por favor, insira o seu Client ID do Google Cloud Console nas configurações.');
      setShowConfig(true);
      return;
    }
    try {
      setSyncing(true);
      setSyncStatus('idle');
      setStatusMsg('Renovando conexão com o Google Drive...');
      const token = await googleDriveService.authenticate(config.clientId);
      
      const updated: DriveConfig = {
        ...config,
        accessToken: token,
        isAuthenticated: true,
        lastSync: new Date().toLocaleString()
      };
      
      setConfig(updated);
      await localDB.saveConfig('drive_config', updated);
      
      // Reiniciar sincronização com o novo token
      setStatusMsg('Conexão renovada! Iniciando sincronização...');
      const allPlannings = await localDB.getAllPlannings();
      if (allPlannings.length === 0) {
        setStatusMsg('Nenhum dado local encontrado para sincronizar.');
        return;
      }

      let count = 0;
      for (const plan of allPlannings) {
        count++;
        setStatusMsg(`Sincronizando dia ${count} de ${allPlannings.length}...`);
        await googleDriveService.syncDayToDrive(plan, token, config.folderId);
      }

      updated.lastSync = new Date().toLocaleString();
      setConfig(updated);
      await localDB.saveConfig('drive_config', updated);
      
      setSyncStatus('success');
      setStatusMsg(`Sincronização concluída! ${allPlannings.length} dias salvos no Google Drive.`);
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMsg(`Erro ao renovar conexão: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSyncing(false);
    }
  };

  // Full backup synchronisation (uploads all planning records to Drive)
  const handleFullSync = async () => {
    if (!config.isAuthenticated || !config.accessToken) {
      alert('Por favor, conecte ao Google Drive primeiro.');
      return;
    }

    try {
      setSyncing(true);
      setSyncStatus('idle');
      setStatusMsg('Carregando dados locais...');
      const allPlannings = await localDB.getAllPlannings();
      
      if (allPlannings.length === 0) {
        setStatusMsg('Nenhum dado local encontrado para sincronizar.');
        return;
      }

      setStatusMsg(`Sincronizando ${allPlannings.length} dias. Isso pode levar alguns instantes...`);
      
      let count = 0;
      for (const plan of allPlannings) {
        count++;
        setStatusMsg(`Sincronizando dia ${count} de ${allPlannings.length}...`);
        await googleDriveService.syncDayToDrive(plan, config.accessToken, config.folderId);
      }

      const updated = {
        ...config,
        lastSync: new Date().toLocaleString()
      };
      setConfig(updated);
      await localDB.saveConfig('drive_config', updated);
      
      setSyncStatus('success');
      setStatusMsg(`Sincronização concluída! ${allPlannings.length} dias salvos no Google Drive.`);
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMsg(`Erro durante a sincronização: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSyncing(false);
    }
  };

  // Offline / Local File Backup
  const handleLocalExport = async () => {
    try {
      const plannings = await localDB.getAllPlannings();
      const db = (localDB as any).db as IDBDatabase;
      if (db) {
        const trans = db.transaction('mythology', 'readonly');
        const store = trans.objectStore('mythology');
        const req = store.getAll();
        req.onsuccess = () => {
          googleDriveService.exportBackup(plannings, req.result || []);
        };
      } else {
        googleDriveService.exportBackup(plannings, []);
      }
    } catch (err) {
      alert('Erro ao exportar backup local.');
    }
  };

  // Offline / Local File Restore
  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    googleDriveService.importBackup(file).then(async (data) => {
      if (confirm(`Deseja restaurar o backup? Isso importará ${data.plannings.length} registros diários.`)) {
        // Save plannings
        for (const plan of data.plannings) {
          await localDB.savePlanning(plan);
        }
        // Save mythology
        for (const myth of data.mythology) {
          await localDB.saveWeeklyMythology(myth);
        }
        alert('Backup importado com sucesso! Atualize a página se necessário.');
        if (onSyncComplete) onSyncComplete();
      }
    }).catch(err => {
      alert(`Erro ao carregar arquivo de backup: ${err.message}`);
    });
  };

  return (
    <div className="card glass-card drive-sync-panel">
      <div className="card-header">
        <div className="card-title-icon">
          {config.isAuthenticated ? (
            <Cloud className="icon-success animate-pulse-slow" size={20} />
          ) : (
            <CloudOff className="icon-muted" size={20} />
          )}
          <h3>Sincronização e Backup</h3>
        </div>
        <span className={`badge ${config.isAuthenticated ? 'badge-success' : 'badge-muted'}`}>
          {config.isAuthenticated ? 'Conectado ao Drive' : 'Modo Offline (Local)'}
        </span>
      </div>

      <div className="card-body">
        <div className="drive-actions-row">
          <div className="drive-btn-group">
            {config.isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleFullSync}
                  disabled={syncing}
                >
                  <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                  Sincronizar Agora com o Drive
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDisconnect}
                  disabled={syncing}
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowConfig(!showConfig)}
              >
                Conectar ao Google Drive
              </button>
            )}
          </div>
          
          <div className="backup-btn-group">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLocalExport}
              title="Exportar arquivo JSON com todos os dados locais"
            >
              <Download size={14} />
              Exportar Backup JSON
            </button>
            
            <label className="btn btn-secondary btn-sm cursor-pointer" title="Importar arquivo JSON de backup">
              <Upload size={14} />
              Importar Backup JSON
              <input
                type="file"
                accept=".json"
                onChange={handleLocalImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {statusMsg && (() => {
          const isAuthError = syncStatus === 'error' && statusMsg && (
            statusMsg.toLowerCase().includes('credential') || 
            statusMsg.toLowerCase().includes('token') || 
            statusMsg.toLowerCase().includes('401') ||
            statusMsg.toLowerCase().includes('unauthorized') ||
            statusMsg.toLowerCase().includes('auth') ||
            statusMsg.toLowerCase().includes('expire')
          );

          return (
            <div className={`status-alert ${syncStatus === 'success' ? 'success' : syncStatus === 'error' ? 'error' : 'info'}`}>
              {syncStatus === 'success' && <CheckCircle2 size={16} />}
              {syncStatus === 'error' && <ShieldAlert size={16} />}
              <div className="flex flex-column gap-2 w-full">
                <span className="status-text">{statusMsg}</span>
                {isAuthError && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-1"
                    onClick={handleReauthenticate}
                    disabled={syncing}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {syncing ? 'Renovando...' : 'Reconectar ao Google Drive'}
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {config.lastSync && (
          <p className="text-xs text-muted mt-2">
            Última sincronização/conexão: {config.lastSync}
          </p>
        )}

        {showConfig && !config.isAuthenticated && (
          <div className="drive-config-form card-inner mt-4 p-4 border rounded">
            <h4 className="text-sm font-semibold mb-3">Configurações do Google Cloud API:</h4>
            
            <div className="form-group mb-3">
              <label className="form-label text-xs">ID do Cliente (Client ID OAuth2):</label>
              <input
                type="text"
                className="form-input text-sm"
                value={config.clientId}
                onChange={(e) => handleConfigChange('clientId', e.target.value)}
                placeholder="Ex: xxxxxxx-xxxxxxx.apps.googleusercontent.com"
              />
              <p className="text-xxs text-muted mt-1">
                Obtenha o Client ID criando uma credencial OAuth 2.0 no Google Cloud Console com o escopo do Google Drive.
              </p>
            </div>

            <div className="form-group mb-3">
              <label className="form-label text-xs">Link ou ID da Pasta do Google Drive (Opcional):</label>
              <input
                type="text"
                className="form-input text-sm"
                value={config.folderId}
                onChange={(e) => handleConfigChange('folderId', e.target.value)}
                placeholder="Ex: Cole o link completo da pasta ou o ID do Drive"
              />
              <p className="text-xxs text-muted mt-1">
                Cole o link da pasta do Drive que você deseja usar. Deixe em branco para criar uma pasta padrão automática ("Homeschooling_Agenda").
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm w-full"
              onClick={handleConnect}
              disabled={syncing}
            >
              {syncing ? 'Conectando...' : 'Autenticar com o Google'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default DriveSync;
