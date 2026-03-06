/* ─── TeacherCommunicationSection ─── Teacher comms hub ────────────── */
import { useState } from 'react';
import { MessageSquare, Mail, Send, Users, Bell, Search, Paperclip, Star, Reply, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStaggerAnimate } from '@/hooks/use-animate';

interface MessageItem {
  id: string;
  from: string;
  role: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  starred: boolean;
  hasAttachment: boolean;
}

const MESSAGES: MessageItem[] = [
  { id: '1', from: 'Sarah Wilson', role: 'Parent', subject: 'Question about homework policy', preview: 'Hi, I wanted to ask about the new homework policy for 3rd grade…', date: '2025-03-15', unread: true, starred: false, hasAttachment: false },
  { id: '2', from: 'Principal Adams', role: 'Admin', subject: 'Staff meeting agenda — March 20', preview: 'Please review the attached agenda before our meeting on Thursday…', date: '2025-03-14', unread: true, starred: true, hasAttachment: true },
  { id: '3', from: 'Emma Chen', role: 'Student', subject: 'Missing assignment explanation', preview: 'I apologize for the late submission of my science project…', date: '2025-03-14', unread: false, starred: false, hasAttachment: false },
  { id: '4', from: 'IT Department', role: 'Staff', subject: 'Smartboard maintenance — Room 204', preview: 'The smartboard in your classroom will be serviced on Friday…', date: '2025-03-13', unread: false, starred: false, hasAttachment: false },
  { id: '5', from: 'Math Department', role: 'Department', subject: 'Curriculum review meeting notes', preview: 'Attached are the notes from last week\'s curriculum review…', date: '2025-03-12', unread: false, starred: true, hasAttachment: true },
  { id: '6', from: 'John Patel', role: 'Parent', subject: 'Re: Student progress report', preview: 'Thank you for the detailed progress report. We were wondering…', date: '2025-03-11', unread: false, starred: false, hasAttachment: false },
];

const ANNOUNCEMENTS = [
  { id: 'a1', title: 'Spring Break Schedule', audience: 'All Students', date: '2025-03-14', priority: 'high' as const },
  { id: 'a2', title: 'Field Trip Permission Forms Due', audience: 'Math 101', date: '2025-03-13', priority: 'medium' as const },
  { id: 'a3', title: 'Class Photo Day Reminder', audience: 'All Classes', date: '2025-03-10', priority: 'low' as const },
];

const PRIORITY_COLORS = {
  high: 'bg-red-400/10 text-red-400',
  medium: 'bg-amber-400/10 text-amber-400',
  low: 'bg-white/5 text-white/40',
};

export default function TeacherCommunicationSection() {
  const containerRef = useStaggerAnimate([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);

  const unreadCount = MESSAGES.filter((m) => m.unread).length;
  const filteredMsgs = MESSAGES.filter(
    (m) => m.from.toLowerCase().includes(searchQuery.toLowerCase()) || m.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center gap-2">
        <MessageSquare className="size-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white/90">Communications</h2>
        {unreadCount > 0 && <Badge className="border-0 bg-red-400/10 text-red-400 text-[10px]">{unreadCount} unread</Badge>}
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList data-animate className="bg-white/5 border border-white/6">
          <TabsTrigger value="inbox" className="text-xs data-[state=active]:bg-white/10 gap-1">
            <Mail className="size-3" />Inbox
          </TabsTrigger>
          <TabsTrigger value="compose" className="text-xs data-[state=active]:bg-white/10 gap-1">
            <Send className="size-3" />Compose
          </TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs data-[state=active]:bg-white/10 gap-1">
            <Bell className="size-3" />Announcements
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-xs data-[state=active]:bg-white/10 gap-1">
            <Users className="size-3" />Groups
          </TabsTrigger>
        </TabsList>

        {/* Inbox */}
        <TabsContent value="inbox">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search messages…" className="pl-9 bg-white/4 border-white/8 text-white/80 text-xs h-8" />
                </div>
                <Badge className="border-0 bg-white/5 text-white/40 text-[10px]">{filteredMsgs.length} messages</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {filteredMsgs.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMsg(selectedMsg === msg.id ? null : msg.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                    msg.unread ? 'border-indigo-400/20 bg-indigo-500/5' : 'border-white/4 bg-white/2 hover:bg-white/4',
                    selectedMsg === msg.id && 'ring-1 ring-indigo-400/30',
                  )}
                >
                  <div className="size-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0 mt-0.5">
                    {msg.from.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-medium', msg.unread ? 'text-white/90' : 'text-white/60')}>{msg.from}</span>
                      <Badge variant="outline" className="border-white/8 text-white/25 text-[8px]">{msg.role}</Badge>
                      {msg.hasAttachment && <Paperclip className="size-3 text-white/25" />}
                    </div>
                    <p className={cn('text-[11px] truncate', msg.unread ? 'text-white/70 font-medium' : 'text-white/50')}>{msg.subject}</p>
                    <p className="text-[10px] text-white/30 truncate">{msg.preview}</p>
                    {selectedMsg === msg.id && (
                      <div className="flex gap-1.5 mt-2">
                        <Button variant="outline" size="sm" className="text-[10px] h-6 border-white/8 text-white/50 gap-0.5"><Reply className="size-2.5" />Reply</Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-6 border-white/8 text-white/50 gap-0.5"><Star className="size-2.5" />Star</Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-6 border-white/8 text-red-400/50 gap-0.5"><Trash2 className="size-2.5" />Delete</Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-white/25">{new Date(msg.date).toLocaleDateString()}</span>
                    {msg.unread && <span className="size-2 rounded-full bg-indigo-400" />}
                    {msg.starred && <Star className="size-3 text-amber-400 fill-amber-400" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose */}
        <TabsContent value="compose">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Send className="size-4 text-indigo-400" />New Message</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/40">To</label>
                  <Input placeholder="Search recipients…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/40">Subject</label>
                  <Input placeholder="Message subject…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
                </div>
              </div>
              <textarea rows={8} placeholder="Type your message…" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none focus:border-indigo-400/40" />
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="text-xs border-white/10 text-white/50 gap-1"><Paperclip className="size-3" />Attach</Button>
                <Button size="sm" className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 gap-1"><Send className="size-3" />Send Message</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90 text-sm flex items-center gap-2"><Bell className="size-4 text-amber-400" />My Announcements</CardTitle>
                <Button size="sm" className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 gap-1"><Bell className="size-3" />New Announcement</Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white/70">{a.title}</p>
                    <p className="text-[10px] text-white/30">{a.audience} • {new Date(a.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={cn('border-0 text-[9px] capitalize', PRIORITY_COLORS[a.priority])}>{a.priority}</Badge>
                  <Button variant="ghost" size="icon" className="size-6 text-white/30"><MoreVertical className="size-3" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups */}
        <TabsContent value="groups">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Users className="size-4 text-violet-400" />Class Groups</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Math 101', 'Math 201', 'AP Calculus', 'Statistics'].map((cls) => (
                <div key={cls} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-4 hover:bg-white/4 cursor-pointer transition-colors">
                  <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Users className="size-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white/70">{cls}</p>
                    <p className="text-[10px] text-white/30">{Math.floor(Math.random() * 15 + 20)} members</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[10px] h-6 border-white/8 text-white/40">Message All</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
