import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { HoverState } from '../types';

type Props = HoverState;

export function WgTooltip({ day, subject, checked, did, plan, top, left }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({
    top: top - 10,
    left,
    opacity: 0,
    transform: 'translate(-50%, -100%)',
  });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const margin = 10;
    let l = left;
    let t = top - 10;
    let transform = 'translate(-50%, -100%)';
    if (top - r.height - 10 < margin) {
      t = top + 40;
      transform = 'translate(-50%, 0)';
    }
    const halfW = r.width / 2;
    const vw = window.innerWidth;
    if (l - halfW < margin) l = halfW + margin;
    if (l + halfW > vw - margin) l = vw - halfW - margin;
    setPos({ top: t, left: l, transform, opacity: 1 });
  }, [top, left]);

  const dateLabel = day.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return createPortal(
    <div ref={ref} className="wg-tooltip" style={pos} role="tooltip">
      <div className="wt-head">
        <span className="wt-subj">{subject.name}</span>
        <span className="wt-date">
          {dateLabel}
          {checked && <span className="wt-done" aria-label="completed">✓</span>}
        </span>
      </div>
      {did && (
        <div className="wt-block">
          <div className="wt-label"><span className="wt-dot" />What you did</div>
          <div className="wt-body">{did}</div>
        </div>
      )}
      {plan && (
        <div className="wt-block">
          <div className="wt-label"><span className="wt-dot plan" />Plan</div>
          <div className="wt-body">{plan}</div>
        </div>
      )}
      {!did && !plan && checked && (
        <div className="wt-empty">Marked done · no notes for this subject</div>
      )}
    </div>,
    document.body,
  );
}
