import type { Epoch, ReadingBook } from '../types';

export const WALDORF_VERSE = `Com sua luz querida, o sol clareia o dia,
e o poder do espírito que brilha em minha alma
dá força aos meus membros.
No brilho da luz do sol, ó Deus,
venero a força humana que tu bondosamente plantaste em minha alma,
para que eu possa estar ansioso em trabalhar,
para que eu possa ter desejo de aprender.
De ti vem luz e força, para ti refluam amor e gratidão.`;

export const EPOCHS: Epoch[] = [
  {
    id: 'ferias-jan',
    number: 0,
    name: 'Férias de Janeiro',
    type: 'vacation',
    month: 0,
    description: 'Período de descanso e brincadeiras livres.',
    subjects: ['Brincadeiras livres', 'Leitura familiar']
  },
  {
    id: 'epoca-1',
    number: 1,
    name: '1ª Época: Letras - A Criação do Mundo',
    type: 'letters',
    subType: 'Criação do Mundo',
    month: 1,
    description: 'Introdução e treino da letra cursiva através da história da Criação do Mundo.',
    subjects: [
      'Escrita de pequenos textos (adjetivos em verde, verbos em vermelho, substantivos em azul)',
      'Escrita em letra maiúscula e minúscula',
      'Desenho de formas: retas, curvas, espelhamento, letra minúscula',
      'Modelagem em argila',
      'Trabalho na horta',
      'Aquarela'
    ]
  },
  {
    id: 'epoca-2',
    number: 2,
    name: '2ª Época: Matemática - Aritmética 1',
    type: 'math',
    month: 2,
    description: 'Aritmética e contas armadas.',
    subjects: [
      'Exercícios de desenho de formas contínuo para soltar o pulso',
      'Retomada das tabuadas de forma ritmada',
      'Cálculos mentais',
      'Treino das quatro operações com situações-problema',
      'Sistematização de unidade, dezena, centena e milhar',
      'Introdução da conta armada de adição e subtração'
    ]
  },
  {
    id: 'epoca-3',
    number: 3,
    name: '3ª Época: Letras - Mãe Terra',
    type: 'letters',
    subType: 'Mãe Terra',
    month: 3,
    description: 'Estudo da terra, solo, agricultura e plantio do trigo.',
    subjects: [
      'Preparação da terra e plantio do trigo',
      'Ciências: A terra e os tipos de solo',
      'História: As sementes, as plantas, a colheita, as ferramentas, o agricultor',
      'Língua Portuguesa: Gramática e redação',
      'Desenho de formas diário'
    ]
  },
  {
    id: 'epoca-4',
    number: 4,
    name: '4ª Época: Matemática - Aritmética 2',
    type: 'math',
    month: 4,
    description: 'Aprofundamento nas operações aritméticas.',
    subjects: [
      'Introdução da operação de multiplicação e divisão',
      'Resolução de situações problemas',
      'Sistematização das tabuadas e cálculo mental',
      'Treino das operações armadas de soma e subtração'
    ]
  },
  {
    id: 'epoca-5',
    number: 5,
    name: '5ª Época: Letras - Profissões',
    type: 'letters',
    subType: 'Profissões',
    month: 5,
    description: 'Exploração das profissões primordiais e antigas do ser humano.',
    subjects: [
      'Narrativas sobre profissões primordiais: oleiro, ferreiro, padeiro, marceneiro',
      'Passeios para visitar profissionais',
      'Escrita de pequenos textos sobre as vivências',
      'Treino de pontuação e letra cursiva'
    ]
  },
  {
    id: 'ferias-jul',
    number: 6,
    name: 'Férias de Julho',
    type: 'vacation',
    month: 6,
    description: 'Período de férias escolares e descanso.',
    subjects: ['Brincadeiras livres', 'Leitura livre']
  },
  {
    id: 'epoca-7',
    number: 7,
    name: '7ª Época: Matemática - Aritmética 3',
    type: 'math',
    month: 7,
    description: 'Matemática prática e introdução de medidas.',
    subjects: [
      'Sistematização da tabuada e cálculo mental',
      'Treino das operações armadas (soma, subtração, multiplicação e divisão)',
      'Resolução de problemas do cotidiano',
      'Introdução de pesos e medidas'
    ]
  },
  {
    id: 'epoca-8',
    number: 8,
    name: '8ª Época: Letras - Habitações',
    type: 'letters',
    subType: 'Habitações',
    month: 8,
    description: 'História das construções humanas e moradia dos animais.',
    subjects: [
      'Ciências: Moradia dos animais',
      'História: Diferentes tipos de moradias do ser humano e a construção da casa',
      'Geografia: Identificar direções e noções espaciais',
      'Gramática: Verbos, substantivos, adjetivos e ortografia',
      'Poema sobre habitações'
    ]
  },
  {
    id: 'epoca-9',
    number: 9,
    name: '9ª Época: Matemática - Aritmética 4',
    type: 'math',
    month: 9,
    description: 'Sistematização de cálculos e vivência de pesos.',
    subjects: [
      'Treino das operações armadas',
      'Sistematização de tabuadas e cálculo mental',
      'Vivências práticas com medidas de peso, capacidade e comprimento'
    ]
  },
  {
    id: 'epoca-10',
    number: 10,
    name: '10ª Época: Letras - Do Grão ao Pão / Agricultura',
    type: 'letters',
    subType: 'Do Grão ao Pão',
    month: 10,
    description: 'A colheita do trigo semeado na época 3 e o preparo do pão.',
    subjects: [
      'Colheita do trigo e preparo do pão com o trigo colhido',
      'Morfologia gramatical: substantivo, adjetivo, verbo e artigo',
      'Treino de pontuação e escrita cursiva',
      'Passeio focado em profissões rurais e padaria tradicional'
    ]
  },
  {
    id: 'epoca-advento',
    number: 11,
    name: 'Vivência do Advento',
    type: 'advent',
    month: 11,
    description: 'Celebração e preparação para o Natal, com ritos e leituras de Advento.',
    subjects: [
      'Histórias de Advento',
      'Montagem do presépio (reinos mineral, vegetal, animal e humano)',
      'Artes manuais festivas'
    ]
  }
];

