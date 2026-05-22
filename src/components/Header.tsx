import type { ViewMode } from '../types';
import { fmtRel, startOfWeek } from '../lib/dates';
import { FlameIcon } from './FlameIcon';
import { ViewSwitch } from './ViewSwitch';
import { ScopeNav } from './ScopeNav';

interface Props {
  viewDate: Date;
  today: Date;
  isToday: boolean;
  streak: number;
  dayNumber: number;
  dateFont: 'serif' | 'sans';
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  userEmail: string;
  onSignOut: () => void;
}

export function Header({
  viewDate, today, isToday, streak, dayNumber, dateFont,
  view, onViewChange, onPrev, onNext, onToday,
  userEmail, onSignOut,
}: Props) {
  const weekday = viewDate.toLocaleDateString('en-GB', { weekday: 'long' });
  const datePart = `${viewDate.getDate()} ${viewDate.toLocaleDateString('en-GB', { month: 'long' })} ${viewDate.getFullYear()}`;

  let headingNode: React.ReactNode;
  if (view === 'day') {
    headingNode = (
      <h1 className={`date-heading${dateFont === 'sans' ? ' sans' : ''}`}>
        <span className="weekday">{weekday}, </span>{datePart}
      </h1>
    );
  } else if (view === 'week') {
    const ws = startOfWeek(viewDate);
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    const sameMonth = ws.getMonth() === we.getMonth();
    const label = sameMonth
      ? `${ws.toLocaleDateString(undefined, { month: 'long' })} ${ws.getDate()} – ${we.getDate()}`
      : `${ws.toLocaleDateString(undefined, { month: 'short' })} ${ws.getDate()} – ${we.toLocaleDateString(undefined, { month: 'short' })} ${we.getDate()}`;
    headingNode = (
      <h1 className={`date-heading scope-heading${dateFont === 'sans' ? ' sans' : ''}`}>
        {label}
      </h1>
    );
  } else {
    headingNode = (
      <h1 className={`date-heading scope-heading${dateFont === 'sans' ? ' sans' : ''}`}>
        {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
      </h1>
    );
  }

  const eyebrow = view === 'day'
    ? <>{isToday && <span className="today-dot" />}{fmtRel(viewDate, today)} · Day {dayNumber} of prep</>
    : view === 'week'
      ? <>Week view · Day {dayNumber} of prep</>
      : <>Month view · Day {dayNumber} of prep</>;

  return (
    <header className="header">
      <div className="header-left">
        <div className="date-eyebrow">{eyebrow}</div>
        {headingNode}
      </div>
      <div className="header-right">
        {streak > 0 && (
          <div className="streak-pill" title={`${streak}-day study streak`}>
            <FlameIcon />
            {streak}-day streak
          </div>
        )}
        <div className="nav-row">
          <ViewSwitch value={view} onChange={onViewChange} />
          <ScopeNav
            view={view}
            viewDate={viewDate}
            today={today}
            onPrev={onPrev}
            onNext={onNext}
            onToday={onToday}
          />
          <button
            className="signout-btn"
            onClick={onSignOut}
            title={`Signed in as ${userEmail}`}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
