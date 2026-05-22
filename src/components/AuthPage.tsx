import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

type Step = 'email' | 'sent';

export function AuthPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const send = async () => {
    if (!emailValid || sending) return;
    setSending(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) { setError(error.message); return; }
    setStep('sent');
  };

  const reset = () => { setStep('email'); setEmail(''); setError(''); };

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

          {step === 'email' && (
            <div className="lp-step" key="email">
              <div className="lp-eyebrow">
                <span className="lp-step-dot" />
                Sign in · Passwordless
              </div>

              <h1 className="lp-title">Sign in to your<br />tracker.</h1>
              <p className="lp-subtitle">
                Enter your email — we'll send a one-click magic link. No password needed.
              </p>

              <label className="lp-field-label" htmlFor="auth-email">Email address</label>
              <div className="auth-input-wrap">
                <input
                  id="auth-email"
                  ref={inputRef}
                  className="auth-email-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <div style={{ height: error ? 16 : 24 }} />

              <button
                className="lp-submit-btn"
                disabled={!emailValid || sending}
                onClick={send}
              >
                {sending
                  ? <><span className="lp-spinner" /> Sending…</>
                  : <>Send magic link <ArrowIcon /></>}
              </button>

              <p className="lp-help">
                We'll email you a secure link — click it to sign in instantly. Works on any device.
              </p>
            </div>
          )}

          {step === 'sent' && (
            <div className="lp-step" key="sent">
              <div className="lp-eyebrow">
                <span className="lp-step-dot" style={{ background: '#2D7A4F' }} />
                Magic link sent
              </div>

              <h1 className="lp-title">Check your<br />inbox.</h1>
              <p className="lp-subtitle">
                We sent a sign-in link to{' '}
                <span className="auth-email-echo">{email.trim()}</span>.
                Click it to continue — the link expires in 1 hour.
              </p>

              <div className="auth-sent-box">
                <MailIcon />
                <span>Open your email app, find the message from CGPSC Tracker, and click <b>Sign in</b>.</span>
              </div>

              <div style={{ height: 28 }} />

              <button className="lp-submit-btn lp-submit-ghost" onClick={reset}>
                ← Use a different email
              </button>
            </div>
          )}

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

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true" flexShrink={0}>
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
