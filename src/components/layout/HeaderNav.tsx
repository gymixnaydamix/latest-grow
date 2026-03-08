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
          'sticky top-2 z-40 mx-2 flex min-h-14 w-auto flex-wrap items-center gap-2 rounded-xl border px-2 py-2 transition-all duration-300 sm:mx-3 sm:px-3 lg:min-h-14 lg:flex-nowrap lg:gap-3 lg:px-4 lg:py-0',
          isScrolled
            ? 'border-border bg-card shadow-[var(--shadow-sm)]'
            : 'border-border/60 bg-card/95 shadow-[var(--shadow-xs)]',
        )}
      >
        {/* --- Logo / Brand --- */}
        <div className="order-1 flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 select-none mr-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-4 text-primary fill-primary/20" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground hidden sm:block" style={{ fontFamily: 'var(--font-heading)' }}>
              GROW
              <span className="text-primary ml-0.5">NEED</span>
            </span>
          </div>
        </div>

        {/* --- Header Tabs (Context Bar) --- */}
        <div className="order-3 basis-full lg:order-2 lg:basis-auto flex min-w-0 flex-1 items-center justify-center px-0 lg:px-2">
          <nav
            ref={navRef}
            className="flex w-full items-stretch gap-0.5 overflow-x-auto rounded-lg border border-border/60 bg-muted/50 px-1 py-1 scrollbar-none sm:w-auto sm:px-1.5"
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
                    'relative min-h-10 min-w-[4rem] flex-col gap-0.5 rounded-md px-2 py-1.5 text-center text-[10px] font-semibold leading-tight whitespace-normal transition-all duration-200 sm:h-8 sm:min-w-0 sm:flex-row sm:gap-1.5 sm:rounded-md sm:px-3 sm:py-0 sm:text-xs lg:px-3 xl:h-8 xl:px-4 xl:text-[13px]',
                    isActive
                      ? 'bg-card text-foreground shadow-[var(--shadow-sm)] border border-border/60'
                      : 'text-muted-foreground hover:bg-card/60 hover:text-foreground border border-transparent',
                  )}
                >
                  {Icon && (
                    <Icon className={cn('size-3.5 shrink-0 sm:size-4', isActive ? 'text-primary' : '')} />
                  )}
                  <span className="block max-w-[5rem] text-center leading-tight sm:max-w-none sm:truncate">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* --- Right Controls --- */}
        <div className="order-2 ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:order-3 lg:gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center">
            <Button
              variant="outline"
              className="relative h-8 w-40 justify-start rounded-lg bg-muted/40 px-3 text-xs font-normal text-muted-foreground shadow-none transition-colors lg:w-48 xl:h-8 xl:w-60 xl:text-[13px] hover:bg-muted/70 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring border-border/60"
            >
              <Search className="mr-2 size-3.5 opacity-50 xl:size-4" />
              <span className="truncate">
                {isProvider ? (
                  <>
                    <span className="xl:hidden">Search tenants...</span>
                    <span className="hidden xl:inline">Search tenants, domains...</span>
                  </>
                ) : (
                  'Search...'
                )}
              </span>
              <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 xl:flex">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="size-8 rounded-full sm:size-9">
              <Search className="size-4 sm:size-5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-5 bg-border/60 sm:mx-1.5 sm:h-5" />

          <NotificationBell />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="size-8 rounded-full hover:bg-muted sm:size-8"
              >
                <Sun className="size-4 rotate-0 scale-100 transition-all duration-300 text-amber-500 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-300 text-sky-400 dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Switch Theme</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full pl-0 hover:bg-transparent sm:h-9 sm:w-9 lg:w-auto lg:px-1.5 lg:hover:bg-muted xl:px-2"
              >
                <Avatar className="size-7 border-2 border-border shadow-[var(--shadow-xs)] transition-transform hover:scale-105 sm:size-8">
                  <AvatarImage src={undefined} alt={user?.firstName ?? ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[11px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden flex-col items-start text-sm lg:flex lg:ml-1.5 xl:ml-2">
                  <span className="max-w-14 truncate text-[11px] font-semibold leading-none text-foreground xl:max-w-24">
                    {user?.firstName}
                  </span>
                  <span className="mt-0.5 text-[9px] leading-none text-muted-foreground xl:text-[10px]">
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
                  <DropdownMenuShortcut>&#8984;P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <CreditCard className="mr-2 size-4 opacity-70" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 size-4 opacity-70" />
                  <span>Settings</span>
                  <DropdownMenuShortcut>&#8984;S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive focus:text-destructive focus:bg-danger-soft cursor-pointer"
              >
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>&#8984;&#8679;Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
