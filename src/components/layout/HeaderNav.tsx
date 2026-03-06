import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  LogOut,
  Search,
  Settings,
  User,
  ChevronDown,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/features/NotificationBell';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useChildStagger } from '@/hooks/use-animate';
import type { HeaderItem } from '@/constants/navigation';
import { isParentPortalV2EnabledByDefault } from '@/config/parentPortalFlags';
import { withParentRouteContext } from '@/views/parent/parent-navigation';

interface HeaderNavProps {
  headerItems: HeaderItem[];
}

const ROLE_BASE: Record<string, string> = {
  PROVIDER: '/provider/home',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
  FINANCE: '/finance',
  MARKETING: '/marketing',
  SCHOOL: '/school-leader',
};

export function HeaderNav({ headerItems }: HeaderNavProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const { user, logout } = useAuthStore();
  const { toggleTheme } = useUIStore();
  const navRef = useChildStagger<HTMLElement>([headerItems], 'animate-fade-down', 30);
  const navTo = useNavigate();
  const { pathname, search } = useLocation();
  const basePath = ROLE_BASE[user?.role ?? ''] ?? '/student';
  const isProvider = user?.role === 'PROVIDER';
  const isParentV2 = user?.role === 'PARENT' && isParentPortalV2EnabledByDefault();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (headerItems.length > 0 && !headerItems.find((h) => h.id === activeHeader)) {
      setHeader(headerItems[0].id);
    }
  }, [headerItems, activeHeader, setHeader]);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <TooltipProvider delayDuration={300} disableHoverableContent>
      <header
        className={cn(
          'sticky top-2 z-40 mx-2 flex min-h-14 w-auto flex-wrap items-center gap-2 rounded-2xl border px-2 py-2 transition-all duration-500 ease-in-out sm:mx-3 sm:px-3 lg:min-h-16 lg:flex-nowrap lg:gap-4 lg:px-4 lg:py-0',
          isScrolled
            ? 'border-border/60 bg-white backdrop-blur-2xl shadow-[0_1px_3px_var(--surface-glow),0_4px_16px_var(--ambient-light)]'
            : 'border-border/40 bg-white backdrop-blur-xl shadow-[0_0_16px_-2px_rgba(30,64,175,0.12)]',
        )}
      >
        <div className="order-1 flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 select-none mr-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shadow-[0_0_12px_var(--surface-glow)]">
              <Sparkles className="size-4 text-primary fill-primary/20" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              GROW
              <span className="bg-linear-to-tr from-sky-500 to-blue-600 bg-clip-text text-transparent ml-0.5">
                NEED
              </span>
            </span>
          </div>
        </div>

        <div className="order-3 basis-full lg:order-2 lg:basis-auto flex min-w-0 flex-1 items-center justify-center px-0 lg:px-2">
          <nav
            ref={navRef}
            className={cn(
              'flex w-full items-stretch gap-1 overflow-x-auto rounded-2xl border px-1 py-1 scrollbar-none sm:w-auto sm:px-2 sm:py-1.5',
              isProvider
                ? 'bg-linear-to-r from-slate-700 via-slate-600 to-blue-700 border-slate-500/60 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.4)]'
                : 'bg-linear-to-r from-slate-700 via-slate-600 to-indigo-600 border-slate-500/60 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.35)]',
            )}
          >
            {headerItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeHeader === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    setHeader(item.id);
                    const targetPath = item.path ?? basePath;
                    if (targetPath && pathname !== targetPath) {
                      navTo(isParentV2 ? withParentRouteContext(targetPath, search) : targetPath);
                    }
                  }}
                  className={cn(
                    'relative min-h-11 min-w-[4.5rem] flex-col gap-1 rounded-xl px-2 py-1.5 text-center text-[10px] font-medium leading-tight whitespace-normal transition-all duration-300 ease-out sm:h-8 sm:min-w-0 sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-3 sm:py-0 sm:text-xs lg:px-3 xl:h-9 xl:px-4 xl:text-sm',
                    isActive
                      ? 'bg-white/20 text-white shadow-md shadow-black/10 hover:bg-white/25 backdrop-blur-sm'
                      : 'text-white hover:bg-white/10 hover:text-white',
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        'size-3.5 shrink-0 sm:size-4',
                        isActive ? 'stroke-[2.5px]' : 'stroke-2',
                      )}
                    />
                  )}
                  <span className="block max-w-[5.4rem] text-center leading-tight sm:max-w-none sm:truncate">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:order-3 lg:gap-2">
          <div className="hidden md:flex items-center">
            <Button
              variant="outline"
              className={cn(
                'relative h-8 w-40 justify-start rounded-lg bg-muted/40 px-3 text-xs font-normal text-muted-foreground shadow-none transition-colors lg:w-52 xl:h-9 xl:w-72 xl:text-sm',
                'hover:bg-muted/70 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring',
              )}
            >
              <Search className="mr-2 size-3.5 opacity-50 xl:size-4" />
              <span className="truncate">
                {isProvider ? (
                  <>
                    <span className="xl:hidden">Search tenants...</span>
                    <span className="hidden xl:inline">Search tenants, domains, IDs...</span>
                  </>
                ) : (
                  'Search...'
                )}
              </span>
              <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 xl:flex shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)] dark:shadow-none">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="size-8 rounded-full sm:size-9">
              <Search className="size-4 sm:size-5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-5 bg-border/60 sm:mx-2 sm:h-6" />

          <NotificationBell />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="size-8 rounded-full hover:bg-secondary sm:size-9"
              >
                <Sun className="size-4 rotate-0 scale-100 transition-all duration-300 text-amber-500 dark:-rotate-90 dark:scale-0 sm:size-5" />
                <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-300 text-sky-500 dark:rotate-0 dark:scale-100 sm:size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Switch Theme</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full pl-0 hover:bg-transparent sm:h-10 sm:w-10 lg:w-auto lg:px-1.5 lg:hover:bg-secondary/80 xl:px-2"
              >
                <Avatar className="size-8 border-2 border-background shadow-sm transition-transform hover:scale-105 sm:size-9">
                  <AvatarImage src={undefined} alt={user?.firstName ?? ''} />
                  <AvatarFallback className="bg-linear-to-br from-primary to-blue-600 text-white font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden flex-col items-start text-sm lg:flex lg:ml-1.5 xl:ml-2">
                  <span className="max-w-14 truncate text-[11px] font-semibold leading-none text-foreground xl:max-w-24">
                    {user?.firstName}
                  </span>
                  <span className="mt-1 text-[9px] leading-none text-muted-foreground xl:text-[10px]">
                    {user?.role === 'PARENT' ? 'Parent' : isProvider ? 'Provider' : 'Admin'}
                  </span>
                </div>
                <ChevronDown className="ml-1 hidden size-3 text-muted-foreground opacity-50 lg:block xl:ml-2" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 size-4 opacity-70" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>??P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <CreditCard className="mr-2 size-4 opacity-70" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 size-4 opacity-70" />
                  <span>Settings</span>
                  <DropdownMenuShortcut>?S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
              >
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>??Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}

