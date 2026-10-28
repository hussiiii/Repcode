import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import { auth } from '../../firebaseConfig'; 
import Toast from './Toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
}

const ImportModal = ({ isOpen, onClose, collectionId }: ImportModalProps) => {
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [slug, setSlug] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle keyboard events (Escape to close, Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      } else if (e.key === "Enter" && isOpen && slug.trim() && !isImporting) {
        handleImport();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, slug, isImporting, onClose]);

  const showToast = (message: any) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 5000);
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await authenticatedFetch('/api/importFromLeetcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          slug: slug.trim(),
          collectionId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import problems');
      }

      const result = await response.json();

      // Call updateCollectionCounts endpoint after successful import
      const updateResponse = await authenticatedFetch('/api/updateCollectionCounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId: collectionId }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update collection counts');
      }

      onClose();
      
      // Match the same invalidations as ProblemModal
      queryClient.invalidateQueries(['collectionDetails']);
      queryClient.invalidateQueries(['problemDetails']);
      queryClient.invalidateQueries(['allProblems', user?.email]);
      queryClient.invalidateQueries(['dueTodayProblems', user?.email]);
      queryClient.invalidateQueries(['userSettings', user?.email]);
      queryClient.invalidateQueries(['collectionProblems', collectionId]);
      queryClient.invalidateQueries(['collections', user?.email]);

    } catch (error: any) {
      console.error('Import error:', error);
      showToast(
        <>
          <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          {error.message}
        </>
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-overlay/60 backdrop-blur-sm z-50 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-xl shadow-[0_10px_40px_rgb(var(--overlay)/0.3)] transition-all duration-500 bg-gradient-to-b from-background to-surface-dialog-end border border-border-subtle/50 text-foreground overflow-hidden ${isOpen ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-[40%] pointer-events-none"}`}
      >
        {/* Decorative accent line at top */}
        <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end"></div>
        
        <div className="p-6 relative">
          {/* Decorative curved gradient line at bottom - positioned behind content */}
          <div className="absolute bottom-0 left-0 right-0 mx-4 h-12 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            <svg
              className="w-full"
              height="20"
              viewBox="0 0 400 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path d="M0 10C80 20 180 0 400 10" stroke="url(#blueGradient)" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="10" x2="400" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stopColor={cssColor('app-action-start')} />
                  <stop offset="1" stopColor={cssColor('app-action-end')} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Import Leetcode List</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-border-subtle/70 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-5 relative z-10">
            <p className="text-foreground-soft text-sm">
              Enter the slug of any public Leetcode list, then press Import to add all the problems and their details from that list to this collection.
            </p>
            
            {/* Warning Banner */}
            <div className="flex items-start bg-status-import-error-background/30 p-3 rounded-lg border border-status-error/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-error mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="ml-3 text-xs text-muted-foreground">
                <span className="text-status-error font-medium">Warning:</span> This feature is experimental and sometimes doesn&apos;t work properly. If you import and nothing happens or it loads for a long time, just refresh the page.
              </p>
            </div>
            
            <div className="flex items-start bg-surface/50 p-3 rounded-lg border border-status-attention/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-attention mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-xs text-muted-foreground">
                Note: The problems that you import will be spaced out accordingly for Study Mode: they will not all be due on the same day, even though they are being uploaded on the same day.
              </p>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label htmlFor="slug" className="text-sm font-medium text-foreground-soft flex items-center">
                  Leetcode List Slug
                  <span className="ml-1 text-xs text-difficulty-hard">*</span>
                </label>
                <div 
                  className="relative text-app-highlight text-xs cursor-pointer hover:underline"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  How do I find the slug of a public list?
                  {isHovering && (
                    <div className="absolute right-0 bottom-full mb-2 z-50">
                      <img 
                        src="/slug.png" 
                        alt="Slug example"
                        className="rounded-md shadow-lg border border-border-subtle max-w-[500px]"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="relative group">
                <input 
                  ref={inputRef}
                  type="text" 
                  id="slug" 
                  name="slug" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  className="w-full px-3 py-2 bg-surface-field border border-border-subtle/70 rounded-md shadow-sm outline-none focus:outline-none focus:border-app-action-start/70 focus:ring-1 focus:ring-app-action-end/50 transition-all duration-200 text-foreground h-11"
                  placeholder="Enter Leetcode list slug..."
                  style={{ outline: 'none' }}
                />
                <div className="absolute inset-0 rounded-md border border-app-action-end/0 group-focus-within:border-app-action-end/30 pointer-events-none transition-all duration-300 shadow-[0_0_0_0_rgb(var(--app-action-end)/0)] group-focus-within:shadow-[0_0_10px_1px_rgb(var(--app-action-end)/0.2)]"></div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleImport}
                disabled={!slug.trim() || isImporting}
                className={`relative overflow-hidden bg-gradient-to-r from-app-action-start to-app-action-end hover:from-app-action-dialog-hover-start hover:to-app-action-dialog-hover-end text-foreground shadow-md transition-all duration-200 py-2 px-6 rounded-md ${(!slug.trim() || isImporting) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isImporting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground inline-block"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  'Import'
                )}
                <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
};

export default ImportModal; 