export const DEFAULT_BOOKS: ReadingBook[] = [
  { title: "A parte que falta", author: "Shel Silverstein", phase: "Rubicão", isRead: false },
  { title: "A colcha de retalhos", author: "Nye Ribeiro", phase: "Rubicão", isRead: false },
  { title: "Quando eu era pequena", author: "Adélia Prado", phase: "Rubicão", isRead: false },
  { title: "Como nasceu a alegria", author: "Rubem Alves", phase: "Rubicão", isRead: false },
  { title: "O Silêncio de Júlia", author: "Pierre Coran e Mélanie Florian", phase: "Rubicão", isRead: false },
  { title: "O Pequeno Samurai", author: "Lúcia Hiratsuka", phase: "Rubicão", isRead: false },
  { title: "O livro da gratidão", author: "Luciana Betti", phase: "Rubicão", isRead: false },
  { title: "O Artesão", author: "Walter Lara", phase: "Rubicão", isRead: false },
  { title: "A teia de Charlotte", author: "E. B Wite", phase: "Rubicão", isRead: false },
  { title: "Coleção “Recadeiro do Reino de Além-véu”", author: "Luciana Betti", phase: "Rubicão", isRead: false },
  { title: "Irmão lobo, irmã cigarra", author: "Armando Moore", phase: "Rubicão", isRead: false },
  { title: "O pote vazio", author: "Demi", phase: "Rubicão", isRead: false },
  { title: "A Estrela de Natal", author: "Marcus Pfister", phase: "Rubicão", isRead: false },
  { title: "Contos de enrolar - Cheiro de terra molhada", author: "Rosana Pamplona / Luiza Lameirão", phase: "Rubicão", isRead: false },
  { title: "Coleção “O cachorrinho Samba”", author: "Maria José Dupré", phase: "Rubicão", isRead: false },
  { title: "A Montanha Encantada", author: "Maria José Dupré", phase: "Rubicão", isRead: false },
  { title: "A ilha perdida", author: "Maria José Dupré", phase: "Rubicão", isRead: false },
  { title: "Francisco e os pássaros", author: "Ana Vieira Pereira", phase: "Rubicão", isRead: false },
  { title: "Marcelo, marmelo, martelo", author: "Ruth Rocha", phase: "Rubicão", isRead: false },
  { title: "Coleção “A Casa da Árvore Mágica” (3º ao 5º ano)", author: "Ed. Farol Literário", phase: "Rubicão", isRead: false },
  { title: "Bisa Bia, Bisa Bel", author: "Ana Maria Machado", phase: "Rubicão", isRead: false },
  { title: "Contos de adivinhação", author: "Ricardo Azevedo", phase: "Rubicão", isRead: false },
  { title: "Histórias à brasileira", author: "Ana Maria Machado", phase: "Rubicão", isRead: false },
  { title: "12 fábulas de Esopo", author: "Ruth Rocha (ed. Poemas que escolhi)", phase: "Rubicão", isRead: false },
  { title: "Poemas para brincar", author: "José Paulo Paes", phase: "Rubicão", isRead: false },
  { title: "Um menino, sua amiga, um fichário e dois preás", author: "Mirna Pinsky", phase: "Rubicão", isRead: false },
  { title: "Coleção “O Jovem Fazendeiro”", author: "Laura Ingalls Wilder", phase: "Rubicão", isRead: false },
  { title: "Coleção - Píppi Meia longa", author: "Astrid Lindgren", phase: "Rubicão", isRead: false },
  { title: "Coleção - As Aventuras da família de Laura Ingalls", author: "Laura Ingalls", phase: "Rubicão", isRead: false },
  { title: "Heidi", author: "Johanna Spyri", phase: "Rubicão", isRead: false },
  { title: "Bill Bergson, o ás dos detetives", author: "Astrid Lindgren", phase: "Rubicão", isRead: false },
  { title: "Bill Bergson vive perigosamente", author: "Astrid Lindgren", phase: "Rubicão", isRead: false },
  { title: "Bill Bergson e o resgate da rosa branca", author: "Astrid Lindgren", phase: "Rubicão", isRead: false },
  { title: "Emil e a grande fuga", author: "Astrid Lindgren", phase: "Rubicão", isRead: false },
  { title: "Karlsson no telhado", author: "Astrid Lindgren", phase: "Rubicão", isRead: false },
  { title: "Mio, Meu Filho", author: "Astrid Lindgren", phase: "Rubicão", isRead: false },
  { title: "Jim Knopf e Lucas, o Maquinista", author: "Michael Ende", phase: "Rubicão", isRead: false },
  { title: "Jim Knopf e os 13 Piratas", author: "Michael Ende", phase: "Rubicão", isRead: false },
  { title: "Elefante Mágico", author: "Kate Dicamillo", phase: "Rubicão", isRead: false },
  { title: "O Tigre", author: "Kate Dicamillo", phase: "Rubicão", isRead: false },
  { title: "A extraordinária jornada de Edward Tulane", author: "Kate DiCamillo", phase: "Rubicão", isRead: false },
  { title: "Lin e o outro lado do bambuzal", author: "Lúcia Hiratsuka", phase: "Rubicão", isRead: false }
];

