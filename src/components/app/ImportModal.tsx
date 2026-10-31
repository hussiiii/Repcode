import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FieldLabel, Field } from '@/components/ui/field';
import { InputGroup } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import { auth } from '../../firebaseConfig';
import { useToast } from '@/components/ui/use-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
}

const ImportModal = ({ isOpen, onClose, collectionId }: ImportModalProps) => {
  const { toast: showToast } = useToast(5000);
  const [slug, setSlug] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when modal opens


  // Handle keyboard events (Escape to close, Enter to submit)




  const handleImport = async () => {
    if (isImporting || !slug.trim()) return;
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


      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent dismissible={!isImporting} onOpenAutoFocus={event => { if (inputRef.current) { event.preventDefault(); inputRef.current.focus(); } }}>
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
            <DialogTitle>Import Leetcode List</DialogTitle>
            <Button variant="close" aria-label="Close dialog" disabled={isImporting}
              onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <form onSubmit={event => { event.preventDefault(); handleImport(); }} className="space-y-5 relative z-10">
            <p className="text-foreground-soft text-sm">
              Enter the slug of any public Leetcode list, then press Import to add all the problems and their details from that list to this collection.
            </p>

            {/* Warning Banner */}
            <Alert variant="importWarning">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-error mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="ml-3 text-xs text-muted-foreground">
                <span className="text-status-error font-medium">Warning:</span> This feature is experimental and sometimes doesn&apos;t work properly. If you import and nothing happens or it loads for a long time, just refresh the page.
              </p>
            </Alert>

            <Alert variant="note" role="note">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-attention mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-xs text-muted-foreground">
                Note: The problems that you import will be spaced out accordingly for Study Mode: they will not all be due on the same day, even though they are being uploaded on the same day.
              </p>
            </Alert>

            <Field spacing="loose">
              <div className="flex justify-between items-center">
                <FieldLabel variant="field" >
                  Leetcode List Slug
                  <span className="ml-1 text-xs text-difficulty-hard">*</span>
                </FieldLabel>
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
              <InputGroup variant="glow" >
                <Input variant="dialog" className="w-full"
                  ref={inputRef}
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Enter Leetcode list slug..."
                />

              </InputGroup>
            </Field>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4">
              <Button variant="dialog" size="dialog" emphasis="dialog" loading={isImporting}
                type="submit"
                disabled={!slug.trim() || isImporting}>
                {isImporting ? (
                  <>
                    <Spinner variant="button" />
                    Importing...
                  </>
                ) : (
                  'Import'
                )}
                <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportModal;
