import { useState } from 'react';
import type { DaysStore, SubjectGroups, HoverState } from '../types';
import { dKey, startOfWeek, WEEKDAY_SHORT, MONTH_LONG } from '../lib/dates';
import { dayStatsFromState } from '../lib/dayStats';
import { WgTooltip } from './WgTooltip';

interface Props {
  viewDate: Date;
  today: Date;
  days: DaysStore;
  subjects: SubjectGroups;
  onPickDay: (d: Date) => void;
}

export function WeekView({ viewDate, today, days, subjects, onPickDay }: Props) {
  const weekStart = startOfWeek(viewDate);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const todayKey = dKey(today);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const headerLabel = sameMonth
    ? `${MONTH_LONG[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    : `${MONTH_LONG[weekStart.getMonth()].slice(0, 3)} ${weekStart.getDate()} – ${MONTH_LONG[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  const totalSubjects = subjects.A.items.length + subjects.B.items.length;
  const stats = week.map((d) => dayStatsFromState(days[dKey(d)], totalSubjects));

  const [hover, setHover] = useState<HoverState | null>(null);

  const onCellEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    day: Date,
    subject: { id: string; name: string },
    ds: DaysStore[string] | undefined,
  ) => {
    const checked = !!(ds?.checked?.[subject.id]);
    const note = ds?.notes?.[subject.id] ?? { did: '', plan: '' };
    const did = (note.did ?? '').trim();
    const plan = (note.plan ?? '').trim();
    if (!checked && !did && !plan) return;
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ day, subject, checked, did, plan, top: r.top, left: r.left + r.width / 2 });
  };

  return (
    <div className="cal-week">
      <div className="cal-week-head">
        <div className="month-title">
          <span className="m-name">{headerLabel}</span>
        </div>
        <div className="month-agg">
          <span><b>{stats.reduce((a, s) => a + s.done, 0)}</b> subjects studied</span>
          <span className="dot-sep" />
          <span><b>{stats.filter((s) => s.done > 0).length}</b> active days</span>
        </div>
      </div>

      <div className="week-strip">
        {week.map((d, i) => {
          const k = dKey(d);
          const isToday = k === todayKey;
          const isFuture = d > today;
          const s = stats[i];
          return (
            <button
              key={k}
              className={`week-day${isToday ? ' today' : ''}${isFuture ? ' future' : ''}`}
              onClick={() => onPickDay(d)}
            >
              <div className="wd-head">
                <span className="wd-name">{WEEKDAY_SHORT[d.getDay()]}</span>
                <span className="wd-num">{d.getDate()}</span>
              </div>
              <div className="wd-bar">
                <i style={{ width: `${s.ratio * 100}%` }} />
              </div>
              <div className="wd-meta">
                {s.done}<span className="muted"> / {s.total}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="week-grid">
        <div className="wg-corner" />
        {week.map((d) => (
          <div
            key={'h' + dKey(d)}
            className={`wg-col-h${dKey(d) === todayKey ? ' today' : ''}`}
          >
            <span className="wd-name">{WEEKDAY_SHORT[d.getDay()].slice(0, 1)}</span>
            <span className="wd-num">{d.getDate()}</span>
          </div>
        ))}

        {(['A', 'B'] as const).map((g) => (
          <>
            <div key={`gl-${g}`} className="wg-group-label">{subjects[g].label}</div>
            <div key={`gr-${g}`} className="wg-group-row" />
            {subjects[g].items.map((s) => (
              <>
                <div key={`ws-${s.id}`} className="wg-subj">{s.name}</div>
                {week.map((d) => {
                  const k = dKey(d);
                  const ds = days[k];
                  const checked = !!(ds?.checked?.[s.id]);
                  const hasNote = !!(
                    ds?.notes?.[s.id] &&
                    (ds.notes[s.id].did?.trim() || ds.notes[s.id].plan?.trim())
                  );
                  const isFuture = d > today;
                  return (
                    <button
                      key={k + s.id}
                      className={[
                        'wg-cell',
                        checked ? 'on' : '',
                        isFuture ? 'future' : '',
                        dKey(d) === todayKey ? 'col-today' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => onPickDay(d)}
                      onMouseEnter={(e) => onCellEnter(e, d, s, ds)}
                      onMouseLeave={() => setHover(null)}
                      aria-label={`${s.name} on ${d.toDateString()}: ${checked ? 'done' : 'not done'}`}
                    >
                      {checked && (
                        <svg viewBox="0 0 12 12" width="11" height="11">
                          <path d="M2.5 6.3 L5 8.6 L9.5 3.6" stroke="#fff"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      )}
                      {!checked && hasNote && <span className="wg-note-dot" />}
                    </button>
                  );
                })}
              </>
            ))}
          </>
        ))}
      </div>

      {hover && <WgTooltip {...hover} />}
    </div>
  );
}
