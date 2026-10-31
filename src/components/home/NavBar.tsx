import styles from './NavBar.module.css';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const navigationLinks = [
  { href: '/guide', label: 'Guide' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/#contact', label: 'Contact' },
  { href: 'https://github.com/hussiiii/Repcode', label: 'GitHub', external: true },
];

function NavigationLinks({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  return <>
    {navigationLinks.map(link => <Link key={link.href} href={link.href}
      target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined}
      onClick={onNavigate}
      className={`${link.external ? 'flex items-center' : mobile ? 'block' : ''} text-muted-foreground hover:text-foreground transition-colors ${mobile ? 'py-2 px-2 rounded-md hover:bg-marketing-navigation-hover/20' : ''}`}>
      {link.external && <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>}
      {link.label}
    </Link>)}
    <Button asChild variant="marketingNavigation" size="action" {...(mobile ? { className: 'justify-center w-full mt-4' } : { emphasis: 'navigation' as const })}>
      <Link href="/login" onClick={onNavigate}>
        <span className="material-icons mr-2" style={{ fontSize: '18px' }}>auto_awesome</span>
        <span>Launch App</span>
      </Link>
    </Button>
  </>;
}

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
{/* Announcement Banner */}
      <div className={`${styles.announcement} fixed top-0 left-0 right-0 z-50 bg-marketing-announcement text-foreground py-2 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm`}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 bg-foreground rounded-full"></div>
            <span className="whitespace-nowrap">Repcode.io is now fully open source!</span>
          </div>
          <Link
            href="https://github.com/hussiiii/repcode"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:no-underline transition-all duration-200 whitespace-nowrap"
          >
            View Repository
          </Link>
        </div>
      </div>
      
      <Collapsible open={isMenuOpen} onOpenChange={setIsMenuOpen} asChild>
      <nav aria-label="Main navigation"
        onKeyDown={event => {
            if (event.key === 'Escape' && isMenuOpen) {
              setIsMenuOpen(false);
              menuButtonRef.current?.focus();
            }
          }}
        className={`fixed top-12 sm:top-8 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-surface/70 backdrop-blur-md shadow-lg shadow-overlay/5'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-12"> 
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-none text-xl font-semibold text-foreground">
                <img src="/logo14.png" alt="Brand Logo" className="h-8 sm:h-10 md:h-12" />
              </Link>
              
              {/* Version indicator with divider - hidden on small screens */}
              <div className="hidden sm:flex items-center ml-2 md:ml-4">
                {/* Angled divider */}
                <Separator orientation="vertical" variant="navigation" className="h-6 transform rotate-12" />
                
                {/* Version pill */}
                <div 
                  className={`ml-2 md:ml-4 flex items-center px-2 md:px-3 py-1 rounded-full transition-all duration-300 border border-marketing-navigation-border/20 bg-marketing-navigation-badge/20`}
                >
                  {/* Pulsing dot */}
                  <div className="relative mr-1.5">
                    <div className="h-2 w-2 rounded-full bg-marketing-navigation-status"></div>
                    <div 
                      className={`${styles.statusPulse} absolute top-0 left-0 h-2 w-2 rounded-full bg-marketing-navigation-status opacity-75`}
                    ></div>
                  </div>
                  
                  {/* Version text */}
                  <span className="text-xs font-medium text-marketing-navigation-badge-foreground">v2.27</span>
                </div>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8"><NavigationLinks /></div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="navigationToggle"
                size="natural"
                ref={menuButtonRef}
                aria-label="Toggle navigation"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Mobile menu */}
          <CollapsibleContent asChild>
          <div className="md:hidden">
            <div className="mt-2 mx-4 p-4 rounded-lg bg-surface/95 backdrop-blur-md border border-marketing-navigation-border/20 shadow-lg shadow-overlay/20">
              <div className="space-y-3"><NavigationLinks mobile onNavigate={() => setIsMenuOpen(false)} />
              </div>
            </div>
          </div>
          </CollapsibleContent>
        </div>
      </nav>
      </Collapsible>
    </>
  );
};

export default NavBar;
