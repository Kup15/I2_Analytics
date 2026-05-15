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
  second: number;
  video_timestamp_seconds: number | null;
  score: number;
  type: string;
  description: string;
  created_at: string;
}

export interface GameTagInput {
  quarter: number;
  minute: number;
  second: number;
  video_timestamp_seconds: number | null;
  score: number;
  type: string;
  description?: string;
}

export type TagGroup = 'offense' | 'general' | 'defense';

export interface TagType {
  value: string;          // stable identifier stored in DB
  code: string;           // short code shown on the button (e.g. 'P&R')
  description: string;    // full Hebrew description
  group: TagGroup;
  defaultScore: number;
}

// Rubric provided by the coaches (no per-category scoring rule yet).
// Default +1 across the board; long-press a button to override (-2..+2).
export const TAG_TYPES: TagType[] = [
  // התקפה — Offense
  { value: 'relocation',         code: 'R',    description: 'רילוקיישן — קרה/לא, איטי/מהיר',                                        group: 'offense', defaultScore: 1 },
  { value: 'pick_and_roll',      code: 'P&R',  description: 'פיק אנד רול — זוויות כניסה ויציאה, הדבקה, ריווח, קבלת החלטות',          group: 'offense', defaultScore: 1 },
  { value: 'decision_drive',     code: 'GDP',  description: 'קבלת החלטות בחדירה',                                                    group: 'offense', defaultScore: 1 },
  { value: 'shot_selection',     code: 'GDS',  description: 'קליעה — בחירת זריקות וכניסה לקליעה',                                    group: 'offense', defaultScore: 1 },
  { value: 'offensive_rebound',  code: 'OR',   description: 'הליכה לאופנס ריבאונד',                                                  group: 'offense', defaultScore: 1 },
  { value: 'pass',               code: 'PASS', description: 'מסירה — בזמן, מחוץ לגוף',                                              group: 'offense', defaultScore: 1 },
  { value: 'decision_catch',     code: 'GDC',  description: 'קבלת החלטות מתפיסה — להחליט לפני התפיסה ולבצע בחצי שניה',              group: 'offense', defaultScore: 1 },
  { value: 'ball_handling',      code: 'BL',   description: 'הובלת כדור — ראש מורם, כדרור רחוק, לא פספוס מסירות, הגעה למיקומים',   group: 'offense', defaultScore: 1 },
  { value: 'basket_threat',      code: 'BT',   description: 'איום לסל — איום בכל חדירה, אף פעם לא לרוחב',                            group: 'offense', defaultScore: 1 },

  // כללי — General
  { value: 'body_language',      code: 'BD',   description: 'שפת גוף',                                                               group: 'general', defaultScore: 1 },
  { value: 'sprint_intensity',   code: 'I',    description: '100% בספרינט להגנה / לעמדה ההתקפית',                                    group: 'general', defaultScore: 1 },

  // הגנה — Defense
  { value: 'on_ball_pressure',   code: 'AG',   description: 'אגרסיביות וקרבה לשחקן בהגנה האישית',                                    group: 'defense', defaultScore: 1 },
  { value: 'box_out',            code: 'CR',   description: 'סגירה לריבאונד',                                                        group: 'defense', defaultScore: 1 },
  { value: 'off_ball_defense',   code: 'OBD',  description: 'מיקומים בהגנה רחוק מהכדור',                                             group: 'defense', defaultScore: 1 },
  { value: 'passing_lane',       code: 'DL',   description: 'עמידה על קו המסירה — תמיד בין לבין',                                    group: 'defense', defaultScore: 1 },
  { value: 'defensive_stance',   code: 'DP',   description: 'כל הזמן נמוך עם הרגליים בעמדה הגנתית',                                  group: 'defense', defaultScore: 1 },
];

export const GROUP_META: Record<TagGroup, { label: string; chipClass: string; buttonClass: string; dotClass: string }> = {
  offense: {
    label:       'התקפה',
    chipClass:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    buttonClass: 'bg-amber-500/90 hover:bg-amber-500',
    dotClass:    'bg-amber-500',
  },
  general: {
    label:       'כללי',
    chipClass:   'bg-slate-500/15 text-slate-300 border-slate-500/30',
    buttonClass: 'bg-slate-500/90 hover:bg-slate-500',
    dotClass:    'bg-slate-400',
  },
  defense: {
    label:       'הגנה',
    chipClass:   'bg-sky-500/15 text-sky-400 border-sky-500/30',
    buttonClass: 'bg-sky-600/90 hover:bg-sky-600',
    dotClass:    'bg-sky-500',
  },
};

export const TAG_TYPES_BY_VALUE: Record<string, TagType> = TAG_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t }),
  {}
);

export const TAG_TYPES_BY_GROUP: Record<TagGroup, TagType[]> = TAG_TYPES.reduce(
  (acc, t) => {
    acc[t.group].push(t);
    return acc;
  },
  { offense: [] as TagType[], general: [] as TagType[], defense: [] as TagType[] }
);
