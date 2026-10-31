import { Heading } from '@/components/ui/typography';
import { HelpTooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import { signOut } from "firebase/auth";
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import { useSidebar } from '../../auth/SidebarContext';
import { AuthContext } from '@/auth/AuthContext';
import {
  FolderIcon,
  BookOpenIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  HelpCircle as HelpCircleIcon,
  LogOut as LogOutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Bug as BugIcon,
} from 'lucide-react';
import ReportBugModal from './ReportBugModal';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// SidebarItem component
interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
  href?: string;
  tooltip?: string;
  target?: string;
}

function SidebarItem({
  icon,
  text,
  active = false,
  expanded,
  onClick,
  href,
  tooltip,
  target,
}: SidebarItemProps) {
  // Create a fixed-height container with absolute positioning for the icon
  const content = (
    <div className="h-8 relative flex items-center">
      {/* Icon is positioned absolutely to prevent layout shifts */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
        {icon}
      </div>

      {/* Text container with fixed left position */}
      {expanded && (
        <div className="pl-10 whitespace-nowrap transition-opacity duration-200">
          {text}
        </div>
      )}
    </div>
  );

  return (
    <li>
      <HelpTooltip content={tooltip ?? text} side="right" variant="sidebar" disabled={expanded}>
      {href ? (
        <Button asChild variant="sidebarNav" size="natural" data-active={active}>
          <Link href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} aria-current={active ? 'page' : undefined} aria-label={text}>
            {content}
          </Link>
        </Button>
      ) : (
        <Button variant="sidebarNav" size="natural" data-active={active} onClick={onClick} aria-label={text}>
          {content}
        </Button>
      )}
      </HelpTooltip>
    </li>
  );
}

const SideBar = () => {
  const [showReportBug, setShowReportBug] = useState(false);
  const router = useRouter();
  const { isExpanded, setIsExpanded } = useSidebar() as any;
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();


  // User settings query
  const fetchUserSettings = async () => {
    if (!user) throw new Error('No user found');
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) throw new Error('Failed to fetch user settings');
    return response.json();
  };

  const { data: userSettings } = useQuery(
    ['userSettings', user?.email],
    fetchUserSettings,
    { enabled: !!user }
  );

  const logOut = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
      // Redirect to login page or root after logging out
      queryClient.clear();
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Determine active page based on current route
  const getActivePage = () => {
    const path = router.pathname;
    if (path.includes('/app/main') || path.includes('/app/collections')) return 'Collections';
    if (path.includes('/app/study')) return 'Study';
    if (path.includes('/app/settings')) return 'Settings';
    if (path === '/') return 'Homepage';
    if (path.includes('/guide')) return 'Help';
    return '';
  };

  const activePage = getActivePage();

  // User information
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const isPro = userSettings?.membershipType === "lifetime";
  const avatarUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} asChild>
    <aside
      className={`h-screen bg-surface-sidebar border-r border-border transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isExpanded ? "w-64" : "w-[69px]"} sticky left-0 top-0 z-10`}
      style={{ flexShrink: 0 }}
    >
      <div
        className={`flex items-center h-16 border-b border-border overflow-hidden ${isExpanded ? "justify-between px-6" : "justify-center px-3"}`}
      >
        {isExpanded && (
          <div className="flex items-center gap-3">
            <img
              src="/repcode.png"
              alt="Repcode"
              className="w-8 h-8 object-contain"
            />
            <Heading as="h2" size="xl" weight="bold" tone="foreground" className="tracking-tight truncate">
              Repcode
            </Heading>
          </div>
        )}
        <CollapsibleTrigger asChild>
        <Button variant="sidebarCollapse" size="natural"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <ChevronLeftIcon size={20} /> : <ChevronRightIcon size={20} />}
        </Button>
        </CollapsibleTrigger>
      </div>

      <ScrollArea asChild direction="vertical" className="flex-1 py-4 px-3">
      <nav aria-label="Application navigation">
        <ul className="space-y-2">
          <SidebarItem
            icon={<FolderIcon size={20} />}
            text="Collections"
            active={activePage === 'Collections'}
            expanded={isExpanded}
            href="/app/main"
          />
          <SidebarItem
            icon={<BookOpenIcon size={20} />}
            text="Study"
            active={activePage === 'Study'}
            expanded={isExpanded}
            href="/app/study/dashboard"
          />
          <SidebarItem
            icon={<SettingsIcon size={20} />}
            text="Settings"
            active={activePage === 'Settings'}
            expanded={isExpanded}
            href="/app/settings/UserSettings"
          />
          <SidebarItem
            icon={<HomeIcon size={20} />}
            text="Homepage"
            active={activePage === 'Homepage'}
            expanded={isExpanded}
            href="/"
          />
          <SidebarItem
            icon={<HelpCircleIcon size={20} />}
            text="Help"
            active={activePage === 'Help'}
            expanded={isExpanded}
            href="/guide"
            target="_blank"
          />

          

        <SidebarItem
          icon={<BugIcon size={20} />}
          text="Report Bug"
          expanded={isExpanded}
          onClick={() => setShowReportBug(true)}
        />


        </ul>

      </nav>
      </ScrollArea>

      <div className="p-3 border-t border-border mt-auto overflow-hidden">
        <div
          className={`
          relative p-3
          ${isExpanded ? 'bg-surface/50 backdrop-blur-sm border border-border rounded-lg' : 'flex flex-col items-center'}
        `}
        >
          <div className={`flex ${isExpanded ? 'items-center' : 'flex-col gap-2'}`}>
            <div className="relative">
              {/* Add subtle glow and animation to the avatar */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-app-action-start/40 to-app-action-end/40 blur-md opacity-70 animate-pulse"></div>

              <Avatar variant="sidebar">
                <AvatarImage
                  src={avatarUrl}
                  alt={userName}
                  variant="interactive"
                />
                <AvatarFallback role="img" aria-label={userName}>{userName.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isPro && !isExpanded && (
                <Badge variant="membership" size="membership" asChild><div className="absolute -bottom-1 left-1/2 -translate-x-1/2">PRO</div></Badge>
              )}
            </div>
            <CollapsibleContent asChild forceMount>
              <div className={`ml-3 overflow-hidden flex-1 ${isExpanded ? '' : 'hidden'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{userName}</p>
                    {isPro && (
                      <Badge variant="membership" size="membership" asChild><div>PRO</div></Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
              </div>
            </CollapsibleContent>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3">
            <Button variant="signOut" size="comfortable" className="w-full"
              onClick={logOut}>
              <LogOutIcon size={16} />
              Sign out
            </Button>
          </div>
        )}

      </div>


      {showReportBug && <ReportBugModal isOpen={showReportBug} onClose={() => setShowReportBug(false)} />}
    </aside>
    </Collapsible>
  );
};

export default SideBar;

