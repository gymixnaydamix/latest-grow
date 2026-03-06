/* ─── ResetPasswordPage ─── Set new password via token ─── */
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/api/client';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const isValid = password.length >= 8 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) return;

    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login', { state: { message: 'Password reset successful. Please log in.' } }), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-bold text-white">Invalid Reset Link</h1>
          <p className="text-sm text-white/50">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password">
            <Button variant="outline" className="border-white/10 text-white/60 hover:text-white">
              Request a New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        {/* ── Header ── */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Lock className="size-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-white/50">
            Enter your new password below.
          </p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl border border-white/6 bg-white/3 p-8 backdrop-blur-xl">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto size-12 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Password Reset!</h2>
              <p className="text-sm text-white/50">
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-white/60">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/25"
                    required
                    minLength={8}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm text-white/60">Confirm Password</Label>
                <Input
                  id="confirm"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`border-white/10 bg-white/5 text-white placeholder:text-white/25 ${
                    confirmPassword && !passwordsMatch ? 'border-rose-500/50' : ''
                  }`}
                  required
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-rose-400">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  <ArrowLeft className="mr-1 inline size-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
