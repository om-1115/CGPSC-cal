export type ViewMode = 'day' | 'week' | 'month';

export interface Subject {
  id: string;
  name: string;
  custom?: boolean;
}

export interface SubjectGroup {
  label: string;
  items: Subject[];
}

export interface SubjectGroups {
  A: SubjectGroup;
  B: SubjectGroup;
}

export interface NoteEntry {
  did: string;
  plan: string;
}

export interface DayState {
  checked: Record<string, boolean>;
  notes: Record<string, NoteEntry>;
}

export interface DaysStore {
  [dateKey: string]: DayState;
}

export type ResourceType = 'pdf' | 'link';

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  url?: string;
  addedAt: number;
  tags: string[];
}

export interface DayStats {
  done: number;
  total: number;
  ratio: number;
  noteCount: number;
}

export interface HoverState {
  day: Date;
  subject: Subject;
  checked: boolean;
  did: string;
  plan: string;
  top: number;
  left: number;
}
