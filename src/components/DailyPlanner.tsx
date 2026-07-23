import { useState, useEffect } from 'react';
import { localDB } from '../db/localDB';
import type { DailyPlanning } from '../types';
import { 
  getEpochByDate, 
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

interface SuggestionItem {
  title: string;
  type: 'canção' | 'poema' | 'jogo' | 'trava-línguas';
  content: string;
  targetField: 'cursive' | 'exercise';
}

const getEpochSuggestions = (epochId: string): SuggestionItem[] => {
  if (epochId === 'epoca-3') {
    return [
      {
        title: "Trava-línguas da Época",
        type: "trava-línguas",
        content: "A Iara agarra e amarra a rara arara de Araraquara.",
        targetField: "cursive"
      },
      {
        title: "Canção do Plantador",
        type: "canção",
        content: "Semeie a semente\ndebaixo da terra.\nO sol ela sente,\na chuva ela espera.\n\nPara a terra ficar macia,\ntenha as mãos cheias de amor.\nDevagar já brota o broto,\ne floresce então a flor.\n\nA planta, na terra,\nseus pés logo espicha,\nseu corpo levanta,\nseus braços agita.\n\nE as árvores logo crescem\nsob o sol que tanto brilha.\nSão irmãs as mais diversas\ndentro da mesma família.\n\nA planta plantada\nvai ramificando,\nde folhas folhada,\nseu fruto mostrando.\n\nE o fruto amadurece\ne um dia cai no chão.\nE assim mesmo não se esquece\nde que tem outra missão.\n\nPois sua semente\npenetra na terra.\nO sol ela sente,\na chuva ela espera.\n\nE as árvores logo crescem\nsob o céu que tanto brilha.\nSão irmãs as mais diversas\ndentro da mesma família.",
        targetField: "cursive"
      },
      {
        title: "A Semente (Ruth Salles)",
        type: "poema",
        content: "Semente misteriosa,\nque da planta cai no chão,\nque segredos ela guarda\nno fundo do coração?\n\n“Eu sou o menor presente\nque foi posto em sua mão,\npois parece não ser nada\neste pequenino grão.\n\nMas dele verás crescer,\nnuma fecunda estação,\numa árvore frondosa\nsubindo para a amplidão!\n\nToda a árvore, guardada\ndentro do pequeno grão,\nesperava o bom momento\npara enfim se erguer do chão.\n\nVale mais que muita jóia\n– como percebes então –\no presente pequenino\nque foi posto em sua mão.”",
        targetField: "cursive"
      },
      {
        title: "Canção do Camponês",
        type: "canção",
        content: "Eu sou um camponês\nDas plantas vou cuidar\nVou com os meus amigos a terra trabalhar\n\nVamos plantar!\nVamos colher!\nE ao bom Deus agradecer!\n\n\"Delicada semente…\ndorme no berço da Terra…\ne o Sol ela sente…\ndepois chuva ela espera…\ne o broto desperta…\no mundo dá boas vindas…\ncom a forca da Vida…\nvai ao encontro com o céu...\"",
        targetField: "cursive"
      },
      {
        title: "Um Berço na Terra (Renato Machado)",
        type: "canção",
        content: "Um berço na terra\nEu vou preparar\nPara uma semente de vida brotar\nSemente na terra ela vai descansar\nDepois de um tempo, ela vem despertar\n\nCom a força do sol\nE a água da chuva\nRaiz pra baixo que firma na terra\nUm broto levanta apontando pro céu\nCom galhos e folhas de verde surgindo\nVem a primavera tudo colorindo\n\nTem rosa, violeta, lavanda, jasmim\nE tem girassol, vem girar para mim.",
        targetField: "cursive"
      }
    ];
  }

  if (epochId === 'epoca-8') {
    return [
      {
        title: "Poema: Casinha de Bichos (Hardy Guedes)",
        type: "poema",
        content: "Vejam só como os bichos\nVão ensinando a gente;\nPra ter casa bonita,\nbasta que se invente!\n\nCada um dá um jeitinho\nDe ter sua morada.\nCada um tem uma ideia\nMais ou menos bolada.\n\nRepare só como faz\nO esperto passarinho\nQue cata palha por palha\nPara fazer o seu ninho.\n\nA aranha não se acanha.\nCom seu novelo de linha,\nTrança onde quer sua teia,\nEscolhe quem quer por vizinha.\n\nO macaco, malandrinho,\nNão quer saber de trabalho.\nEscolhe uma boa árvore\nE logo se ajeita num galho.\n\nO grilo mora na folha\nE eu penso cá comigo:\nDeve ser o único bicho\nQue come o próprio abrigo.\n\nLevando massa no bico,\nTrabalhando o dia inteiro,\nJoão-de-barro faz casa\nComo se fosse pedreiro.\n\nO caracol teve sorte\nNão gastou tempo e dinheiro.\nNasceu com a casa nas costas\nE mora no mundo inteiro.\n\nO castor é engenheiro\nFaz barragem, faz represa.\nSua casa tem piscina\nNão é mesmo uma beleza?\n\nCasa é também proteção.\nO tatu, que não é boboca,\nSe vê inimigo por perto,\nJá vai correndo pra toca.\n\nPra fazer a sua casa,\nA formiga cava fundo.\nFaz túnel pra todo lado,\nPra que more todo mundo.\n\nA casa do marimbondo\nFica no alto, pendurada.\nSe alguém chegar bem perto,\nCuidado, lá vem ferroada!\n\nO sapo cava um buraco\nE uma cantoria entoa:\nVai chamando a namorada\nPra namorar na sua lagoa!",
        targetField: "cursive"
      }
    ];
  }

  if (['epoca-2', 'epoca-4', 'epoca-7', 'epoca-9'].includes(epochId)) {
    return [
      {
        title: "Jogo da Velha com Adição e Subtração",
        type: "jogo",
        content: "Regras do Jogo da Velha Matemático:\n1. Em dupla: Cada jogador recebe um tabuleiro e 9 peças (ex: 9 maçãs e 9 laranjas).\n2. Tira-se par ou ímpar para ver quem começa.\n3. O objetivo é fazer uma sequência na horizontal, vertical ou diagonal das operações para vencer.\n4. Cada jogador confere a conta do adversário para ver se está correta.\n5. Registre a pontuação das rodadas dos ganhadores.",
        targetField: "exercise"
      }
    ];
  }

  return [];
};

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

  const currentEpoch = getEpochByDate(dateStr);

  const [planning, setPlanning] = useState<DailyPlanning | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [showVerse, setShowVerse] = useState(true);
  const [showResources, setShowResources] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };


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
  const epochSuggestions = getEpochSuggestions(currentEpoch.id);

  return (
    <div className="daily-planner-component flex flex-column gap-6">
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

      {/* SUGGESTIONS CARD */}
      {epochSuggestions.length > 0 && (
        <div className="card glass-card border-purple-muted animate-all">
          <div className="card-header cursor-pointer flex justify-between items-center" onClick={() => setShowResources(!showResources)}>
            <div className="card-title-icon">
              <Sparkles className="icon-purple" size={20} />
              <h3>Materiais de Apoio Sugeridos ({currentEpoch.name.split(':')[0]})</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-purple">{epochSuggestions.length} {epochSuggestions.length === 1 ? 'sugestão' : 'sugestões'}</span>
              <button type="button" className="btn-icon btn-icon-muted">
                {showResources ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          {showResources && (
            <div className="card-body flex flex-column gap-4">
              <p className="text-xs text-muted">
                Encontramos os seguintes materiais no seu plano curricular da época. Você pode usá-los no planejamento de hoje:
              </p>
              <div className="flex flex-column gap-3">
                {epochSuggestions.map((item, idx) => (
                  <div key={idx} className="bg-dark-trans p-3 rounded border border-purple-muted flex flex-column gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-light">{item.title}</span>
                      <span className="badge badge-gold text-xxs uppercase">{item.type}</span>
                    </div>
                    <blockquote className="font-serif italic text-xs text-muted whitespace-pre-line leading-relaxed bg-dark-trans p-2 rounded">
                      {item.content}
                    </blockquote>
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm text-xs"
                        onClick={() => handleCopyToClipboard(item.content, `sug-${idx}`)}
                      >
                        {copiedId === `sug-${idx}` ? 'Copiado!' : 'Copiar Texto'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm text-xs"
                        onClick={() => {
                          if (!planning) return;
                          const updated = { ...planning };
                          if (item.targetField === 'cursive') {
                            updated.cursiveLetter = item.content;
                          } else if (item.targetField === 'exercise') {
                            updated.epochExercise = item.content;
                          }
                          setPlanning(updated);
                          setSaveStatus('dirty');
                        }}
                      >
                        {item.targetField === 'cursive' ? 'Usar na Cursiva' : 'Usar nos Exercícios'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
        <div className="card-body flex flex-column gap-4">
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
        <div className="card-body flex flex-column gap-4">
          <div className="form-group">
            <label className="form-label-sub">Letra ou Texto do Dia:</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={planning.cursiveLetter}
              onChange={(e) => handleFieldChange('cursiveLetter', e.target.value)}
              placeholder="Ex: Letra M / Escreva o poema ou trava-línguas do dia..."
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
        <div className="card-body flex flex-column gap-4">
          <div className="epoch-didactic-info bg-dark-trans p-3 rounded text-xs border border-dashed border-muted">
            <span className="font-semibold text-light block mb-1">Mapeamento Pedagógico:</span>
            <ul className="list-disc pl-4 flex flex-column gap-1 text-muted">
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
        <div className="card-body flex flex-column gap-4">
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
          <div className="card-body flex flex-column gap-4">
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
        <div className="card-body flex flex-column gap-4">
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
        <div className="card-body flex flex-column gap-4">
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

            <div className="flex-1 min-w-[250px] flex flex-column gap-2">
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
