import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ViewMode, SubjectGroups, DaysStore, Resource } from './types';
import { dKey, addDays, parseKey } from './lib/dates';
import { loadJSON, saveJSON, LS_KEYS } from './lib/storage';
import { computeStreak } from './lib/streak';
import { SUBJECTS } from './lib/subjects';
import {
  loadDayEntries, loadResourcesFromDB,
  upsertEntry, insertResource, deleteResourceFromDB,
} from './lib/db';
import { Header } from './components/Header';
import { SubjectRow } from './components/SubjectRow';
import { AddSubjectRow } from './components/AddSubjectRow';
import { Uploader } from './components/Uploader';
import { FilterBar } from './components/FilterBar';
import { ResourceCard } from './components/ResourceCard';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { Toast } from './components/Toast';
import type { ToastItem } from './components/Toast';

interface AppProps { userId: string; userEmail: string; onSignOut: () => void; }

export default function App({ userId, userEmail, onSignOut }: AppProps) {
  const [today, setToday] = useState<Date>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });

  useEffect(() => {
    const onFocus = () => {
      const d = new Date(); d.setHours(0, 0, 0, 0);
      if (dKey(d) !== dKey(today)) setToday(d);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [today]);

  const [viewDate, setViewDate] = useState<Date>(today);
  const [view, setView] = useState<ViewMode>('day');
  const viewKey = dKey(viewDate);
  const isToday = dKey(viewDate) === dKey(today);

  const goPrev = () => {
    if (view === 'day')   setViewDate((d) => addDays(d, -1));
    if (view === 'week')  setViewDate((d) => addDays(d, -7));
    if (view === 'month') setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, Math.min(d.getDate(), 28)));
  };
  const goNext = () => {
    if (view === 'day')   setViewDate((d) => addDays(d, 1));
    if (view === 'week')  setViewDate((d) => addDays(d, 7));
    if (view === 'month') setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, Math.min(d.getDate(), 28)));
  };
  const goCurrent = () => setViewDate(today);
  const pickDay = (d: Date) => { setViewDate(d); setView('day'); };

  // ── Local state ────────────────────────────────────────────────────────
  // days starts from localStorage (fast start); Supabase overwrites per-date on navigation
  const [days, setDays] = useState<DaysStore>(() => loadJSON<DaysStore>(LS_KEYS.days, {}));

  const [resources, setResources] = useState<Resource[]>(() =>
    loadJSON<Resource[]>(LS_KEYS.resources, []));

  // subjects: custom additions live in localStorage; base list is SUBJECTS
  const [subjects, setSubjects] = useState<SubjectGroups>(() =>
    loadJSON<SubjectGroups>(LS_KEYS.subjects, SUBJECTS));

  useEffect(() => { saveJSON(LS_KEYS.days, days); }, [days]);
  useEffect(() => { saveJSON(LS_KEYS.resources, resources); }, [resources]);
  useEffect(() => { saveJSON(LS_KEYS.subjects, subjects); }, [subjects]);

  // ── Toast ──────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = useCallback((msg: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  // ── Supabase sync ─────────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'synced' | 'offline'>('connecting');
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const daysRef = useRef(days);
  useEffect(() => { daysRef.current = days; }, [days]);

  // Load resources once on mount
  useEffect(() => {
    loadResourcesFromDB(userId)
      .then((dbRes) => { if (dbRes.length > 0) setResources(dbRes); })
      .catch(() => showToast('Could not load resources — check your connection.'));
  }, [userId]);

  // Per-date fetch for day view — fires on mount and on every date navigation
  useEffect(() => {
    if (view !== 'day') return;
    if (!daysRef.current[viewKey]) setIsLoadingDay(true);
    setSyncStatus('connecting');
    loadDayEntries(userId, viewKey)
      .then((state) => {
        setDays((prev) => ({ ...prev, [viewKey]: state }));
        setSyncStatus('synced');
      })
      .catch(() => {
        setSyncStatus('offline');
        showToast('Could not load entries — working from local cache.');
      })
      .finally(() => setIsLoadingDay(false));
  }, [userId, viewKey, view]);

  // ── "Saved" flash indicator ────────────────────────────────────────────
  const [showSaved, setShowSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashSaved = useCallback(() => {
    setShowSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setShowSaved(false), 1800);
  }, []);

  // subject id → { name, part } lookup
  const subjectMeta = useMemo(() => {
    const map = new Map<string, { name: string; part: string }>();
    subjects.A.items.forEach((s) => map.set(s.id, { name: s.name, part: 'A' }));
    subjects.B.items.forEach((s) => map.set(s.id, { name: s.name, part: 'B' }));
    return map;
  }, [subjects]);

  // ── Subject management ─────────────────────────────────────────────────
  const renameSubject = (id: string, newName: string) => {
    const name = newName.trim();
    if (!name) return;
    setSubjects((cur) => {
      let oldName: string | null = null;
      const next: SubjectGroups = {
        A: { ...cur.A, items: cur.A.items.map((s) => { if (s.id === id) { oldName = s.name; return { ...s, name }; } return s; }) },
        B: { ...cur.B, items: cur.B.items.map((s) => { if (s.id === id) { oldName = s.name; return { ...s, name }; } return s; }) },
      };
      if (oldName && oldName !== name) {
        setResources((rs) => rs.map((r) => ({
          ...r,
          tags: (r.tags ?? []).map((t) => (t === oldName ? name : t)),
        })));
      }
      return next;
    });
  };

  const addSubject = (groupKey: 'A' | 'B', name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    setSubjects((cur) => ({
      ...cur,
      [groupKey]: { ...cur[groupKey], items: [...cur[groupKey].items, { id, name: trimmed, custom: true }] },
    }));
  };

  const [firstDate] = useState<string>(() => {
    const stored = localStorage.getItem(LS_KEYS.firstDate);
    if (stored) return stored;
    const allKeys = Object.keys(loadJSON<DaysStore>(LS_KEYS.days, {}));
    const earliest = allKeys.length ? allKeys.sort()[0] : dKey(today);
    localStorage.setItem(LS_KEYS.firstDate, earliest);
    return earliest;
  });

  // ── Day state helpers ──────────────────────────────────────────────────
  const dayState = days[viewKey] ?? { checked: {}, notes: {} };

  const setDayState = useCallback((updater: (cur: typeof dayState) => typeof dayState) => {
    setDays((prev) => {
      const cur = prev[viewKey] ?? { checked: {}, notes: {} };
      return { ...prev, [viewKey]: updater(cur) };
    });
  }, [viewKey]);

  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const toggleCheck = (id: string) => {
    const cur = daysRef.current[viewKey] ?? { checked: {}, notes: {} };
    const newVal = !cur.checked[id];
    setDayState((c) => ({ ...c, checked: { ...c.checked, [id]: newVal } }));

    if (userId) {
      const meta = subjectMeta.get(id);
      if (meta) {
        const notes = cur.notes[id] ?? { did: '', plan: '' };
        upsertEntry(userId, viewKey, id, meta.name, meta.part, newVal, notes.did, notes.plan)
          .then((ok) => { if (ok) flashSaved(); else showToast('Failed to save — check your connection.'); });
      }
    }
  };

  const setNote = (id: string, field: 'did' | 'plan', val: string) => {
    setDayState((cur) => ({
      ...cur,
      notes: { ...cur.notes, [id]: { ...(cur.notes[id] ?? { did: '', plan: '' }), [field]: val } },
    }));

    if (userId) {
      const timerKey = `${viewKey}-${id}`;
      clearTimeout(noteTimers.current[timerKey]);
      noteTimers.current[timerKey] = setTimeout(() => {
        const snap = daysRef.current[viewKey] ?? { checked: {}, notes: {} };
        const meta = subjectMeta.get(id);
        if (meta) {
          const notes = { ...(snap.notes[id] ?? { did: '', plan: '' }), [field]: val };
          upsertEntry(userId, viewKey, id, meta.name, meta.part, !!snap.checked[id], notes.did, notes.plan)
            .then((ok) => { if (ok) flashSaved(); else showToast('Failed to save — check your connection.'); });
        }
      }, 600);
    }
  };

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggleExpand = (id: string) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalSubjects = subjects.A.items.length + subjects.B.items.length;
  const doneCount = Object.values(dayState.checked ?? {}).filter(Boolean).length;

  const streak = useMemo(() => computeStreak(days, today), [days, today]);
  const dayNumber = useMemo(() => {
    const start = parseKey(firstDate); start.setHours(0, 0, 0, 0);
    return Math.max(1, Math.round((today.getTime() - start.getTime()) / 86400000) + 1);
  }, [firstDate, today]);

  // ── Resources ──────────────────────────────────────────────────────────
  const [activeTag, setActiveTag] = useState('All');
  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    resources.forEach((r) => (r.tags ?? []).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return m;
  }, [resources]);
  const allSubjectTags = useMemo(
    () => [...subjects.A.items, ...subjects.B.items].map((s) => s.name),
    [subjects],
  );
  const visibleResources = activeTag === 'All'
    ? resources
    : resources.filter((r) => (r.tags ?? []).includes(activeTag));

  const addResource = (r: Omit<Resource, 'id' | 'addedAt'>) => {
    const resource: Resource = {
      id: `r${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      addedAt: Date.now(),
      ...r,
    };
    setResources((cur) => [resource, ...cur]);
    if (userId) {
      insertResource(userId, resource)
        .then((ok) => { if (!ok) showToast('Resource saved locally but failed to sync — try again later.'); });
    }
  };

  const removeResource = (id: string) => {
    setResources((cur) => cur.filter((r) => r.id !== id));
    if (userId) {
      deleteResourceFromDB(id)
        .then((ok) => { if (!ok) showToast('Could not delete from database — removed locally.'); });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <Header
        viewDate={viewDate}
        today={today}
        isToday={isToday}
        streak={streak}
        dayNumber={dayNumber}
        dateFont="serif"
        view={view}
        onViewChange={setView}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goCurrent}
        userEmail={userEmail}
        onSignOut={onSignOut}
      />

      {view === 'month' && (
        <MonthView
          viewDate={viewDate}
          today={today}
          days={days}
          totalSubjects={totalSubjects}
          onPickDay={pickDay}
        />
      )}

      {view === 'week' && (
        <WeekView
          viewDate={viewDate}
          today={today}
          days={days}
          subjects={subjects}
          onPickDay={pickDay}
        />
      )}

      {view === 'day' && (
        <div className="layout">
          <main>
            <div className="section-h">
              <h2>Today's Subjects</h2>
              <div className="section-h-right">
                <span className={`save-chip${showSaved ? ' show' : ''}`}>✓ Saved</span>
                <span className="meta">{doneCount} / {totalSubjects} complete</span>
              </div>
            </div>
            <div className="progress">
              <i style={{ width: `${(doneCount / totalSubjects) * 100}%` }} />
            </div>

            {isLoadingDay ? (
              <div className="skeleton-list">
                {[65, 80, 55, 72, 60, 85, 50, 68].map((w, i) => (
                  <div key={i} className="skeleton-row">
                    <div className="skeleton skeleton-check" />
                    <div className="skeleton skeleton-text" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            ) : (
              (['A', 'B'] as const).map((groupKey) => {
                const group = subjects[groupKey];
                return (
                  <div key={groupKey}>
                    <div className="group-label">{group.label}</div>
                    <div className="subjects">
                      {group.items.map((s) => (
                        <SubjectRow
                          key={s.id}
                          subject={s}
                          checked={!!(dayState.checked?.[s.id])}
                          notes={dayState.notes?.[s.id] ?? { did: '', plan: '' }}
                          expanded={expanded.has(s.id)}
                          onToggleCheck={() => toggleCheck(s.id)}
                          onToggleExpand={() => toggleExpand(s.id)}
                          onNote={(field, val) => setNote(s.id, field, val)}
                          onRename={(newName) => renameSubject(s.id, newName)}
                        />
                      ))}
                      <AddSubjectRow
                        placeholder={`Add a subject to ${groupKey === 'A' ? 'Part A' : 'Part B'}…`}
                        onAdd={(name) => addSubject(groupKey, name)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </main>

          <aside>
            <div className="section-h">
              <h2>Resources</h2>
              <div className="meta">
                {resources.length} {resources.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            <Uploader userId={userId} subjects={allSubjectTags} onAdd={addResource} />

            <FilterBar
              counts={tagCounts}
              active={activeTag}
              onChange={setActiveTag}
            />

            {visibleResources.length === 0 ? (
              <div className="empty">
                {resources.length === 0
                  ? 'No resources yet. Upload a PDF or add a link to get started.'
                  : `No resources tagged "${activeTag}".`}
              </div>
            ) : (
              <div className="resources-list">
                {visibleResources.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    onRemove={() => removeResource(r.id)}
                    onTagClick={(tag) => setActiveTag(tag)}
                  />
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      <div className="footer-note">
        {syncStatus === 'synced' && 'Synced · '}
        {syncStatus === 'connecting' && 'Loading… · '}
        {syncStatus === 'offline' && 'Offline · '}
        CGPSC Prelims Paper 1
      </div>

      <Toast items={toasts} />
    </div>
  );
}
