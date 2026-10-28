import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useContext, useRef, useEffect } from 'react';
import ProblemModal from './ProblemModal';
import Toast from './Toast';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import { useRouter } from 'next/router';
import ProblemStatsModal from './ProblemStatsModal';
import DonutChart from './DonutChart';
import ImportModal from './ImportModal';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  CircleIcon,
  SparklesIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from "lucide-react";
import Badge from '@/components/ui/Badge';

const MAX_PROBLEMS = 152;

const ProblemsList = ({ collectionId }: { collectionId: any }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleMenuId, setVisibleMenuId] = useState<number|null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState(null);
  const [deletingProblems, setDeletingProblems] = useState<Set<number>>(new Set()); // Track deleting problems, so that users cant click inside collection they just deleted 
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [problemToViewStats, setProblemToViewStats] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<any>(null);
  const [isDeletingProblem, setIsDeletingProblem] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [problemToMove, setProblemToMove] = useState<any>(null);
  const [selectedTargetCollectionId, setSelectedTargetCollectionId] = useState<string>('');
  const [isMovingProblem, setIsMovingProblem] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setVisibleMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  // Helper function to check if a date is older than 30 days
  const isOlderThanMonth = (date: string | null) => {
    if (!date) return false;
    const lastUpdated = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  };

  const fetchUserSettings = async () => {
    if (!user) throw new Error('No user found');
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) throw new Error('Failed to fetch user settings');
    return response.json();
  };

  const fetchProblems = async (collectionId: any, userId: any) => {
    if (!collectionId || !userId) return null;
    const response = await authenticatedFetch(`/api/getCollectionProblems?collectionId=${collectionId}`);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access Denied');
      } else {
        throw new Error('Network response was not ok');
      }
    }
    return response.json();
  };

  const fetchCollectionDetails = async () => {
    const response = await authenticatedFetch(`/api/getCollectionDetails?collectionId=${collectionId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  const fetchUserCollections = async () => {
    if (!user?.email) throw new Error('No user found');
    const response = await authenticatedFetch(`/api/getUserCollections`);
    if (!response.ok) throw new Error('Failed to fetch collections');
    return response.json();
  };

    const toggleMenu = (id: number) => {
    setVisibleMenuId(prev => (prev === id ? null : id));
  };


  const { isLoading: isLoadingUser, data: currentUser, error: userError } = useQuery(
    ['userSettings', user?.email],
    fetchUserSettings,
    { enabled: !!user }
  );

  const { data: problems, isLoading: isLoadingProblems, error: problemsError } = useQuery(
    ['collectionDetails', collectionId, currentUser?.id],
    () => fetchProblems(collectionId, currentUser.id),
    { enabled: !!collectionId && !!currentUser }
  );

  const { data: collectionData, isLoading: isLoadingCollection, error: collectionError } = useQuery(
    ['collectionDetails', collectionId],
    fetchCollectionDetails,
    { enabled: !!collectionId }
  );

  const { data: userCollections } = useQuery(
    ['userCollections', user?.email],
    fetchUserCollections,
    { enabled: !!user?.email }
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-difficulty-easy bg-difficulty-easy-background border-difficulty-easy-border';
      case 'medium':
        return 'text-difficulty-medium bg-difficulty-medium-background border-difficulty-medium-border';
      case 'hard':
        return 'text-difficulty-hard bg-difficulty-hard-background border-difficulty-hard-border';
      default:
        return 'text-muted-foreground bg-border border-border';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'new':
        return 'text-study-new bg-study-new-background border-study-new-border';
      case 'learning':
        return 'text-study-learning bg-status-warning-background border-study-learning-border';
      case 'relearning':
        return 'text-study-learning bg-status-warning-background border-study-learning-border';
      case 'review':
        return 'text-difficulty-easy bg-difficulty-easy-background border-difficulty-easy-border';
      default:
        return 'text-muted-foreground bg-border border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'new':
        return <SparklesIcon size={14} className="mr-1.5" />;
      case 'learning':
      case 'relearning':
        return <BookOpenIcon size={14} className="mr-1.5" />;
      case 'review':
        return <CheckCircleIcon size={14} className="mr-1.5" />;
      default:
        return 'circle';
    }
  };

  const getProblemCounts = (problems: any[]) => {
    const difficultyCounts: { [key: string]: number } = { Easy: 0, Medium: 0, Hard: 0 };
    const typeCounts: { [key: string]: number } = { New: 0, Learning: 0, Relearning: 0, Review: 0 };

    problems.forEach(problem => {
      difficultyCounts[problem.difficulty] += 1;
      typeCounts[problem.type] += 1;
    });

    return { difficultyCounts, typeCounts };
  };

  const { difficultyCounts, typeCounts } = getProblemCounts(problems || []);

  const deleteProblemMutation = useMutation(
    async (problemId: any) => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Authentication token is not available.');
      }
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const response = await authenticatedFetch(`/api/deleteProblem?problemId=${problemId}`, {
        method: 'DELETE',
        headers: headers,
      });
      if (!response.ok) throw new Error('Problem deletion failed');
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collectionDetails']);
        queryClient.invalidateQueries(['dueTodayProblems', user?.email]);
        queryClient.invalidateQueries(['allProblems', user?.email]);
        queryClient.invalidateQueries(['userSettings', user?.email]);
        queryClient.invalidateQueries(['collectionProblems', collectionId]);
        showToast(
          <>
            <span
              className='inline-block mr-2 bg-status-error rounded-full'
              style={{ width: '10px', height: '10px' }}
            ></span>
            Problem deleted successfully
          </>
        );
      },
    }
  );

  const moveProblemMutation = useMutation(
    async ({ problemId, targetCollectionId }: { problemId: number; targetCollectionId: number }) => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Authentication token is not available.');
      }
      const response = await authenticatedFetch('/api/moveProblem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId, targetCollectionId }),
      });
      if (!response.ok) throw new Error('Failed to move problem');
      return response.json();
    }
  );

  const openDeleteConfirmation = (problem: any) => {
    setProblemToDelete(problem);
    setDeleteConfirmationOpen(true);
    setVisibleMenuId(null);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    setProblemToDelete(null);
  };

  const confirmDeleteProblem = () => {
    if (!problemToDelete) return;
    
    setIsDeletingProblem(true);
    setDeletingProblems((prev) => new Set(prev).add(problemToDelete.id)); 
    deleteProblemMutation.mutate(problemToDelete.id, {
      onSuccess: async () => {
        try {
          const updateResponse = await authenticatedFetch('/api/updateCollectionCounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ collectionId: collectionId }),
          });
          if (!updateResponse.ok) throw new Error('Failed to update collection counts');
        } catch (error) {
          console.error('Failed to update collection counts:', error);
        }
        queryClient.invalidateQueries(['collections', user?.email]);
        setIsDeletingProblem(false);
        closeDeleteConfirmation();
      },
      onError: () => {
        setIsDeletingProblem(false);
      },
    });
  };

  const openEditModal = (problem: any) => {
    setProblemToEdit(problem);
    setIsEditModalOpen(true);
  };

  const openMoveModal = (problem: any) => {
    setProblemToMove(problem);
    setSelectedTargetCollectionId('');
    setMoveModalOpen(true);
    setVisibleMenuId(null);
  };

  const closeMoveModal = () => {
    setMoveModalOpen(false);
    setProblemToMove(null);
    setSelectedTargetCollectionId('');
  };

  const confirmMoveProblem = () => {
    if (!problemToMove || !selectedTargetCollectionId) return;
    setIsMovingProblem(true);

    const sourceCollectionId = Number(problemToMove.collectionId);
    const targetCollectionId = Number(selectedTargetCollectionId);

    moveProblemMutation.mutate(
      { problemId: problemToMove.id, targetCollectionId },
      {
        onSuccess: async () => {
          try {
            await authenticatedFetch('/api/updateCollectionCounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collectionId: sourceCollectionId }),
            });
            await authenticatedFetch('/api/updateCollectionCounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collectionId: targetCollectionId }),
            });
          } catch (error) {
            console.error('Failed to update collection counts:', error);
          }

          queryClient.invalidateQueries(['collectionDetails']);
          queryClient.invalidateQueries(['collections', user?.email]);
          queryClient.invalidateQueries(['allProblems', user?.email]);
          queryClient.invalidateQueries(['dueTodayProblems', user?.email]);
          queryClient.invalidateQueries(['collectionProblems', sourceCollectionId]);
          queryClient.invalidateQueries(['collectionProblems', targetCollectionId]);
          queryClient.invalidateQueries(['userCollections', user?.email]);

          showToast(
            <>
              <span
                className='inline-block mr-2 bg-link rounded-full'
                style={{ width: '10px', height: '10px' }}
              ></span>
              Problem moved successfully
            </>
          );
          setIsMovingProblem(false);
          closeMoveModal();
        },
        onError: (error) => {
          console.error('Failed to move problem:', error);
          setIsMovingProblem(false);
          showToast(
            <>
              <span
                className='inline-block mr-2 bg-status-error rounded-full'
                style={{ width: '10px', height: '10px' }}
              ></span>
              Failed to move problem
            </>
          );
        },
      }
    );
  };

  const openStatsModal = (problem: any) => {
    setProblemToViewStats(problem);
    setIsStatsModalOpen(true);
  };

  const showToast = (message: any) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 5000);
  };

  const chooseRandomProblemFromCollection = async () => {
    try {
      const problems = await fetchProblems(collectionId, currentUser.id);
      const randomProblem = problems[Math.floor(Math.random() * problems?.length)];
      router.push(`/app/collections/${collectionId}/problems/${randomProblem.id}`);
    } catch (error) {
      console.error('Error fetching random problem from collection:', error);
    }
  };

  const chooseRandomProblemFromAll = async () => {
    try {
      const response = await authenticatedFetch(`/api/getAllProblemsFromUser`);
      if (!response.ok) throw new Error('Failed to fetch all problems');
      const problems = await response.json();
      const randomProblem = problems[Math.floor(Math.random() * problems?.length)];
      router.push(`/app/collections/${randomProblem.collectionId}/problems/${randomProblem.id}`);
    } catch (error) {
      console.error('Error fetching random problem from all problems:', error);
    }
  };

  if (problemsError || userError || collectionError) return <div>Error: {((problemsError || userError || collectionError) as Error).message}</div>;
  if (isLoadingProblems || isLoadingUser || isLoadingCollection) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="relative flex flex-col items-center">
          {/* Outer glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-app-action-start to-app-action-end blur-xl opacity-20 animate-pulse"></div>
          
          {/* Spinner container */}
          <div className="relative">
            {/* Gradient ring */}
            <div className="w-16 h-16 rounded-full border-2 border-transparent 
                           bg-gradient-to-r from-app-action-start to-app-action-end opacity-20"></div>
            
            {/* Spinning gradient arc */}
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent 
                           rounded-full animate-spin duration-1000" 
                 style={{
                   borderTopColor: cssColor('app-action-start'),
                   borderRightColor: cssColor('app-action-end'),
                   animationDuration: '1s'
                 }}>
            </div>
            
            {/* Inner circle with logo or icon */}
            
          </div>
          
          {/* Loading text with shimmer effect */}
          <div className="mt-4 text-sm font-medium text-muted-foreground relative overflow-hidden">
            <span>Loading</span>
            <span className="inline-flex overflow-hidden ml-1">
              <span className="animate-ellipsis">.</span>
              <span className="animate-ellipsis animation-delay-300">.</span>
              <span className="animate-ellipsis animation-delay-600">.</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProblemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        collectionId={collectionId}
        isEditMode={true}
        problemToEdit={problemToEdit}
        showToast={showToast}
      />
      <ProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collectionId={collectionId}
        showToast={showToast}
      />
      <ProblemStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        problem={problemToViewStats}
      />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        collectionId={collectionId}
      />

      <div className="max-w-full mx-auto px-2">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Link
              href="/app/main"
              className="
                relative inline-flex items-center
                px-3 py-2 -ml-1 mb-6
                text-sm font-medium
                text-muted-foreground
                rounded-lg
                transition-all duration-300
                hover:text-app-highlight
                group
              "
            >
              <div
                className="
                absolute left-0 opacity-0 -translate-x-3
                transition-all duration-300 ease-out
                group-hover:opacity-100 group-hover:translate-x-0
              "
              >
                <div
                  className="
                  bg-surface p-2 rounded-lg
                  shadow-sm shadow-overlay/5
                  group-hover:bg-app-highlight/10
                  group-hover:shadow-app-highlight/10
                  transition-all duration-300
                "
                >
                  <span className="material-icons text-sm text-placeholder group-hover:text-app-highlight transition-colors duration-300">
                    arrow_back
                  </span>
                </div>
              </div>
              <span
                className="
                transition-all duration-300
                group-hover:translate-x-8
              "
              >
                Back to Collections
              </span>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {collectionData?.title}
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface text-muted-foreground">
              {problems?.length || 0} problems
            </span>
            {collectionData?.lastAdded && (
              <>
                <div className="h-4 w-px bg-border mx-3"></div>
                <span className="text-muted-foreground text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Last updated: {formatDistanceToNow(new Date(collectionData.lastAdded), { addSuffix: true })}
                  {isOlderThanMonth(collectionData.lastAdded) && (
                    <div className="relative group ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-status-danger-soft hover:text-status-danger transition-colors cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border border-border-subtle rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
                        <div className="text-xs text-muted-foreground leading-relaxed">
                        It&apos;s been a while since you&apos;ve solved a new problem from this pattern. Solve a new one soon to keep your understanding fresh!
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-border-subtle"></div>
                      </div>
                    </div>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-2/5 max-w-xl">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-placeholder" style={{ fontSize: '18px' }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-11 pr-4 py-2.5 text-foreground placeholder-placeholder focus:outline-none focus:border-app-action-end transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-placeholder hover:text-foreground transition-colors"
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center px-4 py-2 bg-background border border-dashed border-border text-surface-control-disabled rounded-lg cursor-not-allowed opacity-60"
              disabled={true}
            >
              <span className="material-icons text-sm mr-1.5">cloud_download</span>
              <span>Import Leetcode List</span>
              <span className="ml-2 text-[10px] uppercase tracking-wide bg-border px-1.5 py-0.5 rounded text-foreground-control-disabled">Soon</span>
            </button>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setProblemToEdit(null);
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-app-action-start to-app-action-end hover:from-app-action-hover-start hover:to-app-action-hover-end text-foreground rounded-lg transition-all duration-200"
              style={{ 
                boxShadow: '0 10px 15px -3px rgb(var(--app-action-end)/0.2), 0 4px 6px -4px rgb(var(--app-action-end)/0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(var(--app-action-end)/0.3), 0 4px 6px -4px rgb(var(--app-action-end)/0.3)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(var(--app-action-end)/0.2), 0 4px 6px -4px rgb(var(--app-action-end)/0.2)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
              <span>Add Problem</span>
            </button>
          </div>
        </div>

        {problems?.length >= MAX_PROBLEMS && (
          <div className="mb-4 p-4 bg-status-critical/10 border border-status-critical/30 rounded-lg">
            <p className="text-status-critical-foreground text-sm font-medium flex items-center">
              <span className="material-icons mr-2 text-status-critical-foreground" style={{ fontSize: '18px' }}>warning</span>
              This collection has reached the maximum limit of {MAX_PROBLEMS} problems. 
              Delete some problems to add new ones.
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {problems?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="max-w-md mx-auto text-center">
                  {/* Icon */}
                  <div className="mb-6 relative">
                    <div className="w-20 h-20 mx-auto bg-surface rounded-2xl flex items-center justify-center relative overflow-hidden">
                      {/* Subtle gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-app-action-end/10 to-app-action-start/5"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-muted-foreground relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </div>
                    {/* Floating dots decoration */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-app-action-end/30 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-app-action-start/40 rounded-full animate-pulse animation-delay-300"></div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    No Problems Yet
                  </h3>
                  
                  {/* Message */}
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    This collection doesn&apos;t have any problems yet. Click &quot;Add Problem&quot; to get started!
                  </p>
                  
                  {/* Decorative element */}
                  <div className="flex items-center justify-center space-x-1 opacity-50">
                    <div className="w-1 h-1 bg-app-action-end rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-app-action-start rounded-full animate-pulse animation-delay-300"></div>
                    <div className="w-1 h-1 bg-app-action-end rounded-full animate-pulse animation-delay-600"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface rounded-xl overflow-visible border border-border shadow-lg">
              <div className="overflow-visible">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 text-muted-foreground font-medium text-sm w-10"></th>
                      <th className="text-left py-4 px-6 text-muted-foreground font-medium text-sm">Problem Name</th>
                      <th className="text-right py-4 px-6 pr-7 text-muted-foreground font-medium text-sm">Difficulty</th>
                      <th className="text-right py-4 px-6 pr-12 text-muted-foreground font-medium text-sm">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems
                      ?.filter((problem: any) =>
                        problem.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((problem: any, index: number) => (
                        <tr
                          key={problem.id}
                          className={` border-b border-border hover:bg-border/50 transition-colors ${
                            index === problems.length - 1 ? "border-b-0" : ""
                          }`}
                          onClick={() => {
                            if (!deletingProblems.has(problem.id)) {
                              router.push(`/app/collections/${collectionId}/problems/${problem.id}`);
                            }
                          }}
                        >
                          <td className="relative py-4 px-6 overflow-visible">
                            <div className="flex items-center">
                              <div ref={menuRef} className="relative">
                                <button
                                  className="p-1.5 rounded-lg hover:bg-surface-emphasis text-placeholder hover:text-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(problem.id);
                                  }}
                                  >
                                  <span className="material-icons" style={{ fontSize: '18px' }}>more_vert</span>
                                </button>
                              </div>
                              {visibleMenuId === problem.id && (
                                <div className="absolute bottom-1/3 left-3/4 w-36 rounded-lg bg-surface shadow-lg border border-border py-1">
                                  <button
                                    className="w-full px-4 py-2 text-sm text-difficulty-hard hover:bg-border hover:hard flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteConfirmation(problem);
                                    }}
                                  >
                                    <span className="material-icons mr-2" style={{ fontSize: '14px' }}>delete</span>
                                    Delete
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-sm text-muted-foreground hover:bg-border hover:text-foreground flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(problem);
                                      setVisibleMenuId(null);
                                    }}
                                  >
                                    <span className="material-icons mr-2" style={{ fontSize: '14px' }}>edit</span>
                                    Edit
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-sm text-muted-foreground hover:bg-border hover:text-foreground flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openMoveModal(problem);
                                    }}
                                  >
                                    <span className="material-icons mr-2" style={{ fontSize: '14px' }}>drive_file_move</span>
                                    Move
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-sm text-muted-foreground hover:bg-border hover:text-foreground flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openStatsModal(problem);
                                      setVisibleMenuId(null);
                                    }}
                                  >
                                    <span className="material-icons mr-2" style={{ fontSize: '14px' }}>bar_chart</span>
                                    Stats
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-foreground hover:text-app-highlight transition-colors cursor-pointer flex items-center">
                              {problem.name}
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-0 h-4 ml-1 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Badge type="difficulty" value={problem.difficulty} />
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Badge type="problemType" value={problem.type} />
                          </td>
                        </tr>
                      ))}
                    {problems?.filter((problem: any) => problem.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-muted-foreground">
                          No problems found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-overlay/60 backdrop-blur-sm z-50 transition-all duration-300 ${deleteConfirmationOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeDeleteConfirmation}
      />
      
      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-xl shadow-[0_10px_40px_rgb(var(--overlay)/0.3)] transition-all duration-500 bg-gradient-to-b from-background to-surface-dialog-end border border-border-subtle/50 text-foreground overflow-hidden ${deleteConfirmationOpen ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-[40%] pointer-events-none"}`}
      >
        {/* Decorative accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-status-danger to-status-danger-soft"></div>
        
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
              <path d="M0 10C80 20 180 0 400 10" stroke="url(#redGradientProblem)" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="redGradientProblem" x1="0" y1="10" x2="400" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stopColor={cssColor('status-danger')} />
                  <stop offset="1" stopColor={cssColor('status-danger-soft')} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Delete Problem</h2>
            <button
              onClick={closeDeleteConfirmation}
              className="h-8 w-8 rounded-full hover:bg-border-subtle/70 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-5 relative z-10">
            <p className="text-foreground-soft text-sm">
              Are you sure you want to delete <span className="font-semibold text-foreground">{problemToDelete?.name}</span>? This action cannot be undone.
            </p>
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-4">
              <button
                onClick={confirmDeleteProblem}
                disabled={isDeletingProblem}
                className={`relative overflow-hidden bg-gradient-to-r from-status-danger to-status-danger-soft hover:from-status-danger-hover hover:to-status-danger text-foreground shadow-md transition-all duration-200 py-2 px-6 rounded-md ${isDeletingProblem ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDeletingProblem ? (
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
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
                <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Move Problem Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-overlay/60 backdrop-blur-sm z-50 transition-all duration-300 ${moveModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeMoveModal}
      />

      {/* Move Problem Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-xl shadow-[0_10px_40px_rgb(var(--overlay)/0.3)] transition-all duration-500 bg-gradient-to-b from-background to-surface-dialog-end border border-border-subtle/50 text-foreground overflow-hidden ${moveModalOpen ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-[40%] pointer-events-none"}`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end"></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Move Problem</h2>
            <button
              onClick={closeMoveModal}
              className="h-8 w-8 rounded-full hover:bg-border-subtle/70 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-foreground-soft text-sm">
              Move <span className="font-semibold text-foreground">{problemToMove?.name}</span> to:
            </p>

            <select
              value={selectedTargetCollectionId}
              onChange={(e) => setSelectedTargetCollectionId(e.target.value)}
              className="w-full bg-surface-field border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-app-action-end transition-colors"
            >
              <option value="">Select a collection</option>
              {(userCollections || [])
                .filter((c: any) => c.id !== Number(collectionId))
                .map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>

            <div className="flex justify-end pt-3">
              <button
                onClick={confirmMoveProblem}
                disabled={isMovingProblem || !selectedTargetCollectionId}
                className={`relative overflow-hidden bg-gradient-to-r from-app-action-start to-app-action-end hover:from-app-action-hover-start hover:to-app-action-hover-end text-foreground shadow-md transition-all duration-200 py-2 px-6 rounded-md ${(isMovingProblem || !selectedTargetCollectionId) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isMovingProblem ? 'Moving...' : 'Move'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
};

export default ProblemsList;