import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import { Prose, Heading } from '@/components/ui/typography';
import { formatProblemContent } from '@/lib/problem-content';
import { HelpTooltip } from '@/components/ui/tooltip';
import { ProblemWorkspace, type WorkspaceView } from './ProblemWorkspace';
import { Alert } from '@/components/ui/alert';
import { Empty } from '@/components/ui/empty';
import { LoadingState } from '@/components/ui/loading-state';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cssColor, hexColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext, useRef } from 'react';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import hljs from 'highlight.js';
import { AuthContext } from '@/auth/AuthContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ChatWindow from './ChatWindow';
import ProblemModal from './ProblemModal';
import ProblemStatsModal from './ProblemStatsModal';
import { useToast } from '@/components/ui/use-toast';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Whiteboard, DrawingElement } from './WhiteBoard';
import Stopwatch from './Stopwatch';



const feedbackTones: Record<string, ButtonProps['tone']> = { Again: 'again', Lapse: 'again', Hard: 'hard', Good: 'good', Easy: 'easy' };

const ProblemsQueue = ({ problems, userSettings, refetchProblems }: {problems:any, userSettings:any, refetchProblems: any}) => {
  const { toast: showToast } = useToast(3000);
    const [dueProblems, setDueProblems] = useState<any>([]);
    const [buttons, setButtons] = useState<any[]>([]);
    const [againText, setAgainText] = useState<any>();
    const [hardText, setHardText] = useState<any>();
    const [goodText, setGoodText] = useState<any>();
    const [easyText, setEasyText] = useState<any>();
    const [content, setContent] = useState<any>('question');
    const [isLoading, setIsLoading] = useState(false); // while we transition from current problem to next in queue
    const [editorContent, setEditorContent] = useState<any>('');
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [whiteboardElements, setWhiteboardElements] = useState<DrawingElement[]>([]);
    const [whiteboardHistory, setWhiteboardHistory] = useState<DrawingElement[][]>([]);
    const [whiteboardHistoryIndex, setWhiteboardHistoryIndex] = useState(-1);

    // State for preserving ChatWindow content
    const [chatMessages, setChatMessages] = useState<Array<{ text: string, sender: string }>>([]);
    const [chatInput, setChatInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickQuestions, setShowQuickQuestions] = useState(true);

    // State for severely overdue problems
    const [isSeverelyOverdue, setIsSeverelyOverdue] = useState(false);
    const [monthsOverdue, setMonthsOverdue] = useState(0);

    // More menu state
    const editorRef = useRef<AceEditor | null>(null);
    const reviewFuzzRef = useRef<{ problemId: number | null; hard: number; good: number; easy: number }>({
      problemId: null,
      hard: 0,
      good: 0,
      easy: 0,
    });

    const generateReviewFuzz = () => parseFloat((Math.random() * (0.05 - 0.02) + 0.02).toFixed(2));

    const getReviewFuzzFactors = (problemId: number) => {
      if (reviewFuzzRef.current.problemId !== problemId) {
        reviewFuzzRef.current = {
          problemId,
          hard: generateReviewFuzz(),
          good: generateReviewFuzz(),
          easy: generateReviewFuzz(),
        };
      }
      return reviewFuzzRef.current;
    };

    // Joyride tour state
    const [runTour, setRunTour] = useState(false);
    const [tourSteps] = useState<Step[]>([
      {
        target: '[data-workspace-view="solution"]',
        content: (
          <div>
            <p className="mb-3 text-base">When you&apos;re finished solving the problem, click here to give feedback:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: cssColor('status-error') }}>Again:</span>
                <span>You had no clue how to solve it</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: cssColor('feedback-hard-label') }}>Hard:</span>
                <span>You found a partial solution that passed some tests, OR you found the optimal solution but it took you a long time</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: cssColor('feedback-good-label') }}>Good:</span>
                <span>You could come up with and thoroughly explain the optimal approach</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: cssColor('feedback-easy-label') }}>Easy:</span>
                <span>You could optimally solve the problem very quickly</span>
              </div>
            </div>
          </div>
        ),
        disableBeacon: true,
        placement: 'bottom',
      },
      {
        target: '#skip-button',
        content: "Press this button to skip the current problem and put it at the end of the queue, if you would rather solve it later",
        disableBeacon: true,
        placement: 'top',
      },
      {
        target: '#run-leetcode-button',
        content: "Click here to visit this problem's leetcode page and run your solution against test cases",
        disableBeacon: true,
        placement: 'bottom',
      },
    ]);

    const { user } = useContext(AuthContext);

    // Effect to handle tab switching to AI assistant
    useEffect(() => {
      // When switching to AI assistant tab, make sure we're not stuck in analyzing state
      if (content === 'ai-assistant' && chatMessages.length > 0) {
        setIsAnalyzing(false);
      }
    }, [content, chatMessages.length]);

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

    const { data } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user,
    });

    // Initialize chat only once per problem
    const currentProblemId = useRef<string | null>(null);

    // Effect for resetting chat when the problem changes
    useEffect(() => {
      if (dueProblems.length > 0) {
        const newProblemId = dueProblems[0].id;

        // A different problem must start with its own chat and sketch state.
        if (currentProblemId.current !== newProblemId) {
          if (currentProblemId.current !== null) {
            setChatMessages([]);
            setChatInput('');
            setIsTyping(false);
            setShowQuickQuestions(true);
            setWhiteboardElements([]);
            setWhiteboardHistory([[]]);
            setWhiteboardHistoryIndex(0);
            setEditorContent('');
            setContent('question');
          }
          currentProblemId.current = newProblemId;
          setIsAnalyzing(true);
        }
      }
    }, [dueProblems]);

    // Separate effect for actual API call, depending on analyzing state
    useEffect(() => {
      // Only proceed if we're in analyzing state and have a problem and API key
      if (isAnalyzing && dueProblems.length > 0 && data?.hasApiKey) {
        const analyzeCode = async () => {
          try {
            const response = await authenticatedFetch('/api/openai', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question: dueProblems[0].question,
                solution: dueProblems[0].solution,
                userSolution: editorContent,
                userMessage: "analyze",
                mode: "analyze"
              }),
            });

            setIsAnalyzing(false);

            if (response.ok) {
              // After analysis is complete, show the greeting message
              setChatMessages([{ text: "How can I help you with this problem?", sender: "ai" }]);
            } else {
              setChatMessages([{
                text: "Failed to analyze your code. Please make sure you have entered a valid API Key in the Settings page.",
                sender: "ai"
              }]);
              setShowQuickQuestions(false);
            }
          } catch (error) {
            setIsAnalyzing(false);
            setChatMessages([{
              text: "Failed to analyze your code. Please make sure you have entered a valid API Key in the Settings page.",
              sender: "ai"
            }]);
            setShowQuickQuestions(false);
          }
        };

        analyzeCode();
      }
    }, [isAnalyzing, dueProblems, data?.hasApiKey, editorContent]);

    // Check if user has seen the tour before and start it if they haven't
    useEffect(() => {
      if (user?.email && dueProblems.length > 0) {
        const tourKey = `problemsQueueTour_${user.email}`;
        const hasSeenTour = localStorage.getItem(tourKey);

        if (!hasSeenTour) {
          // Small delay to ensure elements are rendered
          setTimeout(() => {
            setRunTour(true);
          }, 1000);
        }
      }
    }, [user?.email, dueProblems.length]);

    // Handle Joyride tour completion
    const handleJoyrideCallback = (data: CallBackProps) => {
      const { status } = data;
      const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

      if (finishedStatuses.includes(status) && user?.email) {
        const tourKey = `problemsQueueTour_${user.email}`;
        localStorage.setItem(tourKey, 'true');
        setRunTour(false);
      }
    };

    // Use useEffect to highlight code when the component mounts or updates
    useEffect(() => {
      hljs.highlightAll();
    }, [content]);

    useEffect(() => {
      if(!userSettings){
        return;
      }
      if (problems) {
        console.log(dueProblems)
        setDueProblems(problems);
      }

      if (dueProblems.length > 0) {
        const firstProblemType = dueProblems[0].type;

        // Calculate if problem is severely overdue (only for Review cards)
        let isSevereOverdue = false;
        let monthsOver = 0;

        if (firstProblemType === 'Review') {
          const dueDate = new Date(dueProblems[0].dueDate);
          const now = new Date();
          const msOverdue = now.getTime() - dueDate.getTime();
          monthsOver = msOverdue / (1000 * 60 * 60 * 24 * 30); // Approximate months
          isSevereOverdue = monthsOver >= userSettings?.overdueWarningThreshold;
        }

        // Update state for UI warning display
        setIsSeverelyOverdue(isSevereOverdue);
        setMonthsOverdue(isSevereOverdue ? Math.floor(monthsOver) : 0);

        // Set buttons based on problem type and overdue status
        let buttonsBasedOnType;
        if (isSevereOverdue) {
          // Severely overdue - only show Lapse (renamed Again) and Good
          buttonsBasedOnType = [
            { label: 'Lapse', value: 'again' },
            { label: 'Good', value: 'good' },
          ];
        } else if (firstProblemType === 'New' || firstProblemType === 'Learning' || firstProblemType === 'Relearning') {
          buttonsBasedOnType = [
            { label: 'Again', value: 'again' },
            { label: 'Good', value: 'good' },
            { label: 'Easy', value: 'easy' },
          ];
        } else {
          buttonsBasedOnType = [
            { label: 'Again', value: 'again' },
            { label: 'Hard', value: 'hard' },
            { label: 'Good', value: 'good' },
            { label: 'Easy', value: 'easy' },
          ];
        }
        setButtons(buttonsBasedOnType);
      } else {
        setIsSeverelyOverdue(false);
        setMonthsOverdue(0);
      }
      if (dueProblems[0]) {
        switch (dueProblems[0].type) {
          case 'New': {
            const stepsArray = userSettings?.learnSteps.split(' ');
            const firstLearningStep = stepsArray[0];
            // Good on New card goes to step 1, or graduates if only 1 step
            const secondLearningStep = stepsArray.length > 1 ? stepsArray[1] : userSettings?.graduatingInterval + "d";
            setAgainText(firstLearningStep);
            setGoodText(secondLearningStep);
            setEasyText(userSettings?.easyInterval + "d");
            break;
          }
          case 'Learning': {
            const stepsArray = userSettings?.learnSteps.split(' ');
            const firstLearningStep = stepsArray[0];
            const currentStepIndex = dueProblems[0].stepIndex ?? 0;
            const nextStepIndex = currentStepIndex + 1;

            // Determine what Good will show
            let nextInterval;
            if (nextStepIndex >= stepsArray.length) {
              // Would graduate
              nextInterval = userSettings?.graduatingInterval + "d";
            } else {
              nextInterval = stepsArray[nextStepIndex];
            }

            setAgainText(firstLearningStep);
            setGoodText(nextInterval);
            setEasyText(userSettings?.easyInterval + "d");
            break;
          }
          case 'Relearning': {
            const relearnStepsArray = userSettings?.relearnSteps.split(' ');
            const firstStep = relearnStepsArray[0];
            const currentStepIndex = dueProblems[0].stepIndex ?? 0;
            const nextStepIndex = currentStepIndex + 1;
            const maxInterval = userSettings?.maximumInterval || 180;

            // Determine what Good will show
            let nextInterval;
            if (nextStepIndex >= relearnStepsArray.length) {
              // Would graduate back to Review
              nextInterval = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval;
              nextInterval = Math.floor(nextInterval / 1440); // Convert to days
              nextInterval = Math.min(nextInterval, maxInterval); // Cap at maximumInterval
              nextInterval = nextInterval + 'd';
            } else {
              nextInterval = relearnStepsArray[nextStepIndex];
            }

            let easyInt = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval;
            easyInt = Math.floor(easyInt / 1440); // Convert to days and round down
            easyInt = Math.min(easyInt, maxInterval); // Cap at maximumInterval

            setAgainText(firstStep);
            setGoodText(nextInterval);
            setEasyText(easyInt + 'd');
            break;
          }
          case 'Review': {
            // Again on Review goes to Relearning, so show first relearn step
            const relearnStepsArray = userSettings?.relearnSteps.split(' ');
            const firstRelearnStep = relearnStepsArray[0];
            const maxIntervalMinutes = (userSettings?.maximumInterval || 180) * 24 * 60;
            const fuzzFactors = getReviewFuzzFactors(dueProblems[0].id);

            // Keep preview text aligned with actual scheduling logic:
            // base interval equation -> apply fuzz -> cap at maximum interval -> convert to days
            const getPreviewDays = (baseIntervalMinutes: number, fuzz: number) => {
              const fuzzedMinutes = baseIntervalMinutes * (1 + fuzz);
              const cappedMinutes = Math.min(fuzzedMinutes, maxIntervalMinutes);
              return Math.floor(cappedMinutes / 1440);
            };

            const baseHardMinutes = dueProblems[0].interval * 1.2 * userSettings?.intervalModifier;
            const baseGoodMinutes = dueProblems[0].interval * dueProblems[0].ease * userSettings?.intervalModifier;
            const baseEasyMinutes = dueProblems[0].interval * dueProblems[0].ease * userSettings?.easyBonus * userSettings?.intervalModifier;

            const intervalHard = getPreviewDays(baseHardMinutes, fuzzFactors.hard);
            const intervalGood = getPreviewDays(baseGoodMinutes, fuzzFactors.good);
            const intervalEasy = getPreviewDays(baseEasyMinutes, fuzzFactors.easy);

            setAgainText(firstRelearnStep);
            setHardText(intervalHard + "d");
            setGoodText(intervalGood + "d");
            setEasyText(intervalEasy + "d");
            break;
          }
          default: {
            // Optional: handle unknown problem types or log an error
            break;
          }
        }
      }
    }, [problems, dueProblems, userSettings]);


    // For heat map
    const updateContribution = async (userEmail: string) => {
      const response = await authenticatedFetch('/api/updateContribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });
      if (!response.ok) {
        throw new Error('Failed to update contribution');
      }
    };

    const updateProblemMutation = useMutation(async ({ problemId, updates }: { problemId: any, updates: any }) => {
      const response = await authenticatedFetch('/api/updateProblemForAlgo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: problemId, updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update problem');
      }

      return response.json();
    });

    // ============================================================================
    // HELPER FUNCTION - Updates problem after user gives feedback
    // ============================================================================
    // This handles the repeated logic of:
    // - Updating the problem's due date (both dueDate AND originalDueDate)
    // - Persisting changes to the database
    // - Updating collection counts
    // - Managing the local problems array state
    //
    // IMPORTANT: Both dueDate and originalDueDate are set here because the user
    // is giving actual feedback (Again/Hard/Good/Easy), which means the spaced
    // repetition algorithm has calculated a new "true" due date.
    // ============================================================================
    async function Helper(problem: any) {
      setIsLoading(true);

      // Cap interval at maximumInterval (convert days to minutes)
      const maxIntervalMinutes = userSettings?.maximumInterval * 24 * 60;
      problem.interval = Math.min(problem.interval, maxIntervalMinutes);

      // Calculate the new due date based on current time + interval
      const currentDate = new Date();
      const additionalTime = problem.interval * 60 * 1000; // convert minutes to milliseconds
      const newDueDate = new Date(currentDate.getTime() + additionalTime);

      // Update BOTH due dates - this is a "real" feedback action, not a skip
      // dueDate: for queue ordering
      // originalDueDate: for overdue tracking and display
      problem.dueDate = newDueDate;
      problem.originalDueDate = newDueDate;

      const updates = {
        type: problem.type,
        interval: problem.interval,
        relearnInterval: problem.relearnInterval,
        stepIndex: problem.stepIndex,
        ease: problem.ease,
        dueDate: problem.dueDate,
        originalDueDate: problem.originalDueDate, // Also update the "true" due date
        againCount: problem.againCount,
        hardCount: problem.hardCount,
        goodCount: problem.goodCount,
        easyCount: problem.easyCount,
        lapses: problem.lapses
      };
      updateProblemMutation.mutate({ problemId: problem.id, updates }, {
        onSuccess: async (updatedProblem) => {
          // Check if problem is still due today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const updatedDueDate = new Date(updatedProblem.dueDate);
          updatedDueDate.setHours(0, 0, 0, 0);

          // Create a new array excluding the current problem to manipulate and update the state later
          let updatedProblems = dueProblems.filter((p: any) => p.id !== problem.id);
          console.log(updatedProblems)

          if (updatedDueDate.getTime() === today.getTime()) {
            console.log("Still due")
            updatedProblems.push(updatedProblem);
          }
          setDueProblems(updatedProblems);
          await refetchProblems();
          setIsLoading(false);

          // Call updateCollectionCounts endpoint after problem type update
          try {
            const updateResponse = await authenticatedFetch('/api/updateCollectionCounts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ collectionId: problem.collectionId }),
            });
            if (!updateResponse.ok) throw new Error('Failed to update collection counts');
          } catch (error) {
            console.error('Failed to update collection counts:', error);
          }

          // Update streak when giving feedback on a problem
          if (user?.email) {
            try {
              // Get local date in YYYY-MM-DD format (timezone-safe for streak tracking)
              const now = new Date();
              const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

              await authenticatedFetch('/api/updateStreak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: user.email, localDate }),
              });
            } catch (error) {
              console.error('Failed to update streak:', error);
            }
          }

          queryClient.invalidateQueries(['collections', user?.email]); // for collection problem type counts
          queryClient.invalidateQueries(['userSettings', user?.email]); // for updating the heatmap + streak
          queryClient.invalidateQueries(['collectionDetails']); // for updating ProblemList

        },
        onError: (error) => {
          // Handle any errors
          console.error('Error updating problem:', error);
        },
      });
    }

    // ============================================================================
    // SKIP FUNCTION - Moves current problem to end of today's queue
    // ============================================================================
    // IMPORTANT: This ONLY updates dueDate, NOT originalDueDate!
    //
    // Why? Because skipping is just a queue reordering action, not actual feedback.
    // The user hasn't reviewed the problem yet, so we don't want to lose track of
    // when the problem was actually supposed to be due.
    //
    // - dueDate: Updated to "latest + 1 minute" for queue ordering
    // - originalDueDate: UNCHANGED - preserves the "true" due date for overdue tracking
    //
    // This allows users to skip problems repeatedly without "resetting" the overdue
    // status. The dashboard uses originalDueDate to show accurate overdue information.
    // ============================================================================
    const skipProblem = async () => {
        setIsLoading(true);
        // Get the latest due date among current problems and add 1 minute to it
        const latestDueDate = dueProblems.reduce((latest: Date, problem: any) => {
            const problemDueDate = new Date(problem.dueDate);
            return problemDueDate > latest ? problemDueDate : latest;
        }, new Date());
        // Set ONLY dueDate (queue ordering) - originalDueDate stays unchanged!
        const newDueDate = new Date(latestDueDate.getTime() + 60000); // 1 minute later
        const updates = {
            dueDate: newDueDate,
            // NOTE: originalDueDate is intentionally NOT included here
        };
        updateProblemMutation.mutate({ problemId: dueProblems[0].id, updates }, {
            onSuccess: async () => {
                // Remove the skipped problem from the front and add it to the end
                const skippedProblem = { ...dueProblems[0], dueDate: newDueDate };
                const remainingProblems = dueProblems.slice(1);
                setDueProblems([...remainingProblems, skippedProblem]);
                await refetchProblems();
                setIsLoading(false);
                setContent('question');
                setEditorContent('');
            },
            onError: (error) => {
                console.error('Error skipping problem:', error);
                setIsLoading(false);
            },
        });
    };

    // handles the logic of what happens to the problem depeneding on the feedback button pressed
    const Algorithm = async(buttonValue:any) => {
        console.log(`Button clicked: ${buttonValue}`);

        if (buttonValue === "again") {
          dueProblems[0].againCount += 1;
        } else if (buttonValue === "hard") {
          dueProblems[0].hardCount += 1;
        } else if (buttonValue === "good") {
          dueProblems[0].goodCount += 1;
        } else if (buttonValue === "easy") {
          dueProblems[0].easyCount += 1;
        }

        if(dueProblems[0].type === "New") {
            // Parse learningSteps and convert to minutes
            const stepsArray = userSettings?.learnSteps.split(' ').map((step:string) => {
              const value = parseInt(step.slice(0, -1));
              const unit = step.slice(-1);
              return unit === 'm' ? value : value * 24 * 60;
            });

            if(buttonValue === "again") { // update type to learning, set to first step
                dueProblems[0].type = "Learning";
                dueProblems[0].stepIndex = 0;
                dueProblems[0].interval = stepsArray[0];

                await Helper(dueProblems[0]);
            }
            else if(buttonValue === "good") { // update type to learning, advance to step 1 (skipping step 0)
              dueProblems[0].stepIndex = 1;

              if (dueProblems[0].stepIndex >= stepsArray.length) {
                // No second step, graduate directly to Review
                dueProblems[0].type = "Review";
                dueProblems[0].stepIndex = 0;
                dueProblems[0].interval = userSettings?.graduatingInterval * 24 * 60;
              } else { // advance to next step
                dueProblems[0].type = "Learning";
                dueProblems[0].interval = stepsArray[dueProblems[0].stepIndex];
              }

              await Helper(dueProblems[0]);
            }
            else if (buttonValue === "easy") { // update type to review, change interval to easyinterval
              dueProblems[0].type = "Review";
              dueProblems[0].stepIndex = 0;
              dueProblems[0].interval = userSettings?.easyInterval * 24 * 60;

              await Helper(dueProblems[0]);
            }
        }
        else if(dueProblems[0].type === "Learning") {
            // Parse learningSteps and convert to minutes
            const stepsArray = userSettings?.learnSteps.split(' ').map((step:string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60;
            });

            if(buttonValue === "again") { // reset to first learning step
              dueProblems[0].stepIndex = 0;
              dueProblems[0].interval = stepsArray[0];

              await Helper(dueProblems[0]);
            }
            else if (buttonValue === "good") { // advance to next step or graduate
              dueProblems[0].stepIndex += 1;

              if (dueProblems[0].stepIndex >= stepsArray.length) {
                // Completed all steps, graduate to Review
                dueProblems[0].type = "Review";
                dueProblems[0].stepIndex = 0;
                dueProblems[0].interval = userSettings?.graduatingInterval * 24 * 60;
              } else {
                dueProblems[0].interval = stepsArray[dueProblems[0].stepIndex];
              }

              await Helper(dueProblems[0]);
            }
            else if (buttonValue === "easy") { // skip remaining steps, graduate to Review
              dueProblems[0].type = "Review";
              dueProblems[0].stepIndex = 0;
              dueProblems[0].interval = userSettings?.easyInterval * 24 * 60;

              await Helper(dueProblems[0]);
            }
        }
        else if (dueProblems[0].type === "Relearning") {
            // Parse relearnSteps and convert to minutes
            const relearnStepsArray = userSettings?.relearnSteps.split(' ').map((step:string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60;
            });

            if(buttonValue === "again") { // reset to first relearning step
              dueProblems[0].stepIndex = 0;
              dueProblems[0].interval = relearnStepsArray[0];

              await Helper(dueProblems[0]);
            }
            else if(buttonValue === "good") { // advance to next step or graduate back to Review
              dueProblems[0].stepIndex += 1;

              if (dueProblems[0].stepIndex >= relearnStepsArray.length) {
                // Completed all relearn steps, graduate back to Review
                dueProblems[0].type = "Review";
                dueProblems[0].stepIndex = 0;
                dueProblems[0].interval = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval;
                dueProblems[0].relearnInterval = 0;
              } else {
                dueProblems[0].interval = relearnStepsArray[dueProblems[0].stepIndex];
              }

              await Helper(dueProblems[0]);
            }
            else if (buttonValue === "easy") { // skip all relearn steps, graduate immediately
              dueProblems[0].type = "Review";
              dueProblems[0].stepIndex = 0;
              dueProblems[0].interval = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval;
              dueProblems[0].relearnInterval = 0;

              await Helper(dueProblems[0]);
            }
        }
        else if (dueProblems[0].type === "Review") {
            if(buttonValue === "again") { // set problem type to Relearning, decrease ease by 20% (0.2), set relearnInterval to current interval, set interval to 1st step of relearnSteps array
            dueProblems[0].type = "Relearning";
            dueProblems[0].stepIndex = 0; // Start at first relearn step
            dueProblems[0].ease = (dueProblems[0].ease - 0.20 >= userSettings?.minimumEase) ? dueProblems[0].ease - 0.20 : userSettings.minimumEase;

            // Increment lapses if this is a lapse (severely overdue or regular Again on Review)
            dueProblems[0].lapses = (dueProblems[0].lapses || 0) + 1;

            // Cap relearnInterval at maximumInterval (in minutes) to ensure consistency
            const maxIntervalMinutes = (userSettings?.maximumInterval || 180) * 24 * 60;
            dueProblems[0].relearnInterval = Math.min(dueProblems[0].interval, maxIntervalMinutes);
            const relearnStepsArray = userSettings?.relearnSteps.split(' ').map((step:string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60;
            });

            dueProblems[0].interval = relearnStepsArray[0];

            await Helper(dueProblems[0]);

            }
            else if(buttonValue === "hard") { // decrease the problem's ease by 15%, set interval to 1.2*current interval*interval modifier, update due date
              dueProblems[0].ease = (dueProblems[0].ease - 0.15 >= userSettings?.minimumEase) ? dueProblems[0].ease - 0.15 : userSettings.minimumEase;
              const fuzzFactors = getReviewFuzzFactors(dueProblems[0].id);

              // Calculate next interval via equation
              dueProblems[0].interval = dueProblems[0].interval * 1.2 * userSettings?.intervalModifier;
              dueProblems[0].interval *= (1 + fuzzFactors.hard);

              await Helper(dueProblems[0]);
            }
            else if(buttonValue === "good") { // set the interval according to equation (ease remains unchanged), update due date
              const fuzzFactors = getReviewFuzzFactors(dueProblems[0].id);
              dueProblems[0].interval = dueProblems[0].interval * dueProblems[0].ease * userSettings?.intervalModifier;
              dueProblems[0].interval *= (1 + fuzzFactors.good);

              await Helper(dueProblems[0]);
            }
            else if (buttonValue === "easy") { // set the interval according to the equation, increase the ease by 15%, update due date
              const fuzzFactors = getReviewFuzzFactors(dueProblems[0].id);
              dueProblems[0].interval = dueProblems[0].interval * dueProblems[0].ease * userSettings?.easyBonus * userSettings?.intervalModifier;
              dueProblems[0].interval *= (1 + fuzzFactors.easy);

              // Increase ease by 15%, but ensure it's at least minimumEase (for legacy/edge cases)
              dueProblems[0].ease = Math.max(dueProblems[0].ease + 0.15, userSettings?.minimumEase);

              await Helper(dueProblems[0]);
            }
        }
        setContent('question');
        setEditorContent('');
        queryClient.invalidateQueries(['allProblems', user?.email]);
        queryClient.invalidateQueries(['collectionProblems']);
    };


    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[80vh]">
          <LoadingState />
        </div>
      );
  }

  if (!isLoading && dueProblems.length === 0) {
    return (
      <Empty variant="complete">
        <p className="text-xl text-center text-muted-foreground">
        🎉Congratulations!🎉 You have finished all the problems due for today.
        </p>
      </Empty>
    );
  }



    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Add the style tag to the component */}


        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border bg-surface">
          <div className="flex items-center">
            {/* Title showing the current problem name */}
            <Heading as="h1" size="2xl" weight="semibold" tone="foreground" className="mr-4">
              {dueProblems.length > 0 ? dueProblems[0].name : "Problem Queue"}
            </Heading>

            {/* Add badges next to title if there are due problems */}
            {dueProblems.length > 0 && (
              <div className="flex gap-2 mr-4">
                <DifficultyBadge
                  value={dueProblems[0].difficulty}
                  size="problem"
                />
                <StudyStateBadge
                  value={dueProblems[0].type}
                  size="problem"
                />
              </div>
            )}

          </div>

          {/* Status indicator stays on the right */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Stopwatch resetKey={dueProblems[0]?.id ?? 'empty'} />
            <div className="relative mr-2">
              <div className="w-2.5 h-2.5 bg-study-review rounded-full"></div>
              <div
                className="absolute inset-0 w-2.5 h-2.5 bg-presence-online rounded-full opacity-70"
                style={{
                  animation: "breathe 3s ease-in-out infinite",
                  filter: "blur(1px)"
                }}
              ></div>
              <style jsx>{`
                @keyframes breathe {
                  0%, 100% {
                    transform: scale(1);
                    opacity: 0.3;
                    filter: blur(0.5px);
                  }
                  50% {
                    transform: scale(1.2);
                    opacity: 0.7;
                    filter: blur(2px);
                  }
                }
              `}</style>
            </div>
            <a
              href="/changelog"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-link transition-colors duration-200 cursor-pointer"
            >
              v2.27 - stable release
            </a>
          </div>
        </div>

        <ProblemWorkspace activeView={content} onViewChange={setContent} problemKey={dueProblems[0].id}
          onEdit={() => setIsEditModalOpen(true)} onStats={() => setIsStatsModalOpen(true)} link={dueProblems[0].link}
          onEditorResize={() => editorRef.current?.editor.resize()}
          renderView={(view: WorkspaceView) => <>
                {view === 'solution' && buttons?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {buttons.map((button: any, index: any) => {


                        return (
                          <Button variant="feedback" size="feedback" className="mx-2" tone={feedbackTones[button.label] ?? "unrated"}
                            key={index}
                            onClick={() => Algorithm(button.value)}
                          >
                            <span className="text-lg">{button.label}</span>
                            {/* Show the time in smaller text */}
                            <span className="text-xs ml-1 opacity-80">
                              ({(() => {
                                switch (button.label) {
                                  case 'Again':
                                  case 'Lapse':
                                    return againText;
                                  case 'Hard':
                                    return hardText;
                                  case 'Good':
                                    return goodText;
                                  case 'Easy':
                                    return easyText;
                                  default:
                                    return '';
                                }
                              })()})
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                    {/* Warning for severely overdue problems */}
                    {isSeverelyOverdue && (
                      <Alert variant="feedbackError" className="mt-3">
                        <p className="text-sm text-status-reminder">
                          ⚠️ This problem is over {userSettings?.overdueWarningThreshold} months overdue ({monthsOverdue} months).
                          If you no longer remember it well, you should <span className="font-semibold text-status-error">Lapse</span> it to trigger the relearning process
                        </p>
                      </Alert>
                    )}
                  </div>
                )}
                {dueProblems.length > 0 && (
                  <div  className="min-h-0">
                    {view === 'notes' ? (
                      <p className="text-foreground mt-4 whitespace-pre-wrap text-lg break-words [word-break:break-word]">{dueProblems[0].notes}</p>
                    ) : view === 'question' ? (
                      <Prose className="overflow-auto"
                        dangerouslySetInnerHTML={{
                          __html: formatProblemContent(dueProblems[0].question)
                        }}
                      />
                    ) : view === 'whiteboard' ? (
                      <Whiteboard
                        active={content === 'whiteboard'}
                        className='mt-4 h-[800px]'
                        elements={whiteboardElements}
                        setElements={setWhiteboardElements}
                        history={whiteboardHistory}
                        setHistory={setWhiteboardHistory}
                        historyIndex={whiteboardHistoryIndex}
                        setHistoryIndex={setWhiteboardHistoryIndex}
                      />
                    ) : view === 'ai-assistant' ? (
                      <ChatWindow
                          active={content === 'ai-assistant'}
                          problem={dueProblems[0]}
                          editorContent={editorContent}
                          hasApiKey={data?.hasApiKey}
                          isTab={true}
                          externalMessages={chatMessages}
                          setExternalMessages={setChatMessages}
                          externalInput={chatInput}
                          setExternalInput={setChatInput}
                          externalIsAnalyzing={isAnalyzing}
                          setExternalIsAnalyzing={setIsAnalyzing}
                          externalIsTyping={isTyping}
                          setExternalIsTyping={setIsTyping}
                          externalShowQuickQuestions={showQuickQuestions}
                          setExternalShowQuickQuestions={setShowQuickQuestions}
                      />
                    ) :
                    (
                      <pre className="break-words [word-break:break-word] overflow-auto"><code className={`language-${dueProblems[0].language} mr-5`}>{dueProblems[0].solution}</code></pre>
                    )}
                  </div>
                )}
</>}
          editor={<AceEditor
                ref={editorRef}
                className="rounded"
                mode={dueProblems[0].language}
                theme="one_dark"
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                fontSize={16}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                wrapEnabled={true}
                value={editorContent || dueProblems[0].functionSignature}
                onChange={(newValue) => setEditorContent(newValue)}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 4,
                  fadeFoldWidgets: false,
                  scrollPastEnd: false,
                  wrap: true,
                }}
                style={{ height: '100%', width: '100%' }}
              />} />

        {/* Modals and Toast */}
        {isEditModalOpen && dueProblems[0] && (
          <ProblemModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              refetchProblems(); // Refresh problems after edit
            }}
            collectionId={dueProblems[0].collectionId}
            isEditMode={true}
            problemToEdit={dueProblems[0]}
            showToast={showToast}
          />
        )}

        {isStatsModalOpen && dueProblems[0] && (
          <ProblemStatsModal
            isOpen={isStatsModalOpen}
            onClose={() => setIsStatsModalOpen(false)}
            problem={dueProblems[0]}
          />
        )}

        {/* Joyride Tour */}
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous={true}
          showProgress={false}
          showSkipButton={false}
          callback={handleJoyrideCallback}
          locale={{
            next: 'Next',
            last: 'Finish',
          }}
          styles={{
            options: {
              primaryColor: hexColor('app-action-end'),
              backgroundColor: cssColor('surface'),
              textColor: cssColor('foreground-code-body'),
              arrowColor: cssColor('surface'),
              overlayColor: cssColor('overlay', 0.4),
            },
            tooltip: {
              borderRadius: 8,
              fontSize: 14,
              minWidth: 350,
            },
            tooltipContent: {
              padding: '16px 20px',
            },
            buttonNext: {
              backgroundColor: cssColor('app-action-end'),
              fontSize: 14,
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: 6,
            },
            buttonBack: {
              marginRight: 10,
              color: cssColor('muted-foreground'),
              fontSize: 14,
            },
          }}
        />

        {/* Skip button */}
        {dueProblems.length > 0 && (
          <div className="fixed bottom-6 right-[1rem] z-10" id="skip-button">
            <HelpTooltip content="Skip this problem for now, it will reappear later">
            <Button variant="reminder" size="reminder" aria-label="Remind me later"
              onClick={skipProblem}>
              <span className="material-icons mr-2" style={{ fontSize: '20px' }}>skip_next</span>
              <span className="font-medium">Skip</span>
              <div className="absolute inset-0 rounded-full bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Button>
            </HelpTooltip>
          </div>
        )}
      </div>
    );
  };

  export default ProblemsQueue;
