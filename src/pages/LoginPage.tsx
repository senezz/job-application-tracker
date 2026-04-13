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
            <Button variant="outline" className="w-full transition-transform active:scale-[0.98]" onClick={handleGoogleLogin}>
              Continue with Google
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
