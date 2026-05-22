import type { ViewMode } from '../types';

interface Props {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}

const OPTS: { v: ViewMode; l: string }[] = [
  { v: 'day', l: 'Day' },
  { v: 'week', l: 'Week' },
  { v: 'month', l: 'Month' },
];

export function ViewSwitch({ value, onChange }: Props) {
  return (
    <div className="view-switch" role="tablist" aria-label="View">
      {OPTS.map((o) => (
        <button
          key={o.v}
          role="tab"
          aria-selected={value === o.v}
          className={value === o.v ? 'is-active' : ''}
          onClick={() => onChange(o.v)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
