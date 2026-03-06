/* ─── UserCard ─── User profile card with avatar, role & actions ──── */
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface UserCardProps {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  tags?: string[];
  className?: string;
  compact?: boolean;
  onMessage?: () => void;
  onMore?: () => void;
}

const STATUS_STYLES: Record<NonNullable<UserCardProps['status']>, string> = {
  online: 'bg-emerald-400 shadow-emerald-400/40',
  offline: 'bg-white/20',
  away: 'bg-amber-400 shadow-amber-400/40',
  busy: 'bg-rose-400 shadow-rose-400/40',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-rose-400/10 text-rose-400',
  teacher: 'bg-indigo-400/10 text-indigo-400',
  student: 'bg-emerald-400/10 text-emerald-400',
  parent: 'bg-amber-400/10 text-amber-400',
  provider: 'bg-violet-400/10 text-violet-400',
  finance: 'bg-cyan-400/10 text-cyan-400',
  marketing: 'bg-pink-400/10 text-pink-400',
  school: 'bg-blue-400/10 text-blue-400',
};

const AVATAR_BG = ['bg-indigo-400/20 text-indigo-400', 'bg-emerald-400/20 text-emerald-400', 'bg-violet-400/20 text-violet-400', 'bg-amber-400/20 text-amber-400', 'bg-rose-400/20 text-rose-400', 'bg-cyan-400/20 text-cyan-400'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function UserCard({
  name, role, avatar, email, phone, location, status = 'offline', tags,
  className, compact = false, onMessage, onMore,
}: UserCardProps) {
  const roleLower = role.toLowerCase();
  const roleColor = ROLE_COLORS[roleLower] ?? 'bg-white/5 text-white/40';
  const colorIdx = name.length % AVATAR_BG.length;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 rounded-lg border border-white/6 bg-white/3 backdrop-blur-xl px-3 py-2', className)}>
        <div className="relative shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="size-8 rounded-full object-cover" />
          ) : (
            <div className={cn('size-8 rounded-full flex items-center justify-center text-xs font-bold', AVATAR_BG[colorIdx])}>{getInitials(name)}</div>
          )}
          <div className={cn('absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-black/40 shadow-sm', STATUS_STYLES[status])} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/70 truncate">{name}</p>
          <p className="text-[10px] text-white/30">{role}</p>
        </div>
        {onMessage && (
          <Button variant="ghost" size="icon" className="size-6 text-white/20 hover:text-indigo-400" onClick={onMessage}><Mail className="size-3" /></Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden', className)}>
      {/* Banner */}
      <div className="h-16 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-emerald-500/10 relative">
        {onMore && (
          <Button variant="ghost" size="icon" className="absolute top-1.5 right-1.5 size-6 text-white/20 hover:text-white/50" onClick={onMore}>
            <MoreHorizontal className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="-mt-6 px-4 pb-4">
        {/* Avatar */}
        <div className="relative inline-block mb-2">
          {avatar ? (
            <img src={avatar} alt={name} className="size-12 rounded-full object-cover border-2 border-black/40" />
          ) : (
            <div className={cn('size-12 rounded-full flex items-center justify-center text-sm font-bold border-2 border-black/40', AVATAR_BG[colorIdx])}>{getInitials(name)}</div>
          )}
          <div className={cn('absolute bottom-0 right-0 size-3 rounded-full border-2 border-black/40 shadow-sm', STATUS_STYLES[status])} />
        </div>

        <h3 className="text-sm font-semibold text-white/80">{name}</h3>
        <Badge className={cn('border-0 text-[10px] mt-1', roleColor)}>{role}</Badge>

        {/* Contact */}
        <div className="mt-3 flex flex-col gap-1">
          {email && <span className="text-[10px] text-white/30 flex items-center gap-1.5"><Mail className="size-2.5" />{email}</span>}
          {phone && <span className="text-[10px] text-white/30 flex items-center gap-1.5"><Phone className="size-2.5" />{phone}</span>}
          {location && <span className="text-[10px] text-white/30 flex items-center gap-1.5"><MapPin className="size-2.5" />{location}</span>}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map(t => <Badge key={t} variant="outline" className="border-white/6 text-white/25 text-[9px]">{t}</Badge>)}
          </div>
        )}

        {/* Action */}
        {onMessage && (
          <Button size="sm" className="w-full mt-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-xs gap-1.5" onClick={onMessage}>
            <Mail className="size-3" /> Message
          </Button>
        )}
      </div>
    </div>
  );
}

export default UserCard;
