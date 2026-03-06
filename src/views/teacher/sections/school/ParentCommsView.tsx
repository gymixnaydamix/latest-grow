/* ─── ParentCommsView ─── Messages, conferences, office hours ──── */
import { Plus, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ParentCommsView({ subNav }: { subNav: string }) {
  if (subNav === 'bulk_message') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Bulk Message</h2></div>
        <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Recipients</label>
            <Input placeholder="All parents, or select specific class…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Subject</label>
            <Input placeholder="Message subject…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Message</label>
            <Input placeholder="Type your message…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Send className="mr-1 size-3" /> Send</Button>
        </div>
      </>
    );
  }

  if (subNav === 'schedule_conferences') {
    return (
      <>
        <div className="flex items-center justify-between" data-animate>
          <h2 className="text-lg font-semibold text-white/90">Schedule Conferences</h2>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Plus className="mr-1 size-3" /> New Conference</Button>
        </div>
        <div className="space-y-2" data-animate>
          {[
            { parent: 'Sarah Johnson', student: 'Emily Johnson', date: 'May 16, 3:00 PM', status: 'confirmed' },
            { parent: 'David Chen', student: 'Liam Chen', date: 'May 17, 2:30 PM', status: 'pending' },
            { parent: 'Maria Garcia', student: 'Sofia Garcia', date: 'May 18, 4:00 PM', status: 'confirmed' },
          ].map((c) => (
            <div key={c.parent} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{c.parent} — {c.student}</p>
                <p className="text-xs text-white/40">{c.date}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${c.status === 'confirmed' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400'}`}>{c.status}</Badge>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (subNav === 'office_hours') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Office Hours</h2></div>
        <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-3">
          {[
            { day: 'Monday', time: '3:00 PM – 4:00 PM', location: 'Room 204' },
            { day: 'Wednesday', time: '3:00 PM – 4:00 PM', location: 'Room 204' },
            { day: 'Friday', time: '2:00 PM – 3:00 PM', location: 'Virtual (Zoom)' },
          ].map((oh) => (
            <div key={oh.day} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
              <div>
                <p className="text-sm font-medium text-white/80">{oh.day}</p>
                <p className="text-xs text-white/40">{oh.time} · {oh.location}</p>
              </div>
              <Button size="sm" className="bg-transparent text-white/50 hover:text-white/70 hover:bg-white/5">Edit</Button>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Default: message_log
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold text-white/90">Message Log</h2></div>
      <div className="space-y-2" data-animate>
        {[
          { parent: 'Sarah Johnson', topic: 'Emily\'s progress update', date: 'May 14', method: 'Email' },
          { parent: 'David Chen', topic: 'Conference follow-up', date: 'May 13', method: 'Phone' },
          { parent: 'Maria Garcia', topic: 'Homework clarification', date: 'May 12', method: 'In-app' },
        ].map((m) => (
          <div key={m.parent + m.date} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{m.parent}</p>
              <p className="text-xs text-white/40">{m.topic}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{m.method}</Badge>
              <span className="text-xs text-white/30">{m.date}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
