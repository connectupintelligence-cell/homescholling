export interface Epoch {
  id: string;
  number: number;
  name: string;
  type: 'letters' | 'math' | 'vacation' | 'advent';
  subType?: string;
  month: number; // 0-indexed: 0 for January, 11 for December
  description: string;
  subjects: string[];
}

export interface ActivityPhotos {
  verso?: string[];
  mythology?: string[];
  cursive?: string[];
  exercise?: string[];
  drawing?: string[];
  afternoon?: string[];
  extra?: string[];
}

export interface DailyPlanning {
  date: string; // YYYY-MM-DD
  activeEpochId: string;
  // Content values
  mythologyText: string; // From the weekly file or specific input
  mythologyReflection: string;
  mythologyRead: boolean;
  cursiveLetter: string;
  epochExercise: string;
  drawingTheme: string;
  extraActivity: string; // Ditado (Tue/Thu) or Produção de Texto (Mon/Wed/Fri)
  afternoonActivity: string; // Visual Arts, Manual Works, Music, English, etc.
  freePlay: boolean;
  bookReading: string;
  
  // Photos stored as base64 or Object URLs
  photos: ActivityPhotos;
}

export interface WeeklyMythology {
  id: string; // e.g. "2026-W28"
  weekStart: string; // YYYY-MM-DD of Monday
  fullText: string;
  dailyParts: string[]; // 5 parts for Mon-Fri
}

export interface ReadingBook {
  title: string;
  author: string;
  phase: string;
  isRead: boolean;
}

export interface DriveConfig {
  clientId: string;
  apiKey: string;
  folderId: string;
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
  lastSync: string | null;
}
