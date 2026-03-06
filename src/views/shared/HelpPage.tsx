/* ─── HelpPage ─── Help centre / FAQ / Support ────────────────────── */
import { useState } from 'react';
import { HelpCircle, Search, Book, MessageCircle, Mail, ChevronDown, ChevronUp, ExternalLink, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';

const FAQ_ITEMS = [
  { q: 'How do I reset my password?', a: 'Go to Profile → Security → Update Password. You can also use the "Forgot password?" link on the login screen.' },
  { q: 'How do I enrol in a course?', a: 'Navigate to Courses → Browse, find the course you want, and click "Enrol". Your teacher or admin may also enrol you automatically.' },
  { q: 'Where can I see my grades?', a: 'Go to Academics → Grades to view all your graded assignments and assessments with detailed breakdowns.' },
  { q: 'How do I contact my teacher?', a: 'Use the Messages section to send a direct message, or visit Communication → Email to send an email.' },
  { q: 'Can I access the platform on mobile?', a: 'Yes! The platform is fully responsive. You can also install it as a PWA from your browser for a native-like experience.' },
  { q: 'How do I change my notification settings?', a: 'Go to Settings → Account → Notifications to customise email, push, and in-app notification preferences.' },
  { q: 'What browsers are supported?', a: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. We recommend Chrome for the best experience.' },
  { q: 'How do I report a bug?', a: 'Click "Contact Support" below and describe the issue. Include screenshots if possible to help us resolve it faster.' },
];

const GUIDES = [
  { title: 'Getting Started', desc: 'Learn the basics of the platform', icon: Book, color: 'text-indigo-400 bg-indigo-400/10' },
  { title: 'For Teachers', desc: 'Managing classes and grading', icon: Book, color: 'text-emerald-400 bg-emerald-400/10' },
  { title: 'For Parents', desc: 'Tracking your child\'s progress', icon: Book, color: 'text-violet-400 bg-violet-400/10' },
  { title: 'For Students', desc: 'Courses, assignments & more', icon: Book, color: 'text-amber-400 bg-amber-400/10' },
];

export default function HelpPage() {
  const containerRef = useStaggerAnimate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = FAQ_ITEMS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      {/* Hero */}
      <div data-animate className="flex flex-col items-center gap-4 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-8 text-center">
        <div className="size-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <HelpCircle className="size-6 text-indigo-400" />
        </div>
        <h1 className="text-xl font-bold text-white/90">How can we help?</h1>
        <p className="text-xs text-white/40 max-w-md">Search our knowledge base or browse frequently asked questions below.</p>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles…"
            className="pl-9 bg-white/4 border-white/8 text-white/80 text-xs h-10"
          />
        </div>
      </div>

      {/* Quick guides */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {GUIDES.map((g) => (
          <Card key={g.title} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 cursor-pointer transition-colors">
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className={cn('size-8 rounded-lg flex items-center justify-center', g.color)}>
                <g.icon className="size-4" />
              </div>
              <span className="text-xs font-medium text-white/70">{g.title}</span>
              <span className="text-[10px] text-white/30">{g.desc}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white/90 text-base flex items-center gap-2">
            <MessageCircle className="size-4 text-indigo-400" />
            Frequently Asked Questions
            <Badge className="border-0 bg-white/5 text-white/40 text-[10px] ml-auto">{filtered.length} results</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="py-6 text-center text-xs text-white/30">No matching questions found. Try a different search term.</p>
          )}
          {filtered.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="rounded-lg border border-white/6 bg-white/2">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <span className="flex-1 text-xs font-medium text-white/70">{item.q}</span>
                  {isOpen ? <ChevronUp className="size-3.5 text-white/30" /> : <ChevronDown className="size-3.5 text-white/30" />}
                </button>
                {isOpen && (
                  <div className="border-t border-white/6 px-3 py-2.5">
                    <p className="text-xs text-white/50 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Contact support */}
      <div data-animate className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="size-10 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">
              <Headphones className="size-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white/70">Live Chat Support</p>
              <p className="text-[10px] text-white/30">Available Mon-Fri 9 AM – 6 PM</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-white/10 text-white/60 gap-1">
              <MessageCircle className="size-3" />Chat
            </Button>
          </CardContent>
        </Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="size-10 rounded-lg bg-indigo-400/10 flex items-center justify-center shrink-0">
              <Mail className="size-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white/70">Email Support</p>
              <p className="text-[10px] text-white/30">support@growyourneed.com</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-white/10 text-white/60 gap-1">
              <ExternalLink className="size-3" />Email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
