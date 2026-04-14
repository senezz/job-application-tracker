import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Mode = 'signin' | 'signup' | 'forgot';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = (next: Mode) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo('Check your email for a password reset link.');
      }
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        reset('signin');
        setInfo('Check your email to confirm your account, then sign in.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 rounded-xl border border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both' }}>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Jobtrace</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'signup' && 'Create a new account'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="transition-shadow focus:shadow-sm"
          />
          {mode !== 'forgot' && (
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="transition-shadow focus:shadow-sm"
            />
          )}
          {error && (
            <p className="text-sm text-destructive-foreground bg-destructive/20 px-3 py-2 rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
              {info}
            </p>
          )}
          <Button type="submit" className="w-full transition-transform active:scale-[0.98]" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Loading…
              </span>
            ) : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </Button>
        </form>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          {mode === 'signin' && (
            <>
              <p>
                No account?{' '}
                <button onClick={() => reset('signup')} className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">
                  Sign up
                </button>
              </p>
              <p>
                Forgot password?{' '}
                <button onClick={() => reset('forgot')} className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">
                  Reset
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => reset('signin')} className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>
              Back to{' '}
              <button onClick={() => reset('signin')} className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">
                Sign in
              </button>
            </p>
          )}
        </div>

        {mode !== 'forgot' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full transition-transform active:scale-[0.98] gap-3" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M47.532 24.552c0-1.636-.147-3.2-.42-4.704H24.48v8.898h12.99c-.56 3.016-2.26 5.572-4.814 7.286v6.054h7.794c4.558-4.198 7.082-10.38 7.082-17.534z" fill="#4285F4"/>
                <path d="M24.48 48c6.522 0 11.99-2.162 15.986-5.914l-7.794-6.054c-2.162 1.45-4.926 2.306-8.192 2.306-6.3 0-11.634-4.254-13.538-9.972H2.876v6.244C6.856 42.692 15.12 48 24.48 48z" fill="#34A853"/>
                <path d="M10.942 28.366A14.434 14.434 0 0 1 9.48 24c0-1.518.26-2.992.714 0z" fill="#FBBC05"/>
                <path d="M10.942 28.366A14.434 14.434 0 0 1 9.48 24c0-1.518.26-2.992.714-4.366L2.876 13.39A23.952 23.952 0 0 0 .48 24c0 3.874.926 7.538 2.396 10.61l7.794-6.244z" fill="#FBBC05"/>
                <path d="M24.48 9.656c3.552 0 6.742 1.222 9.254 3.624l6.942-6.942C36.466 2.392 30.998 0 24.48 0 15.12 0 6.856 5.308 2.876 13.39l7.844 6.244c1.904-5.718 7.238-9.978 13.76-9.978z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
