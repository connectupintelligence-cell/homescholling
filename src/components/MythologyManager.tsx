import { useState, useEffect } from 'react';
import { localDB } from '../db/localDB';
import type { WeeklyMythology } from '../types';
import { getWeekNumberAndYear, splitTextIntoDays, getDatesForWeek } from '../utils/helpers';
import { BookOpen, FileText, CheckCircle2, ChevronRight, Save } from 'lucide-react';

interface MythologyManagerProps {
  currentDateStr: string;
  onMythologyUpdated: () => void;
}

export const MythologyManager: React.FC<MythologyManagerProps> = ({ currentDateStr, onMythologyUpdated }) => {
  const { weekId, weekStart } = getWeekNumberAndYear(currentDateStr);
  const weekDates = getDatesForWeek(weekStart);

  const [fullText, setFullText] = useState('');
  const [dailyParts, setDailyParts] = useState<string[]>(Array(5).fill(''));
  const [isSaved, setIsSaved] = useState(false);

  // Load existing week mythology
  useEffect(() => {
    async function loadMythology() {
      const data = await localDB.getWeeklyMythology(weekId);
      if (data) {
        setFullText(data.fullText);
        setDailyParts(data.dailyParts);
      } else {
        setFullText('');
        setDailyParts(Array(5).fill(''));
      }
      setIsSaved(false);
    }
    loadMythology();
  }, [weekId]);

  const handleSplitText = () => {
    const parts = splitTextIntoDays(fullText);
    setDailyParts(parts);
    setIsSaved(false);
  };

  const handlePartChange = (index: number, val: string) => {
    const updated = [...dailyParts];
    updated[index] = val;
    setDailyParts(updated);
    setIsSaved(false);
  };

  const handleSave = async () => {
    const mythData: WeeklyMythology = {
      id: weekId,
      weekStart,
      fullText,
      dailyParts
    };
    await localDB.saveWeeklyMythology(mythData);
    
    // Also, update the individual daily plannings for this week!
    for (let i = 0; i < 5; i++) {
      const date = weekDates[i];
      const existing = await localDB.getPlanning(date);
      const textForDay = dailyParts[i] || '';
      
      const newPlanning = existing 
        ? { ...existing, mythologyText: textForDay }
        : {
            date,
            activeEpochId: '', // will be set dynamically
            mythologyText: textForDay,
            mythologyReflection: '',
            mythologyRead: false,
            cursiveLetter: '',
            epochExercise: '',
            drawingTheme: '',
            extraActivity: '',
            afternoonActivity: '',
            freePlay: true,
            bookReading: '',
            photos: {}
          };
      await localDB.savePlanning(newPlanning);
    }

    setIsSaved(true);
    onMythologyUpdated();
  };

  return (
    <div className="card glass-card mythology-manager">
      <div className="card-header">
        <div className="card-title-icon">
          <BookOpen className="icon-gold" size={20} />
          <h3>Mitologia Hebraica: Texto da Semana</h3>
        </div>
        <span className="badge badge-gold">Semana: {weekId} (Início: {weekStart})</span>
      </div>

      <div className="card-body">
        <div className="form-group">
          <label htmlFor="full-weekly-text" className="form-label">
            Cole o texto completo do quadro / semanal aqui:
          </label>
          <textarea
            id="full-weekly-text"
            className="form-textarea"
            rows={6}
            value={fullText}
            onChange={(e) => {
              setFullText(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Digite ou cole o texto completo da mitologia hebraica para a semana..."
          />
          <div className="action-row">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSplitText}
              disabled={!fullText.trim()}
            >
              <FileText size={16} />
              Dividir nos Dias (Seg - Sex)
            </button>
          </div>
        </div>

        {dailyParts.some(p => p.trim()) && (
          <div className="divided-days-section">
            <h4 className="section-subtitle">Ajuste dos Textos por Dia:</h4>
            <div className="days-grid">
              {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'].map((dayName, idx) => (
                <div key={idx} className="day-text-box">
                  <label className="day-label-sub">
                    <ChevronRight size={14} className="icon-gold" />
                    {dayName} ({weekDates[idx]})
                  </label>
                  <textarea
                    className="form-textarea day-textarea"
                    rows={4}
                    value={dailyParts[idx]}
                    onChange={(e) => handlePartChange(idx, e.target.value)}
                    placeholder={`Texto para ${dayName}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-footer-actions">
          <button
            type="button"
            className={`btn ${isSaved ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSave}
            disabled={!fullText.trim()}
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={16} />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar e Aplicar à Semana
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default MythologyManager;
