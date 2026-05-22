import { useEffect, useRef, useState } from 'react';

const CORRECT_PIN = '1115';
const LS_AUTH = 'cgpsc.pin.v1';

export function setAuthFlag() {
  localStorage.setItem(LS_AUTH, JSON.stringify({ authedAt: Date.now() }));
}

export function isAuthed(): boolean {
  try {
    const v = JSON.parse(localStorage.getItem(LS_AUTH) || 'null');
    return !!v?.authedAt;
  } catch { return false; }
}

export function clearAuth() {
  localStorage.removeItem(LS_AUTH);
}

interface Props { onAuth: () => void; }

export function LoginPage({ onAuth }: Props) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const attemptVerify = async (entered: string) => {
    if (verifying || entered.length < 4) return;
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 340));
    if (entered !== CORRECT_PIN) {
      setError('Incorrect PIN. Try again.');
      setPin(['', '', '', '']);
      setShake(true);
      setTimeout(() => { setShake(false); refs.current[0]?.focus(); }, 420);
      setVerifying(false);
      return;
    }
    setSuccess(true);
    setAuthFlag();
    await new Promise((r) => setTimeout(r, 280));
    onAuth();
  };

  const setCell = (i: number, val: string) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...pin]; next[i] = v;
    setPin(next);
    setError('');
    if (v && i < 3) {
      refs.current[i + 1]?.focus();
    } else if (v && i === 3) {
      // auto-submit when last digit is entered
      attemptVerify(next.join(''));
    }
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[i] && i > 0) {
        e.preventDefault();
        refs.current[i - 1]?.focus();
        setPin((cur) => { const n = [...cur]; n[i - 1] = ''; return n; });
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 3) {
      refs.current[i + 1]?.focus();
    } else if (e.key === 'Enter') {
      attemptVerify(pin.join(''));
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    if (!text) return;
    e.preventDefault();
    const next = ['', '', '', ''];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setPin(next);
    refs.current[Math.min(text.length, 3)]?.focus();
    setError('');
    if (text.length === 4) attemptVerify(next.join(''));
  };

  const verify = () => attemptVerify(pin.join(''));

  const filled = pin.filter(Boolean).length;

  return (
    <div className="lp-shell">
      {/* ── Brand pane ── */}
      <aside className="lp-brand">
        <div className="lp-brand-mark">
          <span className="lp-logo">C<span>·</span></span>
          CGPSC Prep
        </div>

        <div className="lp-brand-quote">
          <div className="lp-kicker">Daily study tracker · Paper 1</div>
          <blockquote className="lp-blockquote">
            The page you keep coming back to is the one that gets you through.
          </blockquote>
          <div className="lp-attrib">
            <b>Built for CGPSC aspirants</b> · stays out of your way
          </div>
        </div>

        <div className="lp-brand-foot">
          <div className="lp-stats">
            <span><b>16</b> subjects</span>
            <span><b>2</b> parts</span>
            <span><b>1</b> calm page</span>
          </div>
          <div>© CGPSC Tracker</div>
        </div>
      </aside>

      {/* ── Form pane ── */}
      <main className="lp-form-pane">
        <div className="lp-form-card">
          <div className={`lp-step${success ? ' lp-success' : ''}`}>
            <div className="lp-eyebrow">
              <span className="lp-step-dot" />
              PIN protected · Sign in
            </div>

            <h1 className="lp-title">
              {success ? 'Welcome back.' : 'Enter your\n4-digit PIN.'}
            </h1>
            <p className="lp-subtitle">
              {success
                ? 'Taking you in…'
                : 'This app is personal. Enter your PIN to continue.'}
            </p>

            <label className="lp-field-label">PIN</label>
            <div className={`lp-pin-row${shake ? ' lp-shake' : ''}`} onPaste={onPaste}>
              {pin.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  className={`lp-pin-cell${v ? ' lp-filled' : ''}${success ? ' lp-ok' : ''}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={(e) => setCell(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  onFocus={(e) => e.target.select()}
                  disabled={verifying || success}
                  aria-label={`PIN digit ${i + 1}`}
                />
              ))}
            </div>

            <div className="lp-error-msg">{error}&nbsp;</div>

            <button
              className="lp-submit-btn"
              disabled={verifying || success || filled < 4}
              onClick={verify}
            >
              {verifying
                ? <><span className="lp-spinner" /> Checking…</>
                : success
                  ? <>Signed in <CheckIcon /></>
                  : <>Continue <ArrowIcon /></>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M3 8H13M9 4l4 4-4 4" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
