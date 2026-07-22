import { useState } from 'react';
import { getEpochByDate } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

interface CalendarProps {
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDateStr, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDateStr + 'T12:00:00'));

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0 - 11

  const activeEpoch = getEpochByDate(selectedDateStr);

  // Month names
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day of month offset
  const getFirstDayOffset = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, etc.
    const day = new Date(year, month, 1).getDay();
    // Return standard offset: Monday is first day of the week, so convert Sunday (0) to 6, Monday (1) to 0, etc.
    return (day + 6) % 7;
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOffset(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    const newDateStr = `${currentYear}-${mm}-${dd}`;
    onSelectDate(newDateStr);
  };

  // Generate calendar days
  const daysArray: (number | null)[] = [];
  // Fill offset days with null
  for (let i = 0; i < firstDayOffset; i++) {
    daysArray.push(null);
  }
  // Fill actual month days
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  // Get Epoch CSS class
  const getEpochClass = (epochType: string) => {
    switch (epochType) {
      case 'letters': return 'epoch-letters';
      case 'math': return 'epoch-math';
      case 'vacation': return 'epoch-vacation';
      case 'advent': return 'epoch-advent';
      default: return '';
    }
  };

  // Check if a day matches the selected date
  const isSelectedDay = (dayNum: number) => {
    const date = new Date(selectedDateStr + 'T12:00:00');
    return date.getFullYear() === currentYear &&
           date.getMonth() === currentMonth &&
           date.getDate() === dayNum;
  };

  // Check if it's weekend
  const isWeekend = (dayNum: number) => {
    const day = new Date(currentYear, currentMonth, dayNum).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  return (
    <div className="calendar-component card glass-card">
      <div className="calendar-header flex items-center justify-between">
        <div className="calendar-title flex items-center gap-2">
          <CalendarIcon size={20} className="icon-blue" />
          <h2 className="text-xl font-bold">{monthNames[currentMonth]} {currentYear}</h2>
        </div>
        <div className="calendar-nav-buttons flex gap-2">
          <button type="button" onClick={prevMonth} className="btn-icon" title="Mês anterior">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={nextMonth} className="btn-icon" title="Próximo mês">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Active Epoch Banner */}
      <div className={`epoch-banner ${getEpochClass(activeEpoch.type)}`}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="epoch-banner-number">
              {activeEpoch.type === 'vacation' ? 'Descanso' : activeEpoch.type === 'advent' ? 'Ritual' : `${activeEpoch.number}ª Época`}
            </span>
            <h3 className="epoch-banner-title">{activeEpoch.name}</h3>
            <p className="epoch-banner-desc">{activeEpoch.description}</p>
          </div>
          <div className="epoch-subjects-badge" title="Tópicos da Época">
            <Info size={16} />
          </div>
        </div>
        
        {/* Tiny topics list in banner */}
        <div className="epoch-topics-list mt-3">
          {activeEpoch.subjects.slice(0, 3).map((sub, idx) => (
            <span key={idx} className="epoch-topic-tag">{sub}</span>
          ))}
          {activeEpoch.subjects.length > 3 && (
            <span className="epoch-topic-tag">+{activeEpoch.subjects.length - 3} mais</span>
          )}
        </div>
      </div>

      {/* Week days labels */}
      <div className="week-labels-grid">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => (
          <div key={i} className="week-label-cell">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="days-grid-layout">
        {daysArray.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="day-cell day-empty" />;
          }

          const selected = isSelectedDay(dayNum);
          const weekend = isWeekend(dayNum);
          const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const cellEpoch = getEpochByDate(cellDateStr);
          const activeType = cellEpoch.type;

          let dayClasses = 'day-cell';
          if (selected) dayClasses += ' day-selected';
          if (weekend) dayClasses += ' day-weekend';
          if (!selected && !weekend) {
            dayClasses += ` day-epoch-bg-${activeType}`;
          }

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              onClick={() => handleDayClick(dayNum)}
              className={dayClasses}
            >
              <span className="day-number">{dayNum}</span>
              {selected && <div className="selected-dot" />}
            </button>
          );
        })}
      </div>

      {/* Epoch Color Legends */}
      <div className="epoch-legends flex flex-wrap gap-3 mt-4 pt-3 border-t">
        <div className="legend-item">
          <div className="legend-color legend-letters" />
          <span>Épocas de Letras (Português/Ciências/Hist/Geo)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-math" />
          <span>Épocas de Matemática (Aritmética)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-vacation" />
          <span>Férias</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-advent" />
          <span>Advento</span>
        </div>
      </div>
    </div>
  );
};
export default Calendar;
