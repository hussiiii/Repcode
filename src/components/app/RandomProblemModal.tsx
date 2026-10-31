import { ScrollArea } from '@/components/ui/scroll-area';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface RandomProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RandomProblemModal = ({ isOpen, onClose }: RandomProblemModalProps) => {
  const { toast: showToast } = useToast(3000);
  const [selectedCollections, setSelectedCollections] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const fetchCollections = async () => {
    if (!user) return [];
    const response = await authenticatedFetch(`/api/getUserCollections`);
    if (!response.ok) throw new Error('Failed to fetch collections');
    return response.json();
  };

  const fetchUserSettings = async () => {
    if (!user) return null;
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) throw new Error('Failed to fetch user settings');
    return response.json();
  };

  const { data: collections = [], isLoading } = useQuery(
    ['collections', user?.email],
    fetchCollections,
    {
      enabled: !!user?.email && isOpen,
    }
  );

  const { data: userSettings } = useQuery(
    ['userSettings', user?.email],
    fetchUserSettings,
    {
      enabled: !!user?.email && isOpen,
    }
  );

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen && collections.length > 0) {
      // Select all collections by default
      const allCollectionIds = new Set<number>(collections.map((c: any) => c.id as number));
      setSelectedCollections(allCollectionIds);
    }
  }, [isOpen, collections]);

  // Handle keyboard events (Escape to close)




  const toggleCollection = (collectionId: number) => {
    setSelectedCollections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allCollectionIds = new Set<number>(collections.map((c: any) => c.id as number));
    setSelectedCollections(allCollectionIds);
  };

  const deselectAll = () => {
    setSelectedCollections(new Set());
  };

  const handleSolve = async () => {
    if (isSelecting) return;
    if (selectedCollections.size === 0) {
      showToast(
        <>
          <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Please select at least one collection
        </>
      );
      return;
    }

    if (!userSettings?.id) {
      showToast(
        <>
          <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          User ID not found
        </>
      );
      return;
    }

    setIsSelecting(true);

    try {
      // Fetch all problems from selected collections
      const selectedCollectionIds = Array.from(selectedCollections);
      const allProblems: any[] = [];

      for (const collectionId of selectedCollectionIds) {
        const response = await authenticatedFetch(`/api/getCollectionProblems?collectionId=${collectionId}`);
        if (response.ok) {
          const problems = await response.json();
          allProblems.push(...problems);
        }
      }

      if (allProblems.length === 0) {
        showToast(
          <>
            <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
            No problems found in selected collections
          </>
        );
        setIsSelecting(false);
        return;
      }

      // Pick a random problem
      const randomProblem = allProblems[Math.floor(Math.random() * allProblems.length)];

      // Navigate to the problem
      router.push(`/app/collections/${randomProblem.collectionId}/problems/${randomProblem.id}`);
      onClose();
    } catch (error) {
      console.error('Error fetching random problem:', error);
      showToast(
        <>
          <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Failed to fetch random problem
        </>
      );
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <>
      {/* Modal Backdrop */}


      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent scroll="selection" dismissible={!isSelecting}>
        {/* Decorative accent line at top */}
        <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end flex-shrink-0"></div>

        <div className="p-6 relative flex-1 flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <DialogTitle>Solve Random Problem</DialogTitle>
            <Button variant="close" aria-label="Close dialog" disabled={isSelecting}
              onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <p className="text-foreground-soft text-sm flex-shrink-0">
              Select the collections you want to choose from, then click Solve to get a random problem.
            </p>

            {/* Select/Deselect All buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="selection" size="compact"
                onClick={selectAll}>
                Select All
              </Button>
              <Button variant="selection" size="compact"
                onClick={deselectAll}>
                Deselect All
              </Button>
            </div>

            {/* Collections List - Scrollable */}
            <ScrollArea direction="both" className="space-y-2  pr-2 flex-1 min-h-0">
              {(isLoading || !userSettings) ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner variant="selection" />
                </div>
              ) : collections.length === 0 ? (
                <Empty variant="inline">No collections found</Empty>
              ) : (
                collections.map((collection: any) => {
                  const totalProblems = collection.newCount + collection.learningCount + collection.reviewCount;
                  return (
                    <Label variant="option"
                      key={collection.id}
                    >
                      <Checkbox onCheckedChange={() => toggleCollection(collection.id)}
                        checked={selectedCollections.has(collection.id)}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors">
                            {collection.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {totalProblems} {totalProblems === 1 ? 'problem' : 'problems'}
                          </span>
                        </div>
                      </div>
                    </Label>
                  );
                })
              )}
            </ScrollArea>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 flex-shrink-0">
              <Button variant="dialog" size="dialog" emphasis="dialog" loading={isSelecting}
                onClick={handleSolve}
                disabled={selectedCollections.size === 0 || isSelecting || !userSettings}>
                {isSelecting ? (
                  <>
                    <Spinner variant="button" />
                    Finding...
                  </>
                ) : (
                  'Solve'
                )}
                <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default RandomProblemModal;

