import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { auth } from '../../firebaseConfig';
import '../../app/globals.css'; 
import { useQuery, useMutation, useQueryClient } from 'react-query'; 
import { AuthContext } from "@/auth/AuthContext";

const CollectionModal = ({ isOpen, onClose, isEditMode = false, collectionToEdit = null, showToast }: { isOpen: boolean, isEditMode?:any, collectionToEdit?:any, onClose: any, showToast:any }) => {
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
      } else if (e.key === "Enter" && isOpen && collectionName.trim() && !isSubmitting) {
        handleSubmit(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, collectionName, isSubmitting, onClose]);

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
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!collectionName.trim() || isSubmitting) return;

    // Retrieve the Firebase authentication token
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      console.error('Authentication token is not available.');
      return;
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
  };

  if (theUser?.membershipType === 'free' && theUser?.collections?.length >= 3 && !isEditMode) {
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
          {/* Decorative accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-status-danger to-status-danger-soft"></div>
          
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Free Tier limit reached!</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-border-subtle/70 transition-colors duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <p className="text-foreground-soft text-sm">You may only create up to 3 collections on the free tier. To create more, please upgrade your membership.</p>
              
              {/* Modal Footer */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={onClose}
                  className="relative overflow-hidden bg-gradient-to-r from-app-action-start to-app-action-end hover:from-app-action-dialog-hover-start hover:to-app-action-dialog-hover-end text-foreground shadow-md transition-all duration-200 py-2 px-6 rounded-md"
                >
                  Close
                  <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
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
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{isEditMode ? 'Edit Collection' : 'Create New Collection'}</h2>
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
            <div className="space-y-2.5">
              <label htmlFor="collectionName" className="text-sm font-medium text-foreground-soft flex items-center">
                Name
                <span className="ml-1 text-xs text-difficulty-hard">*</span>
              </label>
              <div className="relative group">
                <input 
                  ref={inputRef}
                  type="text" 
                  id="collectionName" 
                  name="collectionName" 
                  value={collectionName} 
                  onChange={(e) => setCollectionName(e.target.value)} 
                  className="w-full px-3 py-2 bg-surface-field border border-border-subtle/70 rounded-md shadow-sm outline-none focus:outline-none focus:border-app-action-start/70 focus:ring-1 focus:ring-app-action-end/50 transition-all duration-200 text-foreground h-11"
                  placeholder="Enter collection name..."
                  style={{ outline: 'none' }}
                />
                <div className="absolute inset-0 rounded-md border border-app-action-end/0 group-focus-within:border-app-action-end/30 pointer-events-none transition-all duration-300 shadow-[0_0_0_0_rgb(var(--app-action-end)/0)] group-focus-within:shadow-[0_0_10px_1px_rgb(var(--app-action-end)/0.2)]"></div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSubmit}
                disabled={!collectionName.trim() || isSubmitting}
                className={`relative overflow-hidden bg-gradient-to-r from-app-action-start to-app-action-end hover:from-app-action-dialog-hover-start hover:to-app-action-dialog-hover-end text-foreground shadow-md transition-all duration-200 py-2 px-6 rounded-md ${(!collectionName.trim() || isSubmitting) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
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
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update' : 'Create'
                )}
                <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionModal;

