import { useState } from 'react';
import { PICKER_TAGS } from '../lib/mockData';

interface Props {
  label: string;
  onDone: (tags: string[]) => void;
  onCancel: () => void;
}

export function TagPicker({ label, onDone, onCancel }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');

  const toggle = (t: string) =>
    setSelected((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]);

  const submit = () => {
    const all = [...selected];
    const c = custom.trim();
    if (c && !all.includes(c)) all.push(c);
    onDone(all.length ? all : ['Untagged']);
  };

  return (
    <div className="tag-picker" onClick={(e) => e.stopPropagation()}>
      <div
        className="picker-h"
        style={{ color: 'var(--ink-2)', textTransform: 'none', letterSpacing: 0, fontSize: 12.5, fontWeight: 500 }}
      >
        Tag <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{label}</span>
      </div>
      <div className="picker-grid">
        {PICKER_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`chip small${selected.includes(tag) ? ' is-active' : ''}`}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="actions">
        <input
          className="custom-input"
          placeholder="…or type a custom tag"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button type="button" className="u-btn ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="u-btn" onClick={submit}>Save</button>
      </div>
    </div>
  );
}
