import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FieldLabel, Field } from '@/components/ui/field';
import { InputGroup } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from "@/auth/AuthContext";

const CollectionModal = ({ isOpen, onClose, isEditMode = false, collectionToEdit = null, showToast: notify }: { isOpen: boolean, isEditMode?:any, collectionToEdit?:any, onClose: any, showToast?: (message: React.ReactNode) => void }) => {
  const { toast } = useToast();
  const showToast = notify ?? toast;
  const submittingRef = useRef(false);
  const [collectionName, setCollectionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditMode && collectionToEdit) {
      setCollectionName(collectionToEdit.title);
    } else {
      setCollectionName('');
    }
  }, [isEditMode, collectionToEdit]);





  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

  const { isLoading: userLoading, data: theUser, error: userError } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user,
  });

  const mutation = useMutation(
    async ({ title, userEmail, headers }: { title: any, userEmail: any, headers: HeadersInit }) => {
      setIsSubmitting(true);
      const url = isEditMode ? `/api/updateCollection?collectionId=${collectionToEdit.id}` : '/api/createCollection';
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await authenticatedFetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify({
          title: title,
          userEmail: userEmail
        }),
      });
      if (!response.ok) throw new Error('Failed to submit collection');
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collections', user?.email]);
        queryClient.invalidateQueries(['collectionDetails']);
        queryClient.invalidateQueries(['userSettings', user?.email]);

        showToast(
          <>
            <span className="inline-block mr-2 bg-status-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
            {isEditMode ? 'Collection updated successfully' : 'Collection created successfully'}
          </>
        );
        onClose();
      },
      onError: (error: any) => {
        console.error('Failed to submit collection:', error);
        showToast('Failed to submit collection. Please try again.');
      },
      onSettled: () => {
        setIsSubmitting(false);
        submittingRef.current = false;
      }
    }
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (submittingRef.current || !collectionName.trim()) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      // Retrieve the Firebase authentication token
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error('Authentication token is not available.');
      }

      // Include the token in the Authorization header
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      mutation.mutate({
        title: collectionName,
        userEmail: user?.email,
        headers: headers  // Pass headers to the mutation function
      });
    } catch (error) {
      console.error('Failed to submit form:', error);
      showToast('Unable to submit. Please sign in again and retry.');
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (theUser?.membershipType === 'free' && theUser?.collections?.length >= 3 && !isEditMode) {
    return (
      <>
        {/* Modal Backdrop */}


        {/* Modal */}
        <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent dismissible={!isSubmitting} onOpenAutoFocus={event => { if (inputRef.current) { event.preventDefault(); inputRef.current.focus(); } }}>
          {/* Decorative accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-status-danger to-status-danger-soft"></div>

          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <DialogTitle>Free Tier limit reached!</DialogTitle>
              <Button variant="close" aria-label="Close dialog" disabled={isSubmitting}
                onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <div className="space-y-5">
              <p className="text-foreground-soft text-sm">You may only create up to 3 collections on the free tier. To create more, please upgrade your membership.</p>

              {/* Modal Footer */}
              <div className="flex justify-end pt-4">
                <Button variant="dialog" size="dialog" emphasis="dialog"
                  onClick={onClose}>
                  Close
                  <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <>
      {/* Modal Backdrop */}


      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent dismissible={!isSubmitting} onOpenAutoFocus={event => { if (inputRef.current) { event.preventDefault(); inputRef.current.focus(); } }}>
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
          <div className="flex items-center justify-between mb-6 relative z-10">
            <DialogTitle>{isEditMode ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
            <Button variant="close" aria-label="Close dialog" disabled={isSubmitting}
              onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <Field spacing="loose">
              <FieldLabel variant="field" >
                Name
                <span className="ml-1 text-xs text-difficulty-hard">*</span>
              </FieldLabel>
              <InputGroup variant="glow" >
                <Input variant="dialog" className="w-full"
                  ref={inputRef}
                  type="text"
                  name="collectionName"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="Enter collection name..."
                />

              </InputGroup>
            </Field>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4">
              <Button variant="dialog" size="dialog" emphasis="dialog" loading={isSubmitting}
                type="submit"
                disabled={!collectionName.trim() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner variant="button" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update' : 'Create'
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

export default CollectionModal;

