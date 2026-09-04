import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../lib/api/auth';
import { ApiError } from '../lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 rounded-xl border border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both' }}>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Jobtrace</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
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
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="transition-shadow focus:shadow-sm"
          />
          {error && (
            <p className="text-sm text-destructive-foreground bg-destructive/20 px-3 py-2 rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full transition-transform active:scale-[0.98]" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Loading…
              </span>
            ) : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          {mode === 'signin' ? (
            <p>
              No account?{' '}
              <button onClick={() => reset('signup')} className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => reset('signin')} className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