export function getEpochByMonth(month: number): Epoch {
  return EPOCHS.find(e => e.month === month) || EPOCHS[0];
}

export function getAfternoonActivity(dayOfWeek: number): string {
  switch (dayOfWeek) {
    case 1: // Monday
      return 'Artes Visuais: Aquarela';
    case 2: // Tuesday
      return 'Trabalhos manuais (Tricô) / Jiu-jitsu';
    case 3: // Wednesday
      return 'Música';
    case 4: // Thursday
      return 'Inglês (Tempo / Vocabulário / números / família de palavras) / Jiu-jitsu / natação';
    case 5: // Friday
      return 'Trabalhos manuais: Cerâmica';
    default:
      return 'Brincadeiras livres / Vivência familiar';
  }
}

export function getExtraActivity(dayOfWeek: number): string {
  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
    return 'Produção de Texto';
  }
  if (dayOfWeek === 2 || dayOfWeek === 4) {
    return 'Ditado';
  }
  return '';
}

export function getWeekNumberAndYear(dateStr: string): { weekId: string; weekStart: string } {
  const date = new Date(dateStr + 'T12:00:00'); // avoid timezone shifts
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Monday is 0, Sunday is 6
  target.setDate(target.getDate() - dayNr); // Monday of this week
  
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  const weekStart = `${yyyy}-${mm}-${dd}`;
  
  // Calculate ISO week
  const tempDate = new Date(target.valueOf());
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const firstThursday = tempDate.valueOf();
  tempDate.setMonth(0, 1);
  if (tempDate.getDay() !== 4) {
    tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000);
  
  return {
    weekId: `${yyyy}-W${String(weekNum).padStart(2, '0')}`,
    weekStart
  };
}

export function getDatesForWeek(weekStartStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(weekStartStr + 'T12:00:00');
  for (let i = 0; i < 5; i++) {
    const next = new Date(start.valueOf());
    next.setDate(start.getDate() + i);
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    const dd = String(next.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

export function splitTextIntoDays(text: string): string[] {
  if (!text) return Array(5).fill('');
  
  // Try custom markers first: [DIA 1] or [DIA-1] or [1] or [1º DIA]
  const regex = /\[(?:DIA\s*)?([1-5])\]/gi;
  const matches: { index: number; day: number; length: number }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      day: parseInt(match[1]),
      length: match[0].length
    });
  }

  if (matches.length > 0) {
    const parts: string[] = Array(5).fill('');
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const start = current.index + current.length;
      const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
      const content = text.slice(start, end).trim();
      const dayIdx = current.day - 1;
      if (dayIdx >= 0 && dayIdx < 5) {
        parts[dayIdx] = content;
      }
    }
    // Fill empty days with any overflow
    return parts;
  }

  // Fallback 1: split by paragraphs into 5 equal-ish parts
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length >= 5) {
    const parts: string[] = Array(5).fill('');
    const baseSize = Math.floor(paragraphs.length / 5);
    let extra = paragraphs.length % 5;
    
    let pIdx = 0;
    for (let d = 0; d < 5; d++) {
      const count = baseSize + (extra > 0 ? 1 : 0);
      extra--;
      parts[d] = paragraphs.slice(pIdx, pIdx + count).join('\n\n');
      pIdx += count;
    }
    return parts;
  }

  // Fallback 2: just split by sentences or return it in day 1 and empty for the rest
  const parts = Array(5).fill('');
  parts[0] = text;
  return parts;
}

export function formatDatePortuguese(dateStr: string): string {
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const date = new Date(dateStr + 'T12:00:00');
  const dayName = daysOfWeek[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${day} de ${monthName} de ${year}`;
}
