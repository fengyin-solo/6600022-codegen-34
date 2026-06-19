export type BoardState = number[][];

export interface Move {
  row: number;
  col: number;
  player: number; // 1=black, 2=white
  timestamp: number;
}

export interface GameRecord {
  id: string;
  moves: Move[];
  winner: number | null; // 0=draw, 1=black, 2=white, null=ongoing
  createdAt: string;
  duration: number;
}

export interface AIConfig {
  depth: number;
  enabled: boolean;
  playerColor: number; // AI plays as this color
}

export type GameStatus = 'idle' | 'playing' | 'finished' | 'replaying';

export interface WeeklyGoal {
  targetHands: number;
  targetWins: number;
  targetWinRate: number;
  startDate: string;
}

export interface WeeklyProgress {
  handsPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  weekStart: string;
  dailyRecords: DailyRecord[];
}

export interface DailyRecord {
  date: string;
  hands: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface PracticePlan {
  weeklyGoal: WeeklyGoal;
  weeklyProgress: WeeklyProgress;
  remindersEnabled: boolean;
  reminderTime: string;
  lastRemindedDate: string;
}

export interface ClearanceTask {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  type: 'hands' | 'wins' | 'winRate' | 'streak';
  reward: string;
}

export type ReminderType = 'daily' | 'weekly' | 'makeup';
