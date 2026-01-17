import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext, useRef } from 'react';
import '../../app/globals.css'; 
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css'; // or any other style of your choice
import { AuthContext } from '@/auth/AuthContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ChatWindow from './ChatWindow';
import { Tooltip as ReactTooltip } from "react-tooltip";
import ProblemModal from './ProblemModal';
import ProblemStatsModal from './ProblemStatsModal';
import Toast from './Toast';
import Badge from '@/components/ui/Badge';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Whiteboard, DrawingElement } from './WhiteBoard';
import { ClipboardPen, NotepadText, Lightbulb, BotMessageSquare, PenSquare, Edit3, BarChart2, ExternalLink } from "lucide-react";

// If there's ever a <code> nested within a <pre>, it breaks everything, so we need to check for this and remove it 
const sanitizeCodeBlocks = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;

  const preTags = Array.from(div.getElementsByTagName('pre'));

  for (const pre of preTags) {
    const nestedCodeTags = Array.from(pre.getElementsByTagName('code'));

    for (const code of nestedCodeTags) {
      const textNode = document.createTextNode(code.textContent || '');
      code.parentNode?.replaceChild(textNode, code);
    }
    pre.style.color = '#FFFFFF'; // Force white text for pre blocks
  }

  return div.innerHTML.replace(/color:\s*[^;]+;/gi, 'color: #FFFFFF;');
};

// Update the CSS block with styling for <code> elements
const preBlockStyles = `
  .problem-content pre {
    background-color: #343B4A !important;
    border: 1px solid #3A4253 !important;
    border-radius: 6px !important;
    padding: 12px !important;
    margin: 12px 0 !important;
    overflow-x: auto !important;
    color: #E2E8F0 !important;
  }

  .problem-content pre code {
    color: #E2E8F0 !important;
    font-family: monospace !important;
  }

  /* Style for inline code elements (not inside pre) */
  .problem-content code:not(pre code) {
    background-color: #3A4253 !important;
    color: #FFFFFF !important;
    padding: 2px 5px !important;
    border-radius: 4px !important;
    font-family: monospace !important;
    font-size: 0.9em !important;
    border: 1px solid #4A5267 !important;
  }
  .prose-invert {
    color: #FFFFFF !important; /* Force white text for prose content */
  }
  .prose-invert a {
    color: #4CAF50 !important; /* Ensure links are green, not black */
  }
  /* Ensure AceEditor text is white */
  .ace_editor {
    color: #FFFFFF !important;
  }
  .ace_cursor {
    color: #FFFFFF !important;
  }

`;

