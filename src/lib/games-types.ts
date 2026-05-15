export type GameStatus = 'open' | 'closed';

export interface Game {
  id: string;
  player_id: string;
  coach_id: string;
  date: string;
  opponent: string;
  video_url: string | null;
  status: GameStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface GameTag {
  id: string;
  game_id: string;
  quarter: number;
  minute: number;
  video_timestamp_seconds: number | null;
  score: number;
  type: string;
  description: string;
  created_at: string;
}

export interface GameTagInput {
  quarter: number;
  minute: number;
  video_timestamp_seconds: number | null;
  score: number;
  type: string;
  description?: string;
}

export const TAG_TYPES: { value: string; label: string; defaultScore: number; color: string }[] = [
  { value: 'shot_made',       label: 'קליעה',         defaultScore:  1, color: 'bg-emerald-500' },
  { value: 'shot_missed',     label: 'החטאה',         defaultScore: -1, color: 'bg-red-500' },
  { value: 'assist',          label: 'אסיסט',         defaultScore:  1, color: 'bg-sky-500' },
  { value: 'rebound',         label: 'ריבאונד',       defaultScore:  1, color: 'bg-amber-500' },
  { value: 'steal',           label: 'גניבה',         defaultScore:  1, color: 'bg-indigo-500' },
  { value: 'block',           label: 'בלוק',          defaultScore:  1, color: 'bg-purple-500' },
  { value: 'turnover',        label: 'טורנובר',       defaultScore: -1, color: 'bg-rose-500' },
  { value: 'foul',            label: 'עבירה',         defaultScore: -1, color: 'bg-orange-500' },
  { value: 'good_defense',    label: 'הגנה טובה',     defaultScore:  1, color: 'bg-teal-500' },
  { value: 'off_ball_move',   label: 'תנועה ללא כדור', defaultScore:  0, color: 'bg-slate-500' },
];

export const TAG_TYPE_LABELS: Record<string, string> = TAG_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {}
);
