import { useState, useEffect } from 'react';
import { localDB } from './db/localDB';
import Calendar from './components/Calendar';
import DailyPlanner from './components/DailyPlanner';
import MythologyManager from './components/MythologyManager';
import ReadingLibrary from './components/ReadingLibrary';
import DriveSync from './components/DriveSync';
import { Sun, Calendar as CalendarIcon, BookOpen, BookMarked, Cloud } from 'lucide-react';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('2026-07-06'); // Initial date based on current metadata
  const [activeTab, setActiveTab] = useState<'diary' | 'mythology' | 'library' | 'sync'>('diary');
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize DB
  useEffect(() => {
    async function init() {
      try {
        await localDB.init();
        setDbReady(true);
      } catch (err) {
        console.error('Failed to init IndexedDB', err);
      }
    }
    init();
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectBook = (title: string) => {
    setSelectedBookTitle(title);
    // Switch back to diary where the book title will be applied to the current selected day
    setActiveTab('diary');
    triggerRefresh();
  };

  if (!dbReady) {
    return (
      <div className="flex flex-column justify-center items-center h-full w-full py-40">
        <Sun className="icon-gold animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Carregando Banco de Dados...</h2>
        <p className="text-muted text-xs mt-2">Preparando persistência do IndexedDB local</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <h1>
            <Sun className="icon-gold" size={28} />
            Agenda Waldorf
          </h1>
          <p>Homeschooling - 3º Ano Waldorf & Planejamento de Épocas</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <CalendarIcon size={16} />
            Diário de Aula
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'mythology' ? 'active' : ''}`}
            onClick={() => setActiveTab('mythology')}
          >
            <BookOpen size={16} />
            Mitologia Hebraica
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <BookMarked size={16} />
            Leituras do Rubicão
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'sync' ? 'active' : ''}`}
            onClick={() => setActiveTab('sync')}
          >
            <Cloud size={16} />
            Sincronização / Backup
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="app-main-content">
        {activeTab === 'diary' && (
          <div className="dashboard-grid">
            {/* Left Column: Calendar */}
            <div className="flex flex-column gap-6">
              <Calendar 
                selectedDateStr={selectedDateStr} 
                onSelectDate={(date) => {
                  setSelectedDateStr(date);
                  // Clear single selection book state to not overwrite other days unexpectedly
                  setSelectedBookTitle(''); 
                }} 
              />
            </div>
            
            {/* Right Column: Planner */}
            <div className="planner-detail-container">
              <DailyPlanner 
                dateStr={selectedDateStr}
                onSelectBookDrawer={() => setActiveTab('library')}
                selectedBookTitle={selectedBookTitle}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        )}

        {activeTab === 'mythology' && (
          <MythologyManager 
            currentDateStr={selectedDateStr}
            onMythologyUpdated={triggerRefresh}
          />
        )}

        {activeTab === 'library' && (
          <ReadingLibrary 
            onSelectBook={handleSelectBook}
            selectedBookTitle={selectedBookTitle}
          />
        )}

        {activeTab === 'sync' && (
          <DriveSync 
            onSyncComplete={triggerRefresh}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-muted text-xs border-t">
        <p>Desenvolvido para organização e acompanhamento de aulas de homeschooling. 3º Ano - Pedagogia Waldorf.</p>
        <p className="mt-1">Persistência segura em IndexedDB local e backup no Google Drive.</p>
      </footer>
    </div>
  );
}

export default App;