const ProblemsQueue = ({ problems, userSettings, refetchProblems }: {problems:any, userSettings:any, refetchProblems: any}) => {
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
    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [whiteboardElements, setWhiteboardElements] = useState<DrawingElement[]>([]);
    const [whiteboardHistory, setWhiteboardHistory] = useState<DrawingElement[][]>([]);
    const [whiteboardHistoryIndex, setWhiteboardHistoryIndex] = useState(-1);
    
    // State for preserving ChatWindow content
    const [chatMessages, setChatMessages] = useState<Array<{ text: string, sender: string }>>([]);
    const [chatInput, setChatInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickQuestions, setShowQuickQuestions] = useState(true);
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);

    // State for severely overdue problems
    const [isSeverelyOverdue, setIsSeverelyOverdue] = useState(false);
    const [monthsOverdue, setMonthsOverdue] = useState(0);

    // Joyride tour state
    const [runTour, setRunTour] = useState(false);
    const [tourSteps] = useState<Step[]>([
      {
        target: '#solution-tab',
        content: (
          <div>
            <p className="mb-3 text-base">When you&apos;re finished solving the problem, click here to give feedback:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: '#ff6b6b' }}>Again:</span>
                <span>You had no clue how to solve it</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: '#F6903C' }}>Hard:</span>
                <span>You found a partial solution that passed some tests, OR you found the optimal solution but it took you a long time</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: '#34BF8F' }}>Good:</span>
                <span>You could come up with and thoroughly explain the optimal approach</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2" style={{ color: '#2563EB' }}>Easy:</span>
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

    // For resizable panels
    const [panelWidth, setPanelWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    
    // Effect to handle tab switching to AI assistant
    useEffect(() => {
      // When switching to AI assistant tab, make sure we're not stuck in analyzing state
      if (content === 'ai-assistant' && chatMessages.length > 0) {
        setIsAnalyzing(false);
      }
    }, [content, chatMessages.length]);

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
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
        
        // If this is a new problem, reset chat state
        if (currentProblemId.current !== newProblemId) {
          currentProblemId.current = newProblemId;
          
          // Only initialize if we need to (empty messages)
          if (chatMessages.length === 0) {
            setIsAnalyzing(true); // Set to analyzing state
          }
        }
      }
    }, [dueProblems]);
    
    // Separate effect for actual API call, depending on analyzing state
    useEffect(() => {
      // Only proceed if we're in analyzing state and have a problem and API key
      if (isAnalyzing && dueProblems.length > 0 && data?.apiKey) {
        const analyzeCode = async () => {
          try {
            const response = await fetch('/api/openai', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question: dueProblems[0].question,
                solution: dueProblems[0].solution,
                userSolution: editorContent,
                userMessage: "analyze",
                apiKey: data?.apiKey,
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
    }, [isAnalyzing, dueProblems, data?.apiKey, editorContent]);

    const handleMouseDown = () => {
      setIsDragging(true);
      document.body.style.userSelect = 'none';
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = 'auto';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const container = e.currentTarget as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 30 && newWidth <= 70) {
        setPanelWidth(newWidth);
      }
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
      }
    }, [isDragging]);

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

            // Determine what Good will show
            let nextInterval;
            if (nextStepIndex >= relearnStepsArray.length) {
              // Would graduate back to Review
              nextInterval = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval;
              nextInterval = Math.floor(nextInterval / 1440); // Convert to days
              nextInterval = nextInterval + 'd';
            } else {
              nextInterval = relearnStepsArray[nextStepIndex];
            }
            
            let easyInt = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval; 
            easyInt = Math.floor(easyInt / 1440); // Convert to days and round down

            setAgainText(firstStep); 
            setGoodText(nextInterval); 
            setEasyText(easyInt + 'd'); 
            break;
          }
          case 'Review': {
            // Again on Review goes to Relearning, so show first relearn step
            const relearnStepsArray = userSettings?.relearnSteps.split(' '); 
            const firstRelearnStep = relearnStepsArray[0]; 

            const intervalHard = Math.floor((dueProblems[0].interval * 1.2 * userSettings?.intervalModifier) / 1440);
            const intervalGood = Math.floor((dueProblems[0].interval * dueProblems[0].ease * userSettings?.intervalModifier) / 1440); 
            const intervalEasy = Math.floor((dueProblems[0].interval * dueProblems[0].ease * userSettings?.easyBonus * userSettings?.intervalModifier) / 1440);

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
      const response = await fetch('/api/updateContribution', {
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

    const getButtonColor = (label: string) => {
      switch (label) {
        case 'Again':
        case 'Lapse':
          return 'text-error rounded-md hover:bg-hover2'; 
        case 'Hard':
          return 'text-medium rounded-md hover:bg-hover2'; 
        case 'Good':
          return 'text-easy rounded-md hover:bg-hover2'; 
        case 'Easy':
          return 'text-blue rounded-md hover:bg-hover2'; 
        default:
          return 'text-neutral dark:text-secondary rounded-md hover:bg-hover2'; 
      }
    };

    const updateProblemMutation = useMutation(async ({ problemId, updates }: { problemId: any, updates: any }) => {
      const response = await fetch('/api/updateProblemForAlgo', {
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

    // handles the repeated logic of updating the problem's due date, updating the problem in the database, updating the collection counts, and handling the resultant changes in the array of problems
    async function Helper(problem: any) {
      setIsLoading(true);
      
      // Cap interval at maximumInterval (convert days to minutes)
      const maxIntervalMinutes = userSettings?.maximumInterval * 24 * 60;
      problem.interval = Math.min(problem.interval, maxIntervalMinutes);
      
      // update due date 
      const currentDate = new Date(); // get the current date
      const additionalTime = problem.interval * 60 * 1000; // convert minutes to milliseconds 
      const newDueDate = new Date(currentDate.getTime() + additionalTime); // set the new due date based on the current date plus the interval
      problem.dueDate = newDueDate;
    
      const updates = {
        type: problem.type,
        interval: problem.interval,
        relearnInterval: problem.relearnInterval,
        stepIndex: problem.stepIndex,
        ease: problem.ease,
        dueDate: problem.dueDate,
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
            const updateResponse = await fetch('/api/updateCollectionCounts', {
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
              
              await fetch('/api/updateStreak', {
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

    // Skip function to move current problem to end of queue
    const skipProblem = async () => {
        setIsLoading(true);
        // Get the latest due date among current problems and add 1 minute to it
        const latestDueDate = dueProblems.reduce((latest: Date, problem: any) => {
            const problemDueDate = new Date(problem.dueDate);
            return problemDueDate > latest ? problemDueDate : latest;
        }, new Date());
        // Set the skipped problem's due date to 1 minute after the latest due date
        const newDueDate = new Date(latestDueDate.getTime() + 60000); // 1 minute later
        const updates = {
            dueDate: newDueDate,
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
    
    const generateAISolution = async () => {
        if (!data?.apiKey) {
            showToast('Please add an OpenAI API key in Settings');
            return;
        }

        setIsGeneratingSolution(true);

        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: dueProblems[0].question,
                    solution: '',
                    userSolution: '',
                    userMessage: `Generate a complete solution for this problem in ${dueProblems[0].language}. Only provide the code without any explanations, comments, or markdown formatting.`,
                    apiKey: data?.apiKey,
                    mode: 'chat'
                }),
            });

            if (!response.ok) {
                showToast('Failed to generate solution');
                setIsGeneratingSolution(false);
                return;
            }

            const result = await response.json();
            let generatedCode = result.message;

            // Extract only code - remove markdown code blocks if present
            generatedCode = generatedCode.replace(/```[\w]*\n?/g, '').trim();

            // Remove any explanatory text (heuristic: remove lines that don't look like code)
            const lines = generatedCode.split('\n');
            const codeLines = lines.filter((line: string) => {
                const trimmed = line.trim();
                // Keep empty lines, comments, and lines that contain typical code characters
                if (!trimmed) return true;
                if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return true;
                // Remove lines that look like explanations (contain many words without code symbols)
                const hasCodeSymbols = /[{}\[\]();=<>+\-*/%&|^]/.test(trimmed);
                const startsWithKeyword = /^(function|const|let|var|class|def|public|private|protected|static|void|int|string|return|if|else|for|while|switch|case)/i.test(trimmed);
                return hasCodeSymbols || startsWithKeyword;
            });

            generatedCode = codeLines.join('\n').trim();

            // Update the problem's solution in the database
            const updateResponse = await fetch('/api/updateProblemForAlgo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: dueProblems[0].id,
                    updates: { solution: generatedCode }
                }),
            });

            if (!updateResponse.ok) {
                showToast('Failed to save generated solution');
                setIsGeneratingSolution(false);
                return;
            }

            const updatedProblems = [...dueProblems];
            updatedProblems[0] = { ...updatedProblems[0], solution: generatedCode };
            setDueProblems(updatedProblems);

            setTimeout(() => {
                hljs.highlightAll();
            }, 100);

            showToast('Solution generated successfully!');
            setIsGeneratingSolution(false);
        } catch (error) {
            console.error('Error generating solution:', error);
            showToast('Failed to generate solution');
            setIsGeneratingSolution(false);
        }
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

            dueProblems[0].relearnInterval = dueProblems[0].interval;
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

              // Calculate next interval via equation 
              dueProblems[0].interval = dueProblems[0].interval * 1.2 * userSettings?.intervalModifier;
              const fuzz = (Math.random() * (0.05 - 0.02) + 0.02).toFixed(2); 
              dueProblems[0].interval *= (1 + parseFloat(fuzz));

              await Helper(dueProblems[0]);
            }
            else if(buttonValue === "good") { // set the interval according to equation (ease remains unchanged), update due date
              dueProblems[0].interval = dueProblems[0].interval * dueProblems[0].ease * userSettings?.intervalModifier;
              const fuzz = (Math.random() * (0.05 - 0.02) + 0.02).toFixed(2); 
              dueProblems[0].interval *= (1 + parseFloat(fuzz));

              await Helper(dueProblems[0]);
            }
            else if (buttonValue === "easy") { // set the interval according to the equation, increase the ease by 15%, update due date
              dueProblems[0].interval = dueProblems[0].interval * dueProblems[0].ease * userSettings?.easyBonus * userSettings?.intervalModifier;
              const fuzz = (Math.random() * (0.05 - 0.02) + 0.02).toFixed(2); 
              dueProblems[0].interval *= (1 + parseFloat(fuzz));

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
          <div className="relative flex flex-col items-center">
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] blur-xl opacity-20 animate-pulse"></div>
            
            {/* Spinner container */}
            <div className="relative">
              {/* Gradient ring */}
              <div className="w-16 h-16 rounded-full border-2 border-transparent 
                              bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] opacity-20"></div>
              
              {/* Spinning gradient arc */}
              <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent 
                              rounded-full animate-spin duration-1000" 
                    style={{
                      borderTopColor: '#06b6d4',
                      borderRightColor: '#3b82f6',
                      animationDuration: '1s'
                    }}>
              </div>
            </div>
            
            {/* Loading text with shimmer effect */}
            <div className="mt-4 text-sm font-medium text-[#B0B7C3] relative overflow-hidden">
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

  if (!isLoading && dueProblems.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-center text-secondary">
        🎉Congratulations!🎉 You have finished all the problems due for today.
        </p>
      </div>
    );
  }

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  // Function to determine icon color based on label
  const getIconColor = (label: string): string => {
    switch (label.toLowerCase()) {
      case 'description': return 'text-[#4CAF50]'; // Green
      case 'notes': return 'text-[#FF9800]'; // Orange
      case 'whiteboard': return 'text-[#2196F3]'; // Blue
      case 'solution': return 'text-[#9C27B0]'; // Purple
      case 'repcode ai': return 'text-[#FF5722]'; // Red
      case 'edit': return 'text-[#FF9800]'; // Orange
      case 'stats': return 'text-[#2196F3]'; // Blue
      case 'run on leetcode': return 'text-[#4CAF50]'; // Green
      default: return 'text-white'; // Default white
    }
  };

  type TabButtonProps = {
    active: boolean;
    label: string;
    onClick: () => void;
    icon?: React.ReactElement;
  };

  const TabButton: React.FC<TabButtonProps> = ({ active, label, onClick, icon }) => (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium rounded-full flex items-center space-x-2
        transition-all duration-200
        ${active 
          ? 'bg-[#3b82f6]/15 text-white' 
          : 'text-white hover:text-white hover:bg-[#2A303C]/50'}
      `}
      style={{ color: '#FFFFFF' }} // Explicitly enforce white text
    >
      {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
        className: `w-5 h-5 ${active ? 'text-white' : getIconColor(label)}`,
        style: { transition: 'color 0.2s' }
      })}
      <span className={`text-white ${active ? 'font-semibold' : ''}`} style={{ color: '#FFFFFF' }}>{label}</span>
    </button>
  );

  type ActionButtonProps = {
    onClick: () => void;
    icon?: React.ReactElement;
    label: string;
  };

  const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, label }) => (
    <button
      onClick={onClick}
      className="px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 text-white hover:text-white hover:bg-[#2A303C]/50 transition-all duration-200"
      style={{ color: '#FFFFFF' }} // Explicitly enforce white text
    >
      {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
        className: `w-5 h-5 ${getIconColor(label)}`,
        style: { transition: 'color 0.2s' }
      })}
      <span className="text-white" style={{ color: '#FFFFFF' }}>{label}</span>
    </button>
  );

    return (
      <div className="h-screen bg-[#2A303C] flex flex-col">
        {/* Add the style tag to the component */}
        <style>{preBlockStyles}</style>
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#3A4253] bg-[#343B4A]">
          <div className="flex items-center">
            {/* Title showing the current problem name */}
            <h1 className="text-2xl font-semibold text-primary mr-4">
              {dueProblems.length > 0 ? dueProblems[0].name : "Problem Queue"}
            </h1>
            
            {/* Add badges next to title if there are due problems */}
            {dueProblems.length > 0 && (
              <div className="flex gap-2 mr-4">
                <Badge 
                  type="difficulty" 
                  value={dueProblems[0].difficulty} 
                  className="text-sm py-1.5 px-4" 
                />
                <Badge 
                  type="problemType" 
                  value={dueProblems[0].type} 
                  className="text-sm py-1.5 px-4"
                />
              </div>
            )}

          </div>
          
          {/* Status indicator stays on the right */}
          <div className="flex items-center text-xs text-[#B0B7C3]">
            <div className="relative mr-2">
              <div className="w-2.5 h-2.5 bg-review rounded-full"></div>
              <div 
                className="absolute inset-0 w-2.5 h-2.5 bg-[#00FF00] rounded-full opacity-70"
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
              v2.20 - stable release
            </a>
          </div>
        </div>

        {/* Main Content with Resizable Panels */}
        <div 
          className="flex-1 flex overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {/* Left Panel */}
          <div 
            className="h-full flex flex-col bg-base_100"
            style={{ width: `${panelWidth}%` }}
          >
            <div className="h-full border-r border-[#3A4253] bg-base_100 flex flex-col">
              <div className="border-b border-[#3A4253] bg-base_100 sticky top-0 z-10 p-2">
                <div className="flex flex-wrap items-center gap-1 px-2">
                  <TabButton 
                    active={content === 'question'} 
                    label="Description" 
                    onClick={() => setContent('question')}
                    icon={<ClipboardPen />}
                  />
                  <TabButton 
                    active={content === 'notes'} 
                    label="Notes" 
                    onClick={() => setContent('notes')}
                    icon={<NotepadText />}
                  />
                  <TabButton
                    active={content=== 'whiteboard'}
                    label="Whiteboard"
                    onClick={() => setContent('whiteboard')}
                    icon={<PenSquare />}
                  />
                  <div id="solution-tab">
                    <TabButton 
                      active={content === 'solution'} 
                      label="Solution" 
                      onClick={() => setContent('solution')}
                      icon={<Lightbulb />}
                    />
                  </div>
                  <TabButton
                    active={content=== 'ai-assistant'}
                    label="Repcode AI"
                    onClick={() => setContent('ai-assistant')}
                    icon={<BotMessageSquare />}
                  />
                </div>
                <div className="flex justify-start gap-2 px-2 mt-2">
                  <ActionButton 
                    onClick={() => setIsEditModalOpen(true)}
                    icon={<Edit3 />}
                    label="Edit"
                  />
                  <ActionButton 
                    onClick={() => setIsStatsModalOpen(true)}
                    icon={<BarChart2 />}
                    label="Stats"
                  />
                  {dueProblems.length > 0 && dueProblems[0]?.link && (
                    <div id="run-leetcode-button">
                      <ActionButton 
                        onClick={() => window.open(dueProblems[0].link, '_blank')}
                        icon={<ExternalLink />}
                        label="Run on Leetcode"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-base_100" style={{ color: '#FFFFFF' }}>
                {content === 'solution' && buttons?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {buttons.map((button: any, index: any) => {
                        // Determine button styling based on label
                        let buttonStyle = '';
                        switch (button.label) {
                          case 'Again':
                          case 'Lapse':
                            buttonStyle = 'border-[#8B3A3A] text-[#FF6B6B] hover:bg-[#3A2A2A]';
                            break;
                          case 'Hard':
                            buttonStyle = 'border-[#8C5E2A] text-[#FFA94D] hover:bg-[#3A332A]';
                            break;
                          case 'Good':
                            buttonStyle = 'border-[#2D6A39] text-[#69DB7C] hover:bg-[#2A3A2E]';
                            break;
                          case 'Easy':
                            buttonStyle = 'border-[#2A5A8C] text-[#74C0FC] hover:bg-[#202C3A]';
                            break;
                          default:
                            buttonStyle = 'border-[#3A4253] text-primary';
                        }
                        
                        return (
                          <button
                            key={index}
                            className={`mx-2 py-0.5 px-4 border rounded-md transition-all duration-300 ${buttonStyle}`}
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
                          </button>
                        );
                      })}
                    </div>
                    {/* Warning for severely overdue problems */}
                    {isSeverelyOverdue && (
                      <div className="mt-3 p-3 bg-[#3A2A2A] border border-[#8B3A3A] rounded-md">
                        <p className="text-sm text-[#FF9999]">
                          ⚠️ This problem is over {userSettings?.overdueWarningThreshold} months overdue ({monthsOverdue} months). 
                          If you no longer remember it well, you should <span className="font-semibold text-[#FF6B6B]">Lapse</span> it to trigger the relearning process
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {dueProblems.length > 0 && (
                  <div key={content} className="min-h-0">
                    {content === 'notes' ? (
                      <p className="text-primary mt-4 whitespace-pre-wrap text-lg wrap-text">{dueProblems[0].notes}</p>
                    ) : content === 'question' ? (
                      <div 
                        className="text-primary mt-4 problem-content prose prose-invert max-w-none overflow-auto"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeCodeBlocks(dueProblems[0].question)
                        }}
                      />
                    ) : content === 'whiteboard' ? (
                      <Whiteboard
                        className='mt-4 h-[800px]'
                        elements={whiteboardElements}
                        setElements={setWhiteboardElements}
                        history={whiteboardHistory}
                        setHistory={setWhiteboardHistory}
                        historyIndex={whiteboardHistoryIndex}
                        setHistoryIndex={setWhiteboardHistoryIndex}
                      />
                    ) : content === 'ai-assistant' ? (
                      <ChatWindow
                          problem={dueProblems[0]} 
                          editorContent={editorContent} 
                          apiKey={data?.apiKey}
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
                      <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-auto">
                      <pre className="wrap-text overflow-auto"><code className={`language-${dueProblems[0].language} mr-5`}>{dueProblems[0].solution}</code></pre>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#3A4253]">
                          <button
                            onClick={generateAISolution}
                            disabled={isGeneratingSolution}
                            className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                              isGeneratingSolution
                                ? 'bg-[#3A4253] text-[#B0B7C3] cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] hover:from-[#AB47BC] hover:to-[#8E24AA] text-white shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {isGeneratingSolution ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Generating Solution...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-icons" style={{ fontSize: '20px' }}>auto_awesome</span>
                                <span>
                                  {dueProblems[0].solution?.startsWith('# TODO: Enter your solution here by editing the problem')
                                    ? 'Generate Solution'
                                    : 'Regenerate Solution'}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resize Handle */}
          <div
            className={`
              w-1 hover:w-2 bg-[#3A4253] cursor-col-resize relative group
              transition-all duration-200
              ${isDragging ? 'w-2' : ''}
            `}
            onMouseDown={handleMouseDown}
          >
            <div
              className={`
                absolute top-1/2 -translate-y-1/2
                transition-all duration-200 opacity-0
                ${isDragging || 'group-hover:opacity-100'}
              `}
            >
              <div className="bg-[#4A5267] rounded-md p-1 -ml-3">
                <span className="material-icons text-[#B0B7C3]" style={{ fontSize: '16px' }}>chevron_left</span>
              </div>
              <div className="bg-[#4A5267] rounded-md p-1 -ml-3 mt-1">
                <span className="material-icons text-[#B0B7C3]" style={{ fontSize: '16px' }}>chevron_right</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div 
            className="h-full overflow-hidden"
            style={{ width: `${100 - panelWidth}%` }}
          >
            {dueProblems.length > 0 && (
              <AceEditor
                className="rounded"
                mode={dueProblems[0].language}
                theme="one_dark"
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                fontSize={16}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
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
                }}
                style={{ height: '100%', width: '100%' }}  
              />
            )}
          </div>
        </div>
        
        <ReactTooltip
          id="my-tooltip-1"
          place="bottom"
          style={{ backgroundColor: "#111111" }}
        />
        
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

        <Toast message={toastMessage} isVisible={isToastVisible} />

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
              primaryColor: '#3b82f6',
              backgroundColor: '#343B4A',
              textColor: '#E2E8F0',
              arrowColor: '#343B4A',
              overlayColor: 'rgba(0, 0, 0, 0.4)',
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
              backgroundColor: '#3b82f6',
              fontSize: 14,
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: 6,
            },
            buttonBack: {
              marginRight: 10,
              color: '#B0B7C3',
              fontSize: 14,
            },
          }}
        />

        {/* Skip button */}
        {dueProblems.length > 0 && (
          <div className="fixed bottom-6 right-[1rem] z-10" id="skip-button">
            <button 
              onClick={skipProblem}
              className="flex items-center px-4 py-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] hover:from-[#d97706] hover:to-[#ea580c] text-white rounded-full transition-all duration-200"
              style={{ 
                boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.2), 0 4px 6px -4px rgba(249, 115, 22, 0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(249, 115, 22, 0.3), 0 4px 6px -4px rgba(249, 115, 22, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(249, 115, 22, 0.2), 0 4px 6px -4px rgba(249, 115, 22, 0.2)'}
            >
              <span className="material-icons mr-2" style={{ fontSize: '20px' }}>skip_next</span>
              <span className="font-medium">Skip</span>
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
            
            {/* Tooltip */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="px-3 py-2 bg-[#2A303C] border border-[#3A4150] rounded-lg shadow-xl w-56">
                <div className="text-xs text-[#B0B7C3] leading-relaxed">
                  Skip this problem for now, it will reappear later
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#3A4150]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default ProblemsQueue;