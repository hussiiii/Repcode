import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import Toast from './Toast';

interface RandomProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RandomProblemModal = ({ isOpen, onClose }: RandomProblemModalProps) => {
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const fetchCollections = async () => {
    if (!user) return [];
    const response = await fetch(`/api/getUserCollections?userEmail=${user.email}`);
    if (!response.ok) throw new Error('Failed to fetch collections');
    return response.json();
  };

  const fetchUserSettings = async () => {
    if (!user) return null;
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const showToast = (message: any) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

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
    if (selectedCollections.size === 0) {
      showToast(
        <>
          <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Please select at least one collection
        </>
      );
      return;
    }

    if (!userSettings?.id) {
      showToast(
        <>
          <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
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
        const response = await fetch(`/api/getCollectionProblems?collectionId=${collectionId}&userId=${userSettings.id}`);
        if (response.ok) {
          const problems = await response.json();
          allProblems.push(...problems);
        }
      }

      if (allProblems.length === 0) {
        showToast(
          <>
            <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
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
          <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
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
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-50 w-full max-w-md max-h-[85vh] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 bg-gradient-to-b from-[#2A303C] to-[#252B38] border border-[#3A4150]/50 text-primary overflow-hidden flex flex-col ${isOpen ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-[40%] pointer-events-none"}`}
      >
        {/* Decorative accent line at top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] flex-shrink-0"></div>
        
        <div className="p-6 relative flex-1 flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold tracking-tight text-primary">Solve Random Problem</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-[#3A4150]/70 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <p className="text-gray-300 text-sm flex-shrink-0">
              Select the collections you want to choose from, then click Solve to get a random problem.
            </p>
            
            {/* Select/Deselect All buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={selectAll}
                className="text-xs px-3 py-1.5 bg-[#343B4A] hover:bg-[#3F475A] text-[#B0B7C3] hover:text-primary rounded-md transition-colors duration-200"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-xs px-3 py-1.5 bg-[#343B4A] hover:bg-[#3F475A] text-[#B0B7C3] hover:text-primary rounded-md transition-colors duration-200"
              >
                Deselect All
              </button>
            </div>
            
            {/* Collections List - Scrollable */}
            <div className="space-y-2 overflow-y-auto pr-2 flex-1 min-h-0">
              {(isLoading || !userSettings) ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-[#3b82f6]"
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
                </div>
              ) : collections.length === 0 ? (
                <p className="text-center text-[#B0B7C3] text-sm py-8">No collections found</p>
              ) : (
                collections.map((collection: any) => {
                  const totalProblems = collection.newCount + collection.learningCount + collection.reviewCount;
                  return (
                    <label
                      key={collection.id}
                      className="flex items-center p-3 bg-[#343B4A] hover:bg-[#3F475A] rounded-lg cursor-pointer transition-colors duration-200 group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.has(collection.id)}
                        onChange={() => toggleCollection(collection.id)}
                        className="w-4 h-4 rounded border-[#3A4150] bg-[#1E232C] text-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/50 cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary group-hover:text-white transition-colors">
                            {collection.title}
                          </span>
                          <span className="text-xs text-[#B0B7C3]">
                            {totalProblems} {totalProblems === 1 ? 'problem' : 'problems'}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-4 flex-shrink-0">
              <button 
                onClick={handleSolve}
                disabled={selectedCollections.size === 0 || isSelecting || !userSettings}
                className={`relative overflow-hidden bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0ea5c4] hover:to-[#2d74e7] text-primary shadow-md transition-all duration-200 py-2 px-6 rounded-md ${(selectedCollections.size === 0 || isSelecting || !userSettings) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSelecting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary inline-block"
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
                    Finding...
                  </>
                ) : (
                  'Solve'
                )}
                <span className="absolute inset-0 w-full h-full bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
};

export default RandomProblemModal;

