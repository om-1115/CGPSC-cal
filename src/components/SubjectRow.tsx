import { useEffect, useRef, useState } from 'react';
import type { Subject, NoteEntry } from '../types';

interface Props {
  subject: Subject;
  checked: boolean;
  notes: NoteEntry;
  expanded: boolean;
  onToggleCheck: () => void;
  onToggleExpand: () => void;
  onNote: (field: 'did' | 'plan', val: string) => void;
  onRename: (newName: string) => void;
}

export function SubjectRow({
  subject, checked, notes, expanded,
  onToggleCheck, onToggleExpand, onNote, onRename,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(subject.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(subject.name); }, [subject.name]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(subject.name);
    setEditing(true);
  };
  const commit = () => {
    const t = draft.trim();
    if (t && t !== subject.name) onRename(t);
    setEditing(false);
  };
  const cancel = () => { setDraft(subject.name); setEditing(false); };

  const cls = [
    'subject',
    checked ? 'done' : '',
    expanded ? 'expanded' : '',
    editing ? 'editing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <div className="subject-row" onClick={editing ? undefined : onToggleExpand}>
        <button
          type="button"
          className="check"
          aria-label={checked ? 'Mark as not done' : 'Mark as done'}
          aria-pressed={checked}
          onClick={(e) => { e.stopPropagation(); onToggleCheck(); }}
        >
          <svg viewBox="0 0 14 14" fill="none">
            <path d="M3 7.4 L5.8 10 L11 4.2"
                  stroke="#fff" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {editing ? (
          <input
            ref={inputRef}
            className="name name-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              else if (e.key === 'Escape') cancel();
            }}
            onBlur={commit}
          />
        ) : (
          <span className="name">{subject.name}</span>
        )}

        {!editing && (
          <button
            type="button"
            className="subj-edit"
            aria-label="Rename subject"
            onClick={startEdit}
            title="Rename"
          >
            <svg viewBox="0 0 14 14" width="13" height="13" fill="none">
              <path d="M2 12 L2.4 9.5 L9.4 2.6 L11.4 4.6 L4.5 11.6 Z"
                    stroke="currentColor" strokeWidth="1.3"
                    strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M8.4 3.5 L10.4 5.5" stroke="currentColor" strokeWidth="1.3"
                    strokeLinecap="round"/>
            </svg>
          </button>
        )}

        <span className="chev" aria-hidden="true">
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
            <path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="currentColor"
                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="subject-panel">
        <div className="subject-panel-inner">
          <div className="notes">
            <div className="note-field did">
              <label><span className="dot" />What I did today</label>
              <textarea
                rows={3}
                value={notes.did}
                onChange={(e) => onNote('did', e.target.value)}
                placeholder="e.g., Read NCERT Ch. 4, made notes on Revolt of 1857"
              />
            </div>
            <div className="note-field plan">
              <label><span className="dot" />Plan for tomorrow</label>
              <textarea
                rows={3}
                value={notes.plan}
                onChange={(e) => onNote('plan', e.target.value)}
                placeholder="e.g., Revise + practice 20 MCQs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
