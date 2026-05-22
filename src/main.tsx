import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Session } from '@supabase/supabase-js';
import './index.css';
import { supabase } from './lib/supabase';
import App from './App';
import { AuthPage } from './components/AuthPage';

function Root() {
  // undefined = session not yet determined (loading)
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // onAuthStateChange fires immediately with INITIAL_SESSION, so no separate getSession() needed.
    // It also catches the magic-link token exchange when the user returns from email.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Brief blank flash while session resolves — typically <50 ms from localStorage
  if (session === undefined) return null;

  if (!session) return <AuthPage />;

  return (
    <App
      userId={session.user.id}
      userEmail={session.user.email ?? ''}
      onSignOut={handleSignOut}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
