/* ─── AvatarGroup ─── Stacked avatar cluster with overflow count ──── */
import { useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface AvatarGroupMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface AvatarGroupProps {
  members: AvatarGroupMember[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
};

const overlapMap = {
  sm: '-ml-2',
  md: '-ml-2.5',
  lg: '-ml-3',
};

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

const colorPalette = [
  'bg-indigo-500/20 text-indigo-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-violet-500/20 text-violet-300',
  'bg-cyan-500/20 text-cyan-300',
];

export function AvatarGroup({ members, max = 4, size = 'md', className }: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  const colors = useMemo(
    () => visible.map((_, i) => colorPalette[i % colorPalette.length]),
    [visible.length],
  );

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((m, i) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <Avatar
              className={cn(
                sizeMap[size],
                i > 0 && overlapMap[size],
                'ring-2 ring-background transition-transform hover:z-10 hover:scale-110 cursor-default',
              )}
            >
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt={m.name} className="size-full rounded-full object-cover" />
              ) : (
                <AvatarFallback className={cn('font-semibold', colors[i])}>
                  {getInitials(m.name)}
                </AvatarFallback>
              )}
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{m.name}</TooltipContent>
        </Tooltip>
      ))}
      {overflow > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar
              className={cn(
                sizeMap[size],
                overlapMap[size],
                'ring-2 ring-background cursor-default',
              )}
            >
              <AvatarFallback className="bg-white/10 text-white/60 font-medium">
                +{overflow}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {members.slice(max).map(m => m.name).join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
