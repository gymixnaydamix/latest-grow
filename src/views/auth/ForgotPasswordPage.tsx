/* ─── ForgotPasswordPage ─── Request password reset link ─── */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/api/client';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Mail className="size-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="mt-2 text-sm text-white/50">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl border border-white/6 bg-white/3 p-8 backdrop-blur-xl">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto size-12 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Check Your Email</h2>
              <p className="text-sm text-white/50">
                If an account exists for <span className="text-white/80">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4 w-full border-white/10 text-white/60 hover:text-white">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-white/60">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/25"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
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
