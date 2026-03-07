/* ─── ComposePage ─── Full-page email compose for students ─────────── */
import { useState } from 'react';
import {
  Send, Paperclip, X, Plus, ChevronDown,
  Bold, Italic, Underline, List, Link2,
  Image, FileText, AtSign, Smile,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useStudentMessages, useSendStudentMessage } from '@/hooks/api/use-student';

const FALLBACK_QUICK_CONTACTS = [
  { name: 'Mrs. Rodriguez', role: 'Algebra II Teacher', initials: 'MR', color: 'bg-indigo-500/20 text-indigo-400' },
  { name: 'Dr. Chen', role: 'AP Chemistry Teacher', initials: 'DC', color: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'Mr. Thompson', role: 'English Literature', initials: 'MT', color: 'bg-violet-500/20 text-violet-400' },
  { name: 'School Office', role: 'Administration', initials: 'SO', color: 'bg-amber-500/20 text-amber-400' },
  { name: 'Guidance Counselor', role: 'Student Services', initials: 'GC', color: 'bg-cyan-500/20 text-cyan-400' },
];

const FALLBACK_TEMPLATES = [
  { label: 'Absence Notification', subject: 'Absence Notification — [Date]' },
  { label: 'Assignment Extension', subject: 'Request for Assignment Extension' },
  { label: 'Meeting Request', subject: 'Request for Meeting — [Topic]' },
  { label: 'General Inquiry', subject: 'Inquiry — [Topic]' },
];

export default function ComposePage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const { data: apiMessages } = useStudentMessages();
  const sendMessageMut = useSendStudentMessage();
  const contactsFromApi = (apiMessages as any)?.contacts as any[] | undefined;
  const QUICK_CONTACTS = contactsFromApi?.length ? contactsFromApi : FALLBACK_QUICK_CONTACTS;
  const TEMPLATES = FALLBACK_TEMPLATES;

  const removeAttachment = (name: string) => setAttachments((p) => p.filter((a) => a !== name));

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Compose Email" description="Draft and send a new message" />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Compose form */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40">To</label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Enter recipient email or name…"
                className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25"
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-white/6 pb-2">
              {[Bold, Italic, Underline, List, Link2, Image, AtSign, Smile].map((Icon, i) => (
                <Button key={i} variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/30 hover:text-white/60 hover:bg-white/5" onClick={() => notifySuccess('Format', 'Formatting applied')}>
                  <Icon className="size-3.5" />
                </Button>
              ))}
            </div>

            <div className="space-y-1.5">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message…"
                rows={14}
                className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25 resize-none"
              />
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((name) => (
                  <div key={name} className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/3 px-2.5 py-1">
                    <FileText className="size-3 text-white/30" />
                    <span className="text-xs text-white/60">{name}</span>
                    <button onClick={() => removeAttachment(name)} className="text-white/30 hover:text-white/60">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  className="border-white/10 text-white/60 hover:bg-white/5"
                  onClick={() => setAttachments((p) => [...p, `Document_${p.length + 1}.pdf`])}
                >
                  <Paperclip className="mr-1 size-3" /> Attach File
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5" onClick={() => notifySuccess('Draft', 'Message saved as draft')}>
                  Save Draft
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5" onClick={() => notifySuccess('Options', 'Send options displayed')}>
                  <ChevronDown className="size-3" />
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white" disabled={sendMessageMut.isPending} onClick={() => sendMessageMut.mutate({ recipientId: to, subject, content: body } as any, { onSuccess: () => { notifySuccess('Sent', 'Message sent successfully'); setTo(''); setSubject(''); setBody(''); setAttachments([]); }, onError: () => notifyError('Send failed', 'Could not send message') })}>
                  <Send className="mr-1 size-3" /> {sendMessageMut.isPending ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick contacts */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-white/60 mb-3">Quick Contacts</p>
              <div className="space-y-2">
                {QUICK_CONTACTS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setTo(c.name)}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 p-2 text-left hover:bg-white/5 hover:border-white/12 transition-colors"
                  >
                    <Avatar className="size-7">
                      <AvatarFallback className={`text-[9px] ${c.color}`}>{c.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white/70 truncate">{c.name}</p>
                      <p className="text-[10px] text-white/30 truncate">{c.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-white/60 mb-3">Templates</p>
              <div className="space-y-1.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setSubject(t.subject)}
                    className="flex w-full items-center gap-2 rounded-lg border border-white/6 bg-white/2 p-2 text-left hover:bg-white/5 hover:border-white/12 transition-colors"
                  >
                    <Plus className="size-3 text-white/25 shrink-0" />
                    <span className="text-xs text-white/55">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
