import { Badge } from '@/components/ui/Badge';
import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import { Heading } from '@/components/ui/typography';
import { Table, TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { HelpTooltip } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/loading-state';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { InputGroup } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useContext, useEffect } from 'react';
import ProblemModal from './ProblemModal';
import { useToast } from '@/components/ui/use-toast';
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

const MAX_PROBLEMS = 152;

const ProblemsList = ({ collectionId }: { collectionId: any }) => {
  const { toast: showToast } = useToast(5000);
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
    if (!problemToDelete || isDeletingProblem) return;

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
        showToast('Failed to delete problem. Please try again.');
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
    if (!problemToMove || !selectedTargetCollectionId || isMovingProblem) return;
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

  if (problemsError || userError || collectionError) return <Alert variant="plain">Error: {((problemsError || userError || collectionError) as Error).message}</Alert>;
  if (isLoadingProblems || isLoadingUser || isLoadingCollection) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <LoadingState />
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
          <Heading as="h1" size="section" weight="bold" tone="foreground" className="tracking-tight">
            {collectionData?.title}
          </Heading>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Badge variant="surface" size="default" >
              {problems?.length || 0} problems
            </Badge>
            {collectionData?.lastAdded && (
              <>
                <Separator orientation="vertical" className="h-4 mx-3" />
                <span className="text-muted-foreground text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Last updated: {formatDistanceToNow(new Date(collectionData.lastAdded), { addSuffix: true })}
                  {isOlderThanMonth(collectionData.lastAdded) && (
                    <HelpTooltip content="It's been a while since you've solved a new problem from this pattern. Solve a new one soon to keep your understanding fresh!">
                    <Button variant="bare" className="ml-2" aria-label="Collection activity reminder"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-status-danger-soft hover:text-status-danger transition-colors cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg></Button>
                  </HelpTooltip>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <InputGroup variant="search" className="w-2/5 max-w-xl" >
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-placeholder" style={{ fontSize: '18px' }}>
              search
            </span>
            <Input variant="search" className="w-full" controlSize="natural" aria-label="Search problems"
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button variant="text" className="absolute right-4 top-1/2 -translate-y-1/2" tone="placeholder" aria-label="Clear search"
                onClick={() => setSearchTerm('')}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
              </Button>
            )}
          </InputGroup>

          <div className="flex items-center space-x-3">
            <Button variant="unavailable" size="action"
              onClick={() => setIsImportModalOpen(true)}
              disabled={true}
            >
              <span className="material-icons text-sm mr-1.5">cloud_download</span>
              <span>Import Leetcode List</span>
              <span className="ml-2 text-[10px] uppercase tracking-wide bg-border px-1.5 py-0.5 rounded text-foreground-control-disabled">Soon</span>
            </Button>
            <Button variant="action" size="action" emphasis="raised"
              onClick={() => {
                setIsModalOpen(true);
                setProblemToEdit(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
              <span>Add Problem</span>
            </Button>
          </div>
        </div>

        {problems?.length >= MAX_PROBLEMS && (
          <Alert variant="critical" className="mb-4">
            <p className="text-status-critical-foreground text-sm font-medium flex items-center">
              <span className="material-icons mr-2 text-status-critical-foreground" style={{ fontSize: '18px' }}>warning</span>
              This collection has reached the maximum limit of {MAX_PROBLEMS} problems.
              Delete some problems to add new ones.
            </p>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {problems?.length === 0 ? (
              <Empty>
                <EmptyHeader>
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
                  <EmptyTitle>
                    No Problems Yet
                  </EmptyTitle>

                  {/* Message */}
                  <EmptyDescription>
                    This collection doesn&apos;t have any problems yet. Click &quot;Add Problem&quot; to get started!
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
              <Card className="overflow-visible">
              <TableContainer>
                <Table variant="app">
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
                      <TableHead>Problem Name</TableHead>
                      <TableHead align="right" className="pr-7 text-muted-foreground font-medium text-sm">Difficulty</TableHead>
                      <TableHead align="right" className="pr-12 text-muted-foreground font-medium text-sm">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems
                      ?.filter((problem: any) =>
                        problem.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((problem: any, index: number) => (
                        <TableRow
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
                          <TableCell className="relative  overflow-visible">
                            <div className="flex items-center">
                              <DropdownMenu open={visibleMenuId === problem.id} onOpenChange={open => setVisibleMenuId(open ? problem.id : null)}>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="icon" size="menu" tone="menu" aria-label={`Actions for ${problem.name}`} onClick={event => event.stopPropagation()}>
                                    <span className="material-icons" style={{ fontSize: '18px' }}>more_vert</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent variant="row" align="start" side="right" sideOffset={8}>
                                  <DropdownMenuItem variant="row" destructive onSelect={() => openDeleteConfirmation(problem)}><span className="material-icons mr-2" style={{ fontSize: '14px' }}>delete</span>Delete</DropdownMenuItem>
                                  <DropdownMenuItem variant="row" onSelect={() => { openEditModal(problem); setVisibleMenuId(null); }}><span className="material-icons mr-2" style={{ fontSize: '14px' }}>edit</span>Edit</DropdownMenuItem>
                                  <DropdownMenuItem variant="row" onSelect={() => openMoveModal(problem)}><span className="material-icons mr-2" style={{ fontSize: '14px' }}>drive_file_move</span>Move</DropdownMenuItem>
                                  <DropdownMenuItem variant="row" onSelect={() => { openStatsModal(problem); setVisibleMenuId(null); }}><span className="material-icons mr-2" style={{ fontSize: '14px' }}>bar_chart</span>Stats</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/app/collections/${collectionId}/problems/${problem.id}`} onClick={event => { event.stopPropagation(); if (deletingProblems.has(problem.id)) event.preventDefault(); }} className="font-medium text-foreground hover:text-app-highlight transition-colors cursor-pointer flex items-center">
                              {problem.name}
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-0 h-4 ml-1 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            </Link>
                          </TableCell>
                          <TableCell align="right">
                            <DifficultyBadge value={problem.difficulty} />
                          </TableCell>
                          <TableCell align="right">
                            <StudyStateBadge value={problem.type} />
                          </TableCell>
                        </TableRow>
                      ))}
                    {problems?.filter((problem: any) => problem.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                          <Empty variant="plain">No problems found matching your search.</Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {/* Modal Backdrop */}


      {/* Modal */}
      <ConfirmationDialog open={deleteConfirmationOpen} onClose={closeDeleteConfirmation} title="Delete Problem" busy={isDeletingProblem} onConfirm={confirmDeleteProblem}>
              Are you sure you want to delete <span className="font-semibold text-foreground">{problemToDelete?.name}</span>? This action cannot be undone.
      </ConfirmationDialog>

      {/* Move Problem Modal Backdrop */}


      {/* Move Problem Modal */}
      <Dialog open={moveModalOpen} onOpenChange={open => { if (!open) closeMoveModal(); }}>
      <DialogContent dismissible={!isMovingProblem}>
        <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end"></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle>Move Problem</DialogTitle>
            <Button variant="close" aria-label="Close dialog" disabled={isMovingProblem}
              onClick={closeMoveModal}>
              <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
            </Button>
          </div>

          <form onSubmit={event => { event.preventDefault(); confirmMoveProblem(); }} className="space-y-4">
            <p className="text-foreground-soft text-sm">
              Move <span className="font-semibold text-foreground">{problemToMove?.name}</span> to:
            </p>

            <NativeSelect variant="destination" className="w-full" controlSize="natural" aria-label="Destination collection"
              value={selectedTargetCollectionId}
              onChange={(e) => setSelectedTargetCollectionId(e.target.value)}
            >
              <option value="">Select a collection</option>
              {(userCollections || [])
                .filter((c: any) => c.id !== Number(collectionId))
                .map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </NativeSelect>

            <div className="flex justify-end pt-3">
              <Button variant="dialog" size="dialog" emphasis="dialog" tone="appAction" loading={isMovingProblem}
                type="submit"
                disabled={isMovingProblem || !selectedTargetCollectionId}>
                {isMovingProblem ? 'Moving...' : 'Move'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default ProblemsList;
