import { useState, useEffect } from 'react';
import { localDB } from '../db/localDB';
import type { DailyPlanning } from '../types';
import { 
  getEpochByMonth, 
  getAfternoonActivity, 
  getExtraActivity, 
  getWeekNumberAndYear, 
  formatDatePortuguese, 
  WALDORF_VERSE 
} from '../utils/helpers';
import PhotoUploader from './PhotoUploader';
import { 
  BookOpen, Edit3, Image as ImageIcon, Flame, Sun, 
  CheckSquare, RefreshCw, 
  Sparkles, CheckCircle, ChevronDown, ChevronUp, BookOpenCheck
} from 'lucide-react';

interface DailyPlannerProps {
  dateStr: string;
  onSelectBookDrawer: () => void;
  selectedBookTitle?: string;
  refreshTrigger: number;
}

export const DailyPlanner: React.FC<DailyPlannerProps> = ({ 
  dateStr, 
  onSelectBookDrawer, 
  selectedBookTitle,
  refreshTrigger
}) => {
  const dateObj = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const month = dateObj.getMonth();
  const currentEpoch = getEpochByMonth(month);

  const [planning, setPlanning] = useState<DailyPlanning | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [showVerse, setShowVerse] = useState(true);

  // Load planning data
  useEffect(() => {
    async function loadPlanning() {
      
      // Load planning
      let plan = await localDB.getPlanning(dateStr);
      
      // If none exists, prepare defaults
      if (!plan) {
        // Find if there is a mythology text for this week/day
        const { weekId } = getWeekNumberAndYear(dateStr);
        const mythData = await localDB.getWeeklyMythology(weekId);
        
        let mythText = '';
        if (mythData) {
          // Monday is dayOfWeek 1, Sunday is 0, Sat is 6.
          // In datesForWeek, Seg=0, Ter=1, Qua=2, Qui=3, Sex=4
          const weekIdx = (dayOfWeek + 6) % 7; 
          if (weekIdx >= 0 && weekIdx < 5) {
            mythText = mythData.dailyParts[weekIdx] || '';
          }
        }

        plan = {
          date: dateStr,
          activeEpochId: currentEpoch.id,
          mythologyText: mythText,
          mythologyReflection: '',
          mythologyRead: false,
          cursiveLetter: '',
          epochExercise: '',
          drawingTheme: '',
          extraActivity: '',
          afternoonActivity: getAfternoonActivity(dayOfWeek),
          freePlay: true,
          bookReading: selectedBookTitle || '',
          photos: {}
        };
      }

      // If a book was selected in library drawer and planning has empty bookReading, apply it
      if (selectedBookTitle && !plan.bookReading) {
        plan.bookReading = selectedBookTitle;
      }

      setPlanning(plan);
      setSaveStatus('saved');
    }

    loadPlanning();
  }, [dateStr, refreshTrigger]);

  // Update planning when a book is selected from outer drawer
  useEffect(() => {
    if (selectedBookTitle && planning && planning.bookReading !== selectedBookTitle) {
      handleFieldChange('bookReading', selectedBookTitle);
    }
  }, [selectedBookTitle]);

  const handleFieldChange = async (field: keyof DailyPlanning, value: any) => {
    if (!planning) return;
    
    setSaveStatus('dirty');
    const updated = {
      ...planning,
      [field]: value
    };
    setPlanning(updated);

    // Auto-save logic
    setSaveStatus('saving');
    await localDB.savePlanning(updated);
    setSaveStatus('saved');
  };

  const handlePhotoChange = async (section: keyof DailyPlanning['photos'], urls: string[]) => {
    if (!planning) return;

    setSaveStatus('dirty');
    const updatedPhotos = {
      ...planning.photos,
      [section]: urls
    };
    
    const updated = {
      ...planning,
      photos: updatedPhotos
    };

    setPlanning(updated);
    setSaveStatus('saving');
    await localDB.savePlanning(updated);
    setSaveStatus('saved');
  };

  if (isWeekend) {
    return (
      <div className="card glass-card text-center py-12 px-6">
        <Sun className="icon-gold mx-auto mb-4 animate-pulse-slow" size={48} />
        <h2 className="text-2xl font-bold mb-2">Fim de Semana</h2>
        <p className="text-muted mb-4">{formatDatePortuguese(dateStr)}</p>
        <p className="max-w-md mx-auto text-sm">
          Aproveite o final de semana para descansar, vivenciar a natureza em família, fazer brincadeiras livres e leituras de histórias.
        </p>
      </div>
    );
  }

  if (!planning) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin icon-blue" size={32} />
      </div>
    );
  }

  const extraActivityName = getExtraActivity(dayOfWeek);

  return (
    <div className="daily-planner-component flex flex-col gap-6">
      {/* Planner Header */}
      <div className="planner-header flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">{formatDatePortuguese(dateStr)}</h2>
          <p className="text-muted text-sm mt-1">
            Época Ativa: <span className="font-semibold text-light">{currentEpoch.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="save-indicator badge-success flex items-center gap-1">
              <CheckCircle size={12} /> Salvo Localmente
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="save-indicator badge-info flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" /> Salvando...
            </span>
          )}
        </div>
      </div>

      {/* 1. VERSO CARD */}
      <div className="card glass-card border-gold-left">
        <div className="card-header cursor-pointer flex justify-between items-center" onClick={() => setShowVerse(!showVerse)}>
          <div className="card-title-icon">
            <Sun className="icon-gold" size={20} />
            <h3>Verso de Abertura</h3>
          </div>
          {showVerse ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {showVerse && (
          <div className="card-body">
            <blockquote className="verso-blockquote font-serif italic text-center whitespace-pre-line text-sm leading-relaxed p-4 bg-dark-trans rounded">
              {WALDORF_VERSE}
            </blockquote>
          </div>
        )}
      </div>

      {/* 2. MITOLOGIA HEBRAICA */}
      <div className="card glass-card">
        <div className="card-header">
          <div className="card-title-icon">
            <BookOpen className="icon-purple" size={20} />
            <h3>Mitologia Hebraica</h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="checkbox-label text-xs">
              <input
                type="checkbox"
                checked={planning.mythologyRead}
                onChange={(e) => handleFieldChange('mythologyRead', e.target.checked)}
              />
              Recitado e Lido
            </label>
          </div>
        </div>
        <div className="card-body flex flex-col gap-4">
          <div>
            <label className="form-label-sub">Texto do Dia (Professor):</label>
            {planning.mythologyText ? (
              <div className="mythology-day-text p-3 bg-dark-trans border rounded text-sm max-h-60 overflow-y-auto whitespace-pre-line">
                {planning.mythologyText}
              </div>
            ) : (
              <p className="text-xs text-muted-yellow italic">
                Nenhum texto cadastrado para hoje. Cadastre o texto semanal no painel de gerenciamento de Mitologia.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label-sub">Reflexão do Texto (Criança):</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={planning.mythologyReflection}
              onChange={(e) => handleFieldChange('mythologyReflection', e.target.value)}
              placeholder="Escreva aqui a reflexão gerada pelo texto..."
            />
          </div>

          <div className="uploader-section">
            <label className="form-label-sub mb-2 block">Foto da Cópia no Caderno:</label>
            <PhotoUploader 
              photos={planning.photos.mythology || []} 
              onChange={(urls) => handlePhotoChange('mythology', urls)}
              label="Mitologia"
            />
          </div>
        </div>
      </div>

      {/* 3. LETRA CURSIVA */}
      <div className="card glass-card">
        <div className="card-header">
          <div className="card-title-icon">
            <Edit3 className="icon-blue" size={20} />
            <h3>Letra Cursiva</h3>
          </div>
        </div>
        <div className="card-body flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label-sub">Letra ou Texto do Dia:</label>
            <input
              type="text"
              className="form-input"
              value={planning.cursiveLetter}
              onChange={(e) => handleFieldChange('cursiveLetter', e.target.value)}
              placeholder="Ex: Letra M / Família de palavras..."
            />
          </div>
          <div className="uploader-section">
            <label className="form-label-sub mb-2 block">Foto do treino da Criança:</label>
            <PhotoUploader 
              photos={planning.photos.cursive || []} 
              onChange={(urls) => handlePhotoChange('cursive', urls)}
              label="Letra Cursiva"
            />
          </div>
        </div>
      </div>

      {/* 4. EXERCÍCIOS DA ÉPOCA */}
      <div className="card glass-card">
        <div className="card-header">
          <div className="card-title-icon">
            <Sparkles className="icon-gold" size={20} />
            <h3>Exercícios da Época ({currentEpoch.type === 'letters' ? 'Letras' : 'Matemática'})</h3>
          </div>
        </div>
        <div className="card-body flex flex-col gap-4">
          <div className="epoch-didactic-info bg-dark-trans p-3 rounded text-xs border border-dashed border-muted">
            <span className="font-semibold text-light block mb-1">Mapeamento Pedagógico:</span>
            <ul className="list-disc pl-4 flex flex-col gap-1 text-muted">
              {currentEpoch.subjects.map((sub, idx) => (
                <li key={idx}>{sub}</li>
              ))}
            </ul>
          </div>

          <div className="form-group">
            <label className="form-label-sub">Planejamento do Exercício do Dia:</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={planning.epochExercise}
              onChange={(e) => handleFieldChange('epochExercise', e.target.value)}
              placeholder="Descreva os exercícios de matemática, ciências ou história aplicados hoje..."
            />
          </div>

          <div className="uploader-section">
            <label className="form-label-sub mb-2 block">Foto dos Exercícios Realizados:</label>
            <PhotoUploader 
              photos={planning.photos.exercise || []} 
              onChange={(urls) => handlePhotoChange('exercise', urls)}
              label="Exercício"
            />
          </div>
        </div>
      </div>

      {/* 5. DESENHO */}
      <div className="card glass-card">
        <div className="card-header">
          <div className="card-title-icon">
            <ImageIcon className="icon-purple" size={20} />
            <h3>Desenho</h3>
          </div>
        </div>
        <div className="card-body flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label-sub">Tema do Desenho (Decidido pelo Professor):</label>
            <input
              type="text"
              className="form-input"
              value={planning.drawingTheme}
              onChange={(e) => handleFieldChange('drawingTheme', e.target.value)}
              placeholder="Descreva o tema do desenho do dia..."
            />
          </div>
          <div className="uploader-section">
            <label className="form-label-sub mb-2 block">Foto do Desenho Finalizado:</label>
            <PhotoUploader 
              photos={planning.photos.drawing || []} 
              onChange={(urls) => handlePhotoChange('drawing', urls)}
              label="Desenho"
            />
          </div>
        </div>
      </div>

      {/* 6. EXTRA ACTIVITIES (Ditado ou Produção de Texto) */}
      {extraActivityName && (
        <div className="card glass-card">
          <div className="card-header">
            <div className="card-title-icon">
              <CheckSquare className="icon-blue" size={20} />
              <h3>Atividade Extra: {extraActivityName}</h3>
            </div>
          </div>
          <div className="card-body flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label-sub">Conteúdo da Atividade ({extraActivityName}):</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={planning.extraActivity}
                onChange={(e) => handleFieldChange('extraActivity', e.target.value)}
                placeholder={`Detalhes do ${extraActivityName.toLowerCase()} aplicado hoje...`}
              />
            </div>
            <div className="uploader-section">
              <label className="form-label-sub mb-2 block">Foto da Atividade:</label>
              <PhotoUploader 
                photos={planning.photos.extra || []} 
                onChange={(urls) => handlePhotoChange('extra', urls)}
                label={extraActivityName}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. VIVÊNCIAS DA TARDE/NOITE */}
      <div className="card glass-card">
        <div className="card-header">
          <div className="card-title-icon">
            <Flame className="icon-purple" size={20} />
            <h3>Vivências da Tarde / Noite</h3>
          </div>
          <span className="badge badge-purple">Rotina Semanal</span>
        </div>
        <div className="card-body flex flex-col gap-4">
          <div className="afternoon-suggested bg-dark-trans p-3 rounded border border-purple-muted">
            <span className="text-xs font-semibold text-light block mb-1">Atividade Sugerida:</span>
            <p className="text-sm text-purple-light font-medium">{getAfternoonActivity(dayOfWeek)}</p>
          </div>

          <div className="form-group">
            <label className="form-label-sub">Registros e Observações da Tarde:</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={planning.afternoonActivity}
              onChange={(e) => handleFieldChange('afternoonActivity', e.target.value)}
              placeholder="Descreva como foi a vivência prática, artes visuais, esportes ou trabalhos manuais..."
            />
          </div>

          <div className="uploader-section">
            <label className="form-label-sub mb-2 block">Foto da Vivência (Aquarela, Argila, etc.):</label>
            <PhotoUploader 
              photos={planning.photos.afternoon || []} 
              onChange={(urls) => handlePhotoChange('afternoon', urls)}
              label="Vivência da Tarde"
            />
          </div>
        </div>
      </div>

      {/* 8. TODOS OS DIAS (Brincadeiras e Leitura) */}
      <div className="card glass-card">
        <div className="card-header">
          <div className="card-title-icon">
            <BookOpenCheck className="icon-gold" size={20} />
            <h3>Atividades Diárias Essenciais</h3>
          </div>
        </div>
        <div className="card-body flex flex-col gap-4">
          <div className="flex flex-wrap gap-6">
            <label className="checkbox-label flex-1 min-w-[200px]">
              <input
                type="checkbox"
                checked={planning.freePlay}
                onChange={(e) => handleFieldChange('freePlay', e.target.checked)}
              />
              <div>
                <span className="font-semibold block text-sm">Brincadeiras Livres Realizadas</span>
                <span className="text-xxs text-muted">Essencial para o desenvolvimento motor e imaginação.</span>
              </div>
            </label>

            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <span className="font-semibold block text-sm">Leitura Diária do Livro</span>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="form-input flex-1 text-xs"
                  value={planning.bookReading}
                  onChange={(e) => handleFieldChange('bookReading', e.target.value)}
                  placeholder="Selecione um livro ou digite o título..."
                />
                <button
                  type="button"
                  onClick={onSelectBookDrawer}
                  className="btn btn-secondary btn-sm"
                  title="Abrir biblioteca do Rubicão"
                >
                  Biblioteca
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DailyPlanner;
