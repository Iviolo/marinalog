
export type LogType = 
  | 'ordinaria' 
  | 'legge937' 
  | 'malattia' 
  | 'guardia' 
  | 'recupero' 
  | 'permesso' 
  | 'straordinario'
  | 'custom'
  | 'rettifica';

export interface CustomField {
  id: string;
  name: string;
  unit: 'giorni' | 'ore';
  balanceEffect: 'add' | 'subtract' | 'none';
  initialBalance?: number;
  color: string;
}

export interface LogEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  type: LogType;
  customFieldId?: string;
  targetBalance?: string;
  quantity: number; 
  moneyAccrued: number; 
  startTime?: string;
  endTime?: string;
  notes: string;
  timestamp: number;
  isPaid?: boolean;
  expiryDate?: string; // Data di scadenza del recupero (es. 2026-12-31)
}

export interface WorkLogEntry {
  id: string;
  date: string;
  boatName: string;
  workType: 'Manutenzione' | 'Pulizia' | 'Riparazione' | 'Ispezione' | 'Altro';
  description: string;
  hours: number;
  notes?: string;
  timestamp: number;
}

export interface AppState {
  balances: {
    ordinaria: number;
    legge937: number;
    malattia: number;
    hoursBank: number;
    moneyBank: number;
    recuperiMaturati: number; // Giorni di recupero da GNL/CFG
    [key: string]: number;
  };
  history: LogEntry[];
  workLogs: WorkLogEntry[];
  customFields: CustomField[];
  user: {
    name: string;
    rank: string;
    avatarUrl?: string;
  };
}

export const INITIAL_STATE: AppState = {
  balances: {
    ordinaria: 39,
    legge937: 4,
    malattia: 45,
    hoursBank: 0,
    moneyBank: 0,
    recuperiMaturati: 0,
  },
  history: [],
  workLogs: [],
  customFields: [],
  user: {
    name: "Livio Cerasoli",
    rank: "SC Aiutante",
    avatarUrl: "https://i.imgur.com/YYHCIbj.png",
  }
};
