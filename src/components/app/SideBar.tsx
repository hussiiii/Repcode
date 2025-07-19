import React, { useState, useContext } from 'react';
import { auth } from '../../firebaseConfig'; 
import { signOut } from "firebase/auth";
import { useRouter } from 'next/router';
import Link from 'next/link';
import "../../app/globals.css"; 
// import useDarkMode from '../../../useDarkMode';
import { useQuery, useMutation, useQueryClient } from 'react-query'; 
import { useSidebar } from '../../auth/SidebarContext';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { AuthContext } from '@/auth/AuthContext';
import { 
  FolderIcon, 
  BookOpenIcon, 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Home as HomeIcon, 
  HelpCircle as HelpCircleIcon, 
  LogOut as LogOutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

// SidebarItem component
interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
  href?: string;
  tooltip?: string;
}

function SidebarItem({
  icon,
  text,
  active = false,
  expanded,
  onClick,
  href,
  tooltip,
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
  
  const className = `block w-full py-1.5 px-2 rounded-lg transition-all duration-300 ${
    active 
      ? "bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-primary" 
      : "text-[#8A94A6] hover:bg-[#343B4A] hover:text-primary"
  }`;
  
  return (
    <li>
      {href ? (
        <Link href={href} className={className}>
          {content}
        </Link>
      ) : (
        <button 
          className={className} 
          onClick={onClick}
          {...(!expanded && tooltip ? { 'data-tooltip-id': 'sidebar-tooltip', 'data-tooltip-content': tooltip } : {})}
        >
          {content}
        </button>
      )}
    </li>
  );
}

const SideBar = () => {
  // const [colorTheme, setTheme] = useDarkMode() as any; 
  const router = useRouter();
  const { isExpanded, setIsExpanded } = useSidebar() as any;
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [masterCollectionsDropdownOpen, setMasterCollectionsDropdownOpen] = useState(false);
  const [collections, setCollections] = useState<{id: any; title: any; isLoading: boolean; problems:any}[]>([]);
  const [expandedCollectionId, setExpandedCollectionId] = useState(null); // Track expanded collection

  // User settings query
  const fetchUserSettings = async () => {
    if (!user) throw new Error('No user found');
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
    if (!response.ok) throw new Error('Failed to fetch user settings');
    return response.json();
  };

  const { data: userSettings } = useQuery(
    ['userSettings', user?.email],
    fetchUserSettings,
    { enabled: !!user }
  );

  // useEffect(() => {
  //   // Listen for authentication state changes
  //   const unsubscribe = auth.onAuthStateChanged(user => {
  //     if (user) {
  //       // Proceed to fetch collections if the user is authenticated
  //       const fetchCollections = async () => {
  //         try {
  //           const response = await fetch(`/api/getUserCollections?userEmail=${user.email}`);
  //           if (!response.ok) {
  //             throw new Error('Failed to fetch collections');
  //           }
  //           const data = await response.json();
  //           const collectionsWithProblems = data.map((collection:any) => ({
  //             ...collection,
  //             problems: [],
  //             isLoading: false,
  //           }));
  //           setCollections(collectionsWithProblems);
  //         } catch (error) {
  //           console.error('Failed to fetch collections', error);
  //         }
  //       };
  //       fetchCollections();
  //     } else {
  //       // Handle user not signed in or other actions as necessary
  //       console.log('User not signed in');
  //       // Optionally clear collections
  //       setCollections([]);
  //     }
  //   });
  
  //   // Cleanup subscription on component unmount
  //   return () => unsubscribe();
  // }, []);

  const fetchProblemsForCollection = async (collectionId:any) => {
    // Find collection index
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) return;

    // Set loading state for the collection
    let updatedCollections = [...collections];
    updatedCollections[collectionIndex].isLoading = true;
    setCollections(updatedCollections);

    const response = await fetch(`/api/getCollectionProblems?collectionId=${collectionId}`);
    if (response.ok) {
      const problems = await response.json();
      updatedCollections = updatedCollections.map(collection =>
        collection.id === collectionId ? { ...collection, problems, isLoading: false } : collection
      );
      setCollections(updatedCollections);
      // Expand or collapse collection view
      setExpandedCollectionId(expandedCollectionId === collectionId ? null : collectionId);
    } else {
      console.error('Failed to fetch problems');
      updatedCollections[collectionIndex].isLoading = false;
      setCollections(updatedCollections);
    }
  };

  const toggleMasterCollectionsDropdown = () => {
    setMasterCollectionsDropdownOpen(!masterCollectionsDropdownOpen);
    // Automatically expand the sidebar if the dropdown is being opened
    if (!masterCollectionsDropdownOpen) {
      setIsExpanded(true);
    }
  };
  
  const goGuide = () => {
    window.open('/guide', '_blank');
  };

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

  const isActive = (path: string) => router.pathname === path;

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
    <aside
      className={`h-screen bg-[#222831] border-r border-[#3A4253] transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isExpanded ? "w-64" : "w-[69px]"} sticky left-0 top-0 z-10`}
      style={{ flexShrink: 0 }}
    >
      <div
        className={`flex items-center h-16 border-b border-[#3A4253] overflow-hidden ${isExpanded ? "justify-between px-6" : "justify-center px-3"}`}
      >
        {isExpanded && (
          <div className="flex items-center gap-3">
            <img 
              src="/repcode.png" 
              alt="Repcode" 
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-xl font-bold text-primary tracking-tight truncate">
              Repcode
            </h2>
          </div>
        )}
        <button
          onClick={() => { setIsExpanded(!isExpanded); setMasterCollectionsDropdownOpen(false); }}
          className="p-1.5 rounded-lg text-[#8A94A6] hover:text-primary hover:bg-[#343B4A] transition-colors flex-shrink-0"
        >
          {isExpanded ? <ChevronLeftIcon size={20} /> : <ChevronRightIcon size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
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
            onClick={goGuide}
          />
        </ul>
      </nav>
      
      <div className="p-3 border-t border-[#3A4253] mt-auto overflow-hidden">
        <div
          className={`
          relative p-3
          ${isExpanded ? 'bg-[#343B4A]/50 backdrop-blur-sm border border-[#3A4253] rounded-lg' : 'flex flex-col items-center'}
        `}
        >
          <div className={`flex ${isExpanded ? 'items-center' : 'flex-col gap-2'}`}>
            <div className="relative">
              {/* Add subtle glow and animation to the avatar */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#06b6d4]/40 to-[#3b82f6]/40 blur-md opacity-70 animate-pulse"></div>
              
              <div className="w-11 h-11 rounded-full overflow-hidden shadow-lg shadow-[#3b82f6]/20 relative">
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {isPro && !isExpanded && (
                <div
                  className={`
                  absolute -bottom-1 left-1/2 -translate-x-1/2
                  px-1.5 py-0.5 text-[10px] font-medium
                  rounded-sm text-primary
                  bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]
                  border border-[#3b82f6]/20
                  hover:scale-110 transition-transform duration-200
                  cursor-default
                `}
                >
                  PRO
                </div>
              )}
            </div>
            {isExpanded ? (
              <div className="ml-3 overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-primary truncate">{userName}</p>
                    {isPro && (
                      <div
                        className={`
                        px-1.5 py-0.5 text-[10px] font-medium
                        rounded-sm text-primary
                        bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]
                        border border-[#3b82f6]/20
                        hover:scale-110 transition-transform duration-200
                        cursor-default
                      `}
                      >
                        PRO
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[#B0B7C3] truncate">{userEmail}</p>
              </div>
            ) : null /* No content for collapsed state - just showing the avatar */}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3">
            <button
              onClick={logOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-transparent border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/50 hover:text-[#f87171] transition-all duration-200 text-sm font-medium"
            >
              <LogOutIcon size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>

      <ReactTooltip
        id="sidebar-tooltip"
        place="right"
        style={{ backgroundColor: "#343B4A", color: "primary" }}
      />
    </aside>
  );
};

export default SideBar;

