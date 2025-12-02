import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/auth/AuthContext';

const NavBar = () => {
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [buttonShadow, setButtonShadow] = useState('0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)');

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* Announcement Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#000000] text-primary py-2 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm animate-[slideDown_0.5s_ease-out]">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
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
      
      <nav
        className={`fixed top-12 sm:top-8 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#343B4A]/70 backdrop-blur-md shadow-lg shadow-black/5' 
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-12"> 
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-none text-xl font-semibold text-[#FFFFFF]">
                <img src="/logo14.png" alt="Brand Logo" className="h-8 sm:h-10 md:h-12" />
              </Link>
              
              {/* Version indicator with divider - hidden on small screens */}
              <div className="hidden sm:flex items-center ml-2 md:ml-4">
                {/* Angled divider */}
                <div className="h-6 w-px bg-gradient-to-b from-[#4B5563]/20 to-[#6B7280]/20 transform rotate-12"></div>
                
                {/* Version pill */}
                <div 
                  className={`ml-2 md:ml-4 flex items-center px-2 md:px-3 py-1 rounded-full transition-all duration-300 border border-[#4B5563]/20 bg-[#0F172A]/20`}
                >
                  {/* Pulsing dot */}
                  <div className="relative mr-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#10B981]"></div>
                    <div 
                      className="absolute top-0 left-0 h-2 w-2 rounded-full bg-[#10B981] opacity-75"
                      style={{
                        animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite'
                      }}
                    ></div>
                  </div>
                  
                  {/* Version text */}
                  <span className="text-xs font-medium text-[#E5E7EB]">v2.16</span>
                </div>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/guide"
                className="text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors"
              >
                Guide
              </Link>
              <Link
                href="/changelog"
                className="text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors"
              >
                Changelog
              </Link>
              <Link
                href="/#contact"
                className="text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors"
              >
                Contact
              </Link>
              <Link
                href="https://github.com/hussiiii/Repcode"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Link>
              <Link
                href="/login"
                className="flex items-center px-4 py-2 rounded-lg transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                  color: '#FFFFFF',
                  boxShadow: buttonShadow
                }}
                onMouseOver={() => setButtonShadow('0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)')}
                onMouseOut={() => setButtonShadow('0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)')}
              >
                <span className="material-icons mr-2" style={{ fontSize: '18px' }}>auto_awesome</span>
                <span>Launch App</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-[#B0B7C3] hover:text-[#FFFFFF] p-2"
                onClick={toggleMenu}
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
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="mt-2 mx-4 p-4 rounded-lg bg-[#343B4A]/95 backdrop-blur-md border border-[#4B5563]/20 shadow-lg shadow-black/20">
              <div className="space-y-3">
                <Link
                  href="/guide"
                  className="block text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors py-2 px-2 rounded-md hover:bg-[#4B5563]/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Guide
                </Link>
                <Link
                  href="/changelog"
                  className="block text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors py-2 px-2 rounded-md hover:bg-[#4B5563]/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Changelog
                </Link>
                <Link
                  href="/#contact"
                  className="block text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors py-2 px-2 rounded-md hover:bg-[#4B5563]/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="https://github.com/hussiiii/Repcode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[#B0B7C3] hover:text-[#FFFFFF] transition-colors py-2 px-2 rounded-md hover:bg-[#4B5563]/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full px-4 py-2 mt-4 rounded-lg transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="material-icons mr-2" style={{ fontSize: '18px' }}>auto_awesome</span>
                  <span>Launch App</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
