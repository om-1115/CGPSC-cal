interface Props {
  counts: Map<string, number>;
  active: string;
  onChange: (tag: string) => void;
}

export function FilterBar({ counts, active, onChange }: Props) {
  const present = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);

  if (present.length === 0) return null;

  return (
    <div className="filter-bar">
      <button
        className={`chip${active === 'All' ? ' is-active' : ''}`}
        onClick={() => onChange('All')}
      >
        All
      </button>
      {present.map((t) => (
        <button
          key={t}
          className={`chip${active === t ? ' is-active' : ''}`}
          title={t}
          onClick={() => onChange(t)}
        >
          {t}<span className="count">{counts.get(t)}</span>
        </button>
      ))}
    </div>
  );
}
