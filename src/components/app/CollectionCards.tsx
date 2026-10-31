import { Heading } from '@/components/ui/typography';
import { HelpTooltip } from '@/components/ui/tooltip';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/loading-state';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useEffect, useContext } from "react";
import CollectionModal from "./CollectionModal";
import { auth } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { AuthContext } from "@/auth/AuthContext";
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { formatDistanceToNow } from 'date-fns';

const CollectionCards = ({ createOpen, onCreateOpenChange }: {
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
}) => {
  const { toast: showToast } = useToast(3000);
  const [internalCreateOpen, setInternalCreateOpen] = useState(false);
  const isModalOpen = createOpen ?? internalCreateOpen;
  const setIsModalOpen = onCreateOpenChange ?? setInternalCreateOpen;
  const [visibleMenuId, setVisibleMenuId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<any>(null);
  const [deletingCollections, setDeletingCollections] = useState<Set<number>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<any>(null);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const router = useRouter();

  // Helper function to check if a date is older than 30 days
  const isOlderThanMonth = (date: string | null) => {
    if (!date) return false;
    const lastUpdated = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  };


  const fetchCollections = async () => {
    if (!user) return null;
    const response = await authenticatedFetch(`/api/getUserCollections`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  const { isLoading, data: collections = [], error } = useQuery(['collections', user?.email], fetchCollections, {
    enabled: !!user?.email,
  })

  const toggleMenu = (id: any) => {
    setVisibleMenuId(visibleMenuId === id ? null : id);
  };

  // Function to open the delete confirmation modal
  const openDeleteConfirmation = (collection: any) => {
    setCollectionToDelete(collection);
    setDeleteConfirmationOpen(true);
  };

  // Function to close the delete confirmation modal
  const closeDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    setCollectionToDelete(null);
  };

  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  const deleteCollectionMutation = useMutation(
    async (collectionId: any) => {
      setIsDeletingCollection(true);
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error('Authentication token is not available.');
      }

      const response = await authenticatedFetch(`/api/deleteCollection?collectionId=${collectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Problem deletion failed');
      return response.json();
    },
    {
      onSuccess: () => {
        setDeleteConfirmationOpen(false);

        queryClient.invalidateQueries(['collections', user?.email]);
        queryClient.invalidateQueries(['allProblems', user?.email]);
        queryClient.invalidateQueries(['userSettings', user?.email]);
        showToast(
          <>
            <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
            Collection deleted successfully
          </>
        );
      },
      onError: () => {
        showToast('Failed to delete collection. Please try again.');
      },
      onSettled: (_data, _error, collectionId) => {
        setIsDeletingCollection(false);
        setDeletingCollections(previous => { const next = new Set(previous); next.delete(collectionId); return next; });
      }
    }
  );

  const deleteCollection = () => {
    if (collectionToDelete && !isDeletingCollection) {
      setDeletingCollections((prev) => new Set(prev).add(collectionToDelete.id));
      deleteCollectionMutation.mutate(collectionToDelete.id);
    }
  }

  const openEditModal = (collection: any) => {
    setCollectionToEdit(collection);
    setIsEditModalOpen(true);
    setVisibleMenuId(null);
  };



  const totalCollections = collections.length;
  const totalProblems = collections.reduce((acc: number, collection: any) => {
    return acc + collection.newCount + collection.learningCount + collection.reviewCount;
  }, 0);

  if (error) return <Alert variant="plain">Error: {(error as Error).message}</Alert>;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingState />
      </div>
    );
  }

  return (
    <>
      {collections.length === 0 ? (
        <Empty>
          <EmptyHeader>
            {/* Icon */}
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto bg-surface rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-app-action-end/10 to-app-action-start/5"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-muted-foreground relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </div>
              {/* Floating dots decoration */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-app-action-end/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-app-action-start/40 rounded-full animate-pulse animation-delay-300"></div>
            </div>

            {/* Title */}
            <EmptyTitle>
              No Collections Yet
            </EmptyTitle>

            {/* Message */}
            <EmptyDescription>
              Looks like you don&apos;t have any collections. You can create one by clicking the button in the top right!
            </EmptyDescription>

            {/* Decorative element */}
            <div className="flex items-center justify-center space-x-1 opacity-50">
              <div className="w-1 h-1 bg-app-action-end rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-app-action-start rounded-full animate-pulse animation-delay-300"></div>
              <div className="w-1 h-1 bg-app-action-end rounded-full animate-pulse animation-delay-600"></div>
            </div>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-8 gap-y-8">
        {collections.map((collection: any) => (
          <Card elevation="collection" key={collection.id}
            className="overflow-hidden">
            <div className="p-6">
              <Heading as="h3" size="xl" weight="semibold" tone="foreground" className="mb-2 truncate">
                {collection.title}
              </Heading>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Last updated: {collection.lastAdded ? formatDistanceToNow(new Date(collection.lastAdded), { addSuffix: true }) : 'N/A'}</span>
                {collection.lastAdded && isOlderThanMonth(collection.lastAdded) && (
                  <HelpTooltip content="It's been a while since you've solved a new problem from this pattern. Solve a new one soon to keep your understanding fresh!">
                    <Button variant="bare" className="ml-2" aria-label="Collection activity reminder"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-status-danger-soft hover:text-status-danger transition-colors cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg></Button>
                  </HelpTooltip>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="flex w-full h-2 bg-surface-count rounded-full overflow-hidden">
                  <div className="h-full bg-study-new rounded-l-full" style={{
                    width: `${(collection.newCount / Math.max(1, collection.newCount + collection.learningCount + collection.reviewCount)) * 100}%`,
                    display: collection.newCount > 0 ? 'block' : 'none'
                  }}></div>
                  <div className="h-full bg-study-learning" style={{
                    width: `${(collection.learningCount / Math.max(1, collection.newCount + collection.learningCount + collection.reviewCount)) * 100}%`,
                    display: collection.learningCount > 0 ? 'block' : 'none'
                  }}></div>
                  <div className="h-full bg-study-review rounded-r-full" style={{
                    width: `${(collection.reviewCount / Math.max(1, collection.newCount + collection.learningCount + collection.reviewCount)) * 100}%`,
                    display: collection.reviewCount > 0 ? 'block' : 'none'
                  }}></div>
                </div>
              </div>

              {/* Problem counts */}
              <div className="flex space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <span className="inline-block bg-study-new mr-1.5 rounded-full" style={{ width: '8px', height: '8px' }}></span>
                  <span>{collection.newCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block bg-study-learning mr-1.5 rounded-full" style={{ width: '8px', height: '8px' }}></span>
                  <span>{collection.learningCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block bg-study-review mr-1.5 rounded-full" style={{ width: '8px', height: '8px' }}></span>
                  <span>{collection.reviewCount}</span>
                </div>
              </div>

              <div className="flex justify-between mt-5">
                <Button variant="text" className="flex items-center" tone="accent" aria-label={`Open ${collection.title}`}
                  onClick={() => {
                    if (!deletingCollections.has(collection.id)) {
                      router.push(`/app/collections/${collection.id}`);
                    }
                  }}
                >
                  <span className="mr-1">View problems</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Button>
                <div className="flex space-x-2">
                  <Button variant="icon" size="iconMd" tone="edit" aria-label={`Edit ${collection.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(collection);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </Button>
                  <Button variant="icon" size="iconMd" tone="danger" aria-label={`Delete ${collection.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteConfirmation(collection);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Modal Components */}
      <CollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEditMode={true}
        collectionToEdit={collectionToEdit}
        showToast={showToast}
      />
      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showToast={showToast}
      />

      {/* Delete Confirmation */}
      {/* Modal Backdrop */}


      {/* Modal */}
      <ConfirmationDialog open={deleteConfirmationOpen} onClose={closeDeleteConfirmation} title="Delete Collection" busy={isDeletingCollection} onConfirm={deleteCollection}>
              Are you sure you want to delete <span className="font-semibold text-foreground">{collectionToDelete?.title}</span>? This will delete all problems inside as well.
      </ConfirmationDialog>

      {/* Toast Notifications */}
    </>
  );
};

export default CollectionCards;

