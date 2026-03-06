/* ─── LoginPage ─── Ultra-Premium Split-Screen Auth ─ */
import { useState, useEffect, KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Loader2, Github, AlertCircle, 
  Sparkles, Keyboard, Command, ArrowRight, CheckCircle2 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  // Clear error when user types
  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  // Handle Caps Lock detection
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Error handled by store, triggers UI animation
    }
  };

  // UX Enhancement: 1-Click Demo Auto-fill
  const demoAccounts = [
    { key: 'provider',  label: 'Provider',  email: 'provider@growyourneed.dev', password: 'provider123', color: 'text-violet-500' },
    { key: 'admin',     label: 'Admin',     email: 'admin@greenfield.edu',      password: 'demo123',     color: 'text-blue-500' },
    { key: 'teacher',   label: 'Teacher',   email: 'teacher@greenfield.edu',    password: 'demo123',     color: 'text-emerald-500' },
    { key: 'student',   label: 'Student',   email: 'student@greenfield.edu',    password: 'demo123',     color: 'text-amber-500' },
    { key: 'parent',    label: 'Parent',    email: 'parent@greenfield.edu',     password: 'demo123',     color: 'text-pink-500' },
    { key: 'finance',   label: 'Finance',   email: 'finance@greenfield.edu',    password: 'demo123',     color: 'text-cyan-500' },
    { key: 'marketing', label: 'Marketing', email: 'marketing@greenfield.edu',  password: 'demo123',     color: 'text-orange-500' },
    { key: 'school',    label: 'School',    email: 'school@greenfield.edu',     password: 'demo123',     color: 'text-indigo-500' },
  ] as const;

  const fillDemo = (key: string) => {
    const acct = demoAccounts.find((a) => a.key === key);
    if (!acct) return;
    setEmail(acct.email);
    setPassword(acct.password);
    clearError();
  };

  // Staggered animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  } as const;

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      
      {/* ─── LEFT PANEL: Branding & Visuals (Hidden on Mobile) ─── */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-950 p-12 text-white lg:flex overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.15),transparent_40%)]" />
        <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        {/* Animated Glowing Orb */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-20 top-20 z-0 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" 
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-2 font-bold tracking-tighter text-2xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Command className="h-5 w-5" />
          </div>
          GROW <span className="text-zinc-400 font-medium">Your NEED</span>
        </div>

        {/* Main Graphic/Text */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
              Empower your ecosystem with <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-violet-400">intelligent tools.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
              Join thousands of professionals scaling their operations, managing providers, and optimizing growth seamlessly in one unified platform.
            </p>
          </motion.div>
        </div>

        {/* Glassmorphic Testimonial */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-1 text-yellow-400 mb-3">
            {[...Array(5)].map((_, i) => (<Sparkles key={i} className="h-4 w-4 fill-current" />))}
          </div>
          <p className="text-zinc-300 italic">
            "Switching to Grow Your Need transformed how we manage our internal processes. The intuitive design and speed are just unmatched."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 border-2 border-white/10" />
            <div>
              <p className="text-sm font-semibold text-white">Sarah Jenkins</p>
              <p className="text-xs text-zinc-500">Operations Director, Greenfield Edu</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── RIGHT PANEL: Auth Form ─── */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2 lg:px-12 xl:px-24 relative">
        
        {/* Mobile Logo (Only visible on small screens) */}
        <div className="absolute top-8 left-6 flex lg:hidden items-center gap-2 font-bold tracking-tighter text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Command className="h-4 w-4" />
          </div>
          GROW <span className="text-muted-foreground font-medium">Your NEED</span>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full max-w-110 space-y-8"
        >
          {/* Form Header */}
          <motion.div variants={fadeUp} className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard.
            </p>
          </motion.div>

          {/* Social Logins */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11 border-border/60 bg-background/50 hover:bg-muted/50 transition-all font-medium">
              <Github className="mr-2 h-4 w-4" /> Github
            </Button>
            <Button variant="outline" className="h-11 border-border/60 bg-background/50 hover:bg-muted/50 transition-all font-medium">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">Or continue with email</span>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: [-5, 5, -5, 5, 0] }} // Shake effect
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2 font-medium">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className={`transition-colors font-medium ${focusedField === 'email' ? 'text-primary' : 'text-foreground'}`}>
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                  className={`h-12 bg-muted/40 transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-primary/20 border-primary bg-background shadow-[0_0_15px_-3px_rgba(var(--primary),0.15)]' : ''}`}
                />
                {email.includes('@') && email.includes('.') && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3.5 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className={`transition-colors font-medium ${focusedField === 'password' ? 'text-primary' : 'text-foreground'}`}>
                  Password
                </Label>
                <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  required
                  autoComplete="current-password"
                  className={`h-12 pr-12 bg-muted/40 transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-primary/20 border-primary bg-background shadow-[0_0_15px_-3px_rgba(var(--primary),0.15)]' : ''} ${capsLockActive ? 'border-amber-500/50 ring-amber-500/20' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Caps Lock Warning */}
              <AnimatePresence>
                {capsLockActive && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1.5 text-xs text-amber-500 font-medium pt-1"
                  >
                    <Keyboard className="h-3.5 w-3.5" /> Caps Lock is ON
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="group relative h-12 w-full overflow-hidden text-base font-semibold transition-all hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.4)]" 
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>Processing <Loader2 className="h-4 w-4 animate-spin" /></>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </Button>
          </motion.form>

          {/* 1-Click Demo Credentials Panel */}
          <motion.div variants={fadeUp} className="rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">1-Click Demo Access</h4>
            <div className="grid grid-cols-4 gap-2">
              {demoAccounts.map((acct) => (
                <Button 
                  key={acct.key}
                  variant="secondary" 
                  size="sm" 
                  onClick={() => fillDemo(acct.key)}
                  className={`w-full text-xs font-medium bg-background border border-border/50 hover:border-primary/50 hover:text-primary transition-all`}
                >
                  <span className={acct.color}>{acct.label}</span>
                </Button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground/60 text-center">
              All demo accounts use password <span className="font-mono font-medium text-muted-foreground">demo123</span> (Provider: <span className="font-mono font-medium text-muted-foreground">provider123</span>)
            </p>
          </motion.div>

          <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline underline-offset-4">
              Create an account
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}