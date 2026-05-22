import type { ViewMode } from '../types';
import { dKey, startOfWeek } from '../lib/dates';

interface Props {
  view: ViewMode;
  viewDate: Date;
  today: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function ScopeNav({ view, viewDate, today, onPrev, onNext, onToday }: Props) {
  const isCurrentScope = (() => {
    if (view === 'day') return dKey(viewDate) === dKey(today);
    if (view === 'week') return dKey(startOfWeek(viewDate)) === dKey(startOfWeek(today));
    return viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
  })();

  const todayLabel = view === 'day' ? 'Today' : view === 'week' ? 'This week' : 'This month';

  return (
    <nav className="date-nav" aria-label="Navigate">
      <button onClick={onPrev} className="nav-arrow" aria-label="Previous">‹</button>
      <button
        onClick={onToday}
        className={`today-btn${isCurrentScope ? ' is-today' : ''}`}
      >
        {todayLabel}
      </button>
      <button onClick={onNext} className="nav-arrow" aria-label="Next">›</button>
    </nav>
  );
}
