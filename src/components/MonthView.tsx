import type { DaysStore } from '../types';
import { dKey, startOfMonth, daysInMonth, WEEKDAY_NARROW, MONTH_LONG } from '../lib/dates';
import { dayStatsFromState } from '../lib/dayStats';

interface Props {
  viewDate: Date;
  today: Date;
  days: DaysStore;
  totalSubjects: number;
  onPickDay: (d: Date) => void;
}

export function MonthView({ viewDate, today, days, totalSubjects, onPickDay }: Props) {
  const monthStart = startOfMonth(viewDate);
  const firstWeekdayOffset = monthStart.getDay();
  const dim = daysInMonth(viewDate);

  const cells: { date: Date; outOfMonth?: boolean }[] = [];
  for (let i = 0; i < firstWeekdayOffset; i++) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (firstWeekdayOffset - i));
    cells.push({ date: d, outOfMonth: true });
  }
  for (let i = 1; i <= dim; i++) {
    cells.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth(), i) });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last); d.setDate(d.getDate() + 1);
    cells.push({ date: d, outOfMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last); d.setDate(d.getDate() + 1);
    cells.push({ date: d, outOfMonth: true });
  }

  const todayKey = dKey(today);

  const monthAgg = cells
    .filter((c) => !c.outOfMonth)
    .reduce(
      (acc, c) => {
        const s = dayStatsFromState(days[dKey(c.date)], totalSubjects);
        acc.done += s.done;
        acc.studiedDays += s.done > 0 ? 1 : 0;
        acc.fullDays += s.done === totalSubjects && s.done > 0 ? 1 : 0;
        return acc;
      },
      { done: 0, studiedDays: 0, fullDays: 0 },
    );

  return (
    <div className="cal-month">
      <div className="cal-month-head">
        <div className="month-title">
          <span className="m-name">{MONTH_LONG[viewDate.getMonth()]}</span>
          <span className="m-year">{viewDate.getFullYear()}</span>
        </div>
        <div className="month-agg">
          <span><b>{monthAgg.studiedDays}</b> study days</span>
          <span className="dot-sep" />
          <span><b>{monthAgg.done}</b> subjects completed</span>
          <span className="dot-sep" />
          <span><b>{monthAgg.fullDays}</b> full days</span>
        </div>
      </div>

      <div className="cal-grid-head">
        {WEEKDAY_NARROW.map((d, i) => (
          <div key={i} className="cal-dow">{d}</div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((c, i) => {
          const k = dKey(c.date);
          const stats = dayStatsFromState(days[k], totalSubjects);
          const isToday = k === todayKey;
          const isFuture = c.date > today;
          const cls = [
            'cal-cell',
            c.outOfMonth ? 'out' : '',
            isToday ? 'today' : '',
            isFuture ? 'future' : '',
            stats.done === totalSubjects && stats.done > 0 ? 'full' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={i}
              className={cls}
              style={{
                '--fill': stats.ratio > 0 ? `${0.06 + stats.ratio * 0.34}` : '0',
              } as React.CSSProperties}
              onClick={() => onPickDay(c.date)}
              title={`${c.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}\n${stats.done}/${stats.total} subjects`}
            >
              <span className="cal-num">{c.date.getDate()}</span>
              {!c.outOfMonth && stats.done > 0 && (
                <span className="cal-meta">{stats.done}/{stats.total}</span>
              )}
              {!c.outOfMonth && stats.noteCount > 0 && (
                <span className="cal-note-dot" title={`${stats.noteCount} notes`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="cal-legend">
        <span>Less</span>
        <i style={{ background: 'color-mix(in oklab, var(--accent) 0%, transparent)' }} />
        <i style={{ background: 'color-mix(in oklab, var(--accent) 14%, transparent)' }} />
        <i style={{ background: 'color-mix(in oklab, var(--accent) 26%, transparent)' }} />
        <i style={{ background: 'color-mix(in oklab, var(--accent) 40%, transparent)' }} />
        <span>More</span>
      </div>
    </div>
  );
}
