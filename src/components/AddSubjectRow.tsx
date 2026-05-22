import { useEffect, useRef, useState } from 'react';

interface Props {
  placeholder: string;
  onAdd: (name: string) => void;
}

export function AddSubjectRow({ placeholder, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const submit = () => {
    const t = val.trim();
    if (t) { onAdd(t); setVal(''); setOpen(false); }
  };

  return (
    <div className="add-subject">
      {open ? (
        <div className="add-subject-input-row">
          <span className="plus-mark">+</span>
          <input
            ref={inputRef}
            className="add-subject-input"
            value={val}
            placeholder={placeholder}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              else if (e.key === 'Escape') { setOpen(false); setVal(''); }
            }}
            onBlur={() => { if (!val.trim()) setOpen(false); }}
          />
          <button
            type="button"
            className="u-btn add-btn"
            onMouseDown={(e) => { e.preventDefault(); submit(); }}
          >
            Add
          </button>
        </div>
      ) : (
        <button type="button" className="add-subject-trigger" onClick={() => setOpen(true)}>
          <span className="plus-mark">+</span>
          {placeholder}
        </button>
      )}
    </div>
  );
}
