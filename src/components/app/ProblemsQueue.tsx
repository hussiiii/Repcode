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
import { marked } from 'marked'; 

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
  }

  return div.innerHTML;
};

// Function to detect if the content is likely markdown
const isMarkdown = (text: string): boolean => {
  if (!text) return false;
  
  // Check for common markdown indicators
  const markdownIndicators = [
    /^#+ /, // Headers
    /\*\*.+\*\*/, // Bold text
    /`.+`/, // Inline code
    /```[\s\S]+```/, // Code blocks
    /^\s*-\s+/, // List items
    /^\s*\d+\.\s+/, // Numbered lists
    /\[.+\]\(.+\)/, // Links
  ];
  
  return markdownIndicators.some(pattern => pattern.test(text));
};

// Function to convert markdown to HTML with proper code highlighting
const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  // Convert markdown to HTML
  try {
    // Use marked.parse which returns a string synchronously 
    return marked.parse(markdown) as unknown as string;
  } catch (e) {
    console.error('Error parsing markdown:', e);
    return markdown; // Return the original text if parsing fails
  }
};

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
  
  .solution-markdown {
    color: #E2E8F0 !important;
    font-size: 1rem !important;
    line-height: 1.6 !important;
    padding: 1rem !important;
  }
  
  .solution-markdown h1, 
  .solution-markdown h2, 
  .solution-markdown h3, 
  .solution-markdown h4 {
    color: #FFFFFF !important;
    margin-top: 1.5rem !important;
    margin-bottom: 1rem !important;
    font-weight: 600 !important;
  }
  
  .solution-markdown h1 {
    font-size: 1.5rem !important;
    border-bottom: 1px solid #3A4253 !important;
    padding-bottom: 0.5rem !important;
  }
  
  .solution-markdown h2 {
    font-size: 1.3rem !important;
  }
  
  .solution-markdown pre {
    background-color: #343B4A !important;
    border: 1px solid #3A4253 !important;
    border-radius: 6px !important;
    padding: 12px !important;
    margin: 12px 0 !important;
    overflow-x: auto !important;
  }
  
  .solution-markdown code {
    background-color: #3A4253 !important;
    color: #FFFFFF !important;
    padding: 2px 5px !important;
    border-radius: 4px !important;
    font-family: monospace !important;
    font-size: 0.9em !important;
  }
  
  .solution-markdown pre code {
    background-color: transparent !important;
    padding: 0 !important;
    border-radius: 0 !important;
    border: none !important;
  }
  
  .solution-markdown p {
    margin: 1rem 0 !important;
  }
  
  .solution-markdown ul, 
  .solution-markdown ol {
    margin-left: 1.5rem !important;
    margin-bottom: 1rem !important;
  }
  
  .solution-markdown li {
    margin: 0.5rem 0 !important;
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
    
    // State for solution generation
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
    const [generatedSolution, setGeneratedSolution] = useState<string | null>(null);
    const [isSavingSolution, setIsSavingSolution] = useState(false);
    
    // State for preserving ChatWindow content
    const [chatMessages, setChatMessages] = useState<Array<{ text: string, sender: string }>>([]);
    const [chatInput, setChatInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickQuestions, setShowQuickQuestions] = useState(true);

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
                <span>You found a partial solution that passed some tests but was not optimal, and took you a while</span>
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
          // Set buttons based on the type of the first problem
    if (dueProblems.length > 0) {
      const firstProblemType = dueProblems[0].type;
      const buttonsBasedOnType = firstProblemType === 'New' || firstProblemType === 'Learning' || firstProblemType === 'Relearning'
          ? [
              { label: 'Again', value: 'again' },
              { label: 'Good', value: 'good' },
              { label: 'Easy', value: 'easy' },
          ]
          : [
              { label: 'Again', value: 'again' },
              { label: 'Hard', value: 'hard' },
              { label: 'Good', value: 'good' },
              { label: 'Easy', value: 'easy' },
          ];
      setButtons(buttonsBasedOnType);
      }
      if (dueProblems[0]) {
        switch (dueProblems[0].type) {
          case 'New': {
            const stepsArray = userSettings?.learnSteps.split(' ');
            const firstLearningStep = stepsArray[0];
            const secondLearningStep = stepsArray.length > 1 ? stepsArray[1] : userSettings?.graduatingInterval + "d";
            setAgainText(firstLearningStep);
            setGoodText(secondLearningStep);
            setEasyText(userSettings?.easyInterval + "d");
            break;
          }
          case 'Learning': {
            const stepsArray = userSettings?.learnSteps.split(' ');
            const firstLearningStep = stepsArray[0];

            let nextInterval;
            // If interval is -1 or less than 12hr, set Good text to the second learning step or the graduating interval
            if (dueProblems[0].interval === -1 || dueProblems[0].interval < 720) {
              nextInterval = stepsArray.length > 1 ? stepsArray[1] : userSettings?.graduatingInterval + "d";
            } else {
              // Find the current interval in the learning steps
              const currentIndex = stepsArray.findIndex((step: any) => step === dueProblems[0].interval.toString());
          
              if (currentIndex >= 0 && currentIndex < stepsArray.length - 1) {
                // If there is a next step, use it
                nextInterval = stepsArray[currentIndex + 1];
              } else {
                // If the current interval is the last one, or not found, use the graduating interval
                nextInterval = userSettings?.graduatingInterval + "d";
              }
            }
            const easyint = userSettings?.easyInterval + "d"; 

            setAgainText(firstLearningStep);
            setGoodText(nextInterval);
            setEasyText(easyint);
            break;
          }
          case 'Relearning': {
            const relearnStepsArray = userSettings?.relearnSteps.split(' '); 
            const firstStep = relearnStepsArray[0]; 

            const currentIndex = relearnStepsArray.findIndex((step: any) => step === dueProblems[0].interval);
            // Determine the next interval
            let nextInterval;
            if (currentIndex >= 0 && currentIndex < relearnStepsArray.length - 1) {
              // If there is a next step, use it
              nextInterval = relearnStepsArray[currentIndex + 1];
            } else {
              // If the current interval is the last one, or not found, use the relearnGraduating interval (which is a percent)
              nextInterval = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval
            }
            
            let easyInt = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval; 

            nextInterval = Math.floor(nextInterval / 1440); // Convert to days and round down
            easyInt = Math.floor(easyInt / 1440); // Convert to days and round down
            setAgainText(firstStep); 
            setGoodText(nextInterval + 'd'); 
            setEasyText(easyInt + 'd'); 
            break;
          }
          case 'Review': {
            const relearnStepsArray = userSettings?.learnSteps.split(' '); 
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
    }, [problems, dueProblems]);


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

    // Mutation to save the solution directly to the database
    const updateSolutionMutation = useMutation(
      async (newSolution: string) => {
        if (dueProblems.length === 0) return null;
        
        // Get authentication token
        const token = await user?.getIdToken();
        if (!token) {
          throw new Error('Authentication token is not available');
        }
        
        const response = await fetch(`/api/updateProblem?problemId=${dueProblems[0].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: dueProblems[0].name,
            question: dueProblems[0].question,
            solution: newSolution,
            difficulty: dueProblems[0].difficulty,
            collectionId: Number(dueProblems[0].collectionId),
            functionSignature: dueProblems[0].functionSignature,
            language: dueProblems[0].language,
            link: dueProblems[0].link,
            notes: dueProblems[0].notes
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', response.status, errorData);
          throw new Error(`Failed to update solution: ${response.status} ${errorData.error || ''}`);
        }
        
        return response.json();
      },
      {
        onSuccess: (data) => {
          showToast('Solution saved successfully!');
          
          // Refresh the problem list to show updated solution
          refetchProblems();
          
          // Update the problem object with the new solution
          if (data && typeof data === 'object' && dueProblems.length > 0) {
            // Update the solution in the current problem
            const updatedProblems = [...dueProblems];
            updatedProblems[0] = { ...updatedProblems[0], solution: data.solution || generatedSolution };
            setDueProblems(updatedProblems);
          }
          
          // Reset the generated solution state since it's now the actual solution
          setGeneratedSolution(null);
        },
        onError: (error) => {
          console.error('Error saving solution:', error);
          
          if (error instanceof Error) {
            if (error.message.includes('Authentication token')) {
              showToast('Please sign in again to save your solution.');
            } else {
              showToast(`Failed to save solution: ${error.message}`);
            }
          } else {
            showToast('Failed to save solution. Please try again.');
          }
        },
        onSettled: () => {
          setIsSavingSolution(false);
        }
      }
    );

    // handles the repeated logic of updating the problem's due date, updating the problem in the database, updating the collection counts, and handling the resultant changes in the array of problems
    async function Helper(problem: any) {
      setIsLoading(true);
      // update due date 
      const currentDate = new Date(); // get the current date
      const additionalTime = problem.interval * 60 * 1000; // convert minutes to milliseconds 
      const newDueDate = new Date(currentDate.getTime() + additionalTime); // set the new due date based on the current date plus the interval
      problem.dueDate = newDueDate;
    
      const updates = {
        type: problem.type,
        interval: problem.interval,
        relearnInterval: problem.relearnInterval,
        ease: problem.ease,
        dueDate: problem.dueDate,
        againCount: problem.againCount,
        hardCount: problem.hardCount,  
        goodCount: problem.goodCount,   
        easyCount: problem.easyCount    
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
          queryClient.invalidateQueries(['collections', user?.email]); // for collection problem type counts  
          
        },
        onError: (error) => {
          // Handle any errors
          console.error('Error updating problem:', error);
        },
      });
      //await updateContribution(user?.email || '');
      queryClient.invalidateQueries(['userSettings', user?.email]); // for updating the heatmap 
      queryClient.invalidateQueries(['collectionDetails']); // for updating ProblemList
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
            if(buttonValue === "again") { // update type to learning, set interval to interval of first learning step, update due date 
                dueProblems[0].type = "Learning"; 

                // Parse learningSteps and convert to minutes
                const stepsArray = userSettings?.learnSteps.split(' ').map((step:string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60; 
            });
            dueProblems[0].interval = stepsArray[0]; 


            await Helper(dueProblems[0]); 
        
            }
            else if(buttonValue === "good") { // update type to learning, set the interval 2nd step's (since this card is new, it's on the first step by default) interval OR graduating interval, update due date
              dueProblems[0].type = "Learning"; 

              const stepsArray = userSettings?.learnSteps.split(' ').map((step:string) => {
              const value = parseInt(step.slice(0, -1));
              const unit = step.slice(-1);
              return unit === 'm' ? value : value * 24 * 60; 
            });

            let nextInterval;
            if (stepsArray.length >= 2) {
                // Set to the second step
                nextInterval = stepsArray[1];
            } else {
                // No second step, use the graduating interval
                // graduatingInterval is in days and needs to be converted to minutes
                nextInterval = userSettings?.graduatingInterval * 24 * 60;
                dueProblems[0].type = "Review"; 
            }
            dueProblems[0].interval = nextInterval;

            await Helper(dueProblems[0]);
            }

            else if (buttonValue === "easy") { // update type to review, change interval to easyinterval, update due date 
            dueProblems[0].type = "Review"; 

            // Set the interval to the easyInterval value (it's in days so convert it to minutes)
            dueProblems[0].interval = userSettings?.easyInterval * 24 * 60; 
            
            await Helper(dueProblems[0]); 
            }
        }
        else if(dueProblems[0].type === "Learning") {
            if(buttonValue === "again") { // set interval to first learning step, update due date
            const stepsArray = userSettings?.learnSteps.split(' ').map((step:string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60; 
            });
            dueProblems[0].interval = stepsArray[0]; 


            await Helper(dueProblems[0]);
            }
            else if (buttonValue === "good") {
              const stepsArray = userSettings?.learnSteps.split(' ').map((step: string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60; // Convert to minutes
              });

              let nextInterval;
              // If the current problem's interval isn't set OR it is less than 12hr (arbitrarily chosen), then it means that this is probably a New card that had "Again" pressed on it to turn it to learning, so set interval to 2nd learning step 
              if (dueProblems[0].interval === -1 || dueProblems[0].interval < 720) {
                // If interval is -1, set it equal to the 2nd learning step instead
                nextInterval = stepsArray[1];
              } else {
                // Find the index of the current interval in stepsArray
                const currentIndex = stepsArray.findIndex((step: any) => step === dueProblems[0].interval);

                if (currentIndex >= 0 && currentIndex < stepsArray.length - 1) {
                  // If there is a next step, use it
                  nextInterval = stepsArray[currentIndex + 1];
                } else {
                  // If the current interval is the last one, or not found, use the graduating interval
                  // graduatingInterval is in days and needs to be converted to minutes
                  nextInterval = userSettings?.graduatingInterval * 24 * 60;
                  dueProblems[0].type = "Review";
                }
              }
              dueProblems[0].interval = nextInterval;


              await Helper(dueProblems[0]);
            }
            else if (buttonValue === "easy") { // update type to review, set interval to easyInterval, update due date
            dueProblems[0].type = "Review"; 

            // Set the interval to the easyInterval value (it's in days, so make it in minutes)
            dueProblems[0].interval = userSettings?.easyInterval * 24 * 60; 


            await Helper(dueProblems[0]);
            }
        }
        else if (dueProblems[0].type === "Relearning") {
            if(buttonValue === "again") { // set interval to 1st step in relearningSteps array, update due date
            const relearnStepsArray = userSettings?.relearnSteps.split(' ').map((step:string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60; 
            });
            dueProblems[0].interval = relearnStepsArray[0]; 


            await Helper(dueProblems[0]);
            }
            else if(buttonValue === "good") { // set interval to the next relearning step (can NOT have duplictates) OR to relearnInterval * relearnGraduatingInterval, update due date
            const relearnStepsArray = userSettings?.relearnSteps.split(' ').map((step:string) => {
                const value = parseInt(step.slice(0, -1));
                const unit = step.slice(-1);
                return unit === 'm' ? value : value * 24 * 60; 
            });
            // Find the index of the current interval in stepsArray
            const currentIndex = relearnStepsArray.findIndex((step: any) => step === dueProblems[0].interval);

            // Determine the next interval
            let nextInterval;
            if (currentIndex >= 0 && currentIndex < relearnStepsArray.length - 1) {
                // If there is a next step, use it
                nextInterval = relearnStepsArray[currentIndex + 1];
            } else {
                // If the current interval is the last one, or not found, use the relearnGraduating interval (which is a percent)
                nextInterval = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval
                dueProblems[0].relearnInterval = 0; 
                dueProblems[0].type = "Review";
            }

            dueProblems[0].interval = nextInterval;


            await Helper(dueProblems[0]);
            }
            else if (buttonValue === "easy") { // skip all the relearn steps and set interval immediately to relearnInterval * relearnGraduatingInterval, set type to reveiw, update due date
            dueProblems[0].interval = dueProblems[0].relearnInterval * userSettings?.relearnGraduatingInterval; 
            dueProblems[0].relearnInterval = 0; 
            dueProblems[0].type = "Review"; 

            await Helper(dueProblems[0]);
            }
        }
        else if (dueProblems[0].type === "Review") {
            if(buttonValue === "again") { // set problem type to Relearning, decrease ease by 20% (0.2), set relearnInterval to current interval, set interval to 1st step of relearnSteps array, update due date 
            dueProblems[0].type = "Relearning";
            dueProblems[0].ease = (dueProblems[0].ease - 0.20 >= userSettings?.minimumEase) ? dueProblems[0].ease - 0.20 : userSettings.minimumEase;

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

              dueProblems[0].ease = dueProblems[0].ease + 0.15; 

              await Helper(dueProblems[0]);
            }
        }
        setContent('question'); 
        setEditorContent(''); 
        queryClient.invalidateQueries(['allProblems', user?.email]);
        queryClient.invalidateQueries(['collectionProblems']);
    };

    // Function to save the generated solution
  const saveSolution = async () => {
    if (!generatedSolution) return;
    if (dueProblems.length === 0) {
      showToast('No problem is currently available.');
      return;
    }
    
    if (!user) {
      showToast('Please sign in to save your solution.');
      return;
    }
    
    setIsSavingSolution(true);
    updateSolutionMutation.mutate(generatedSolution);
  };

  const generateSolution = async () => {
    if (dueProblems.length === 0) {
      showToast('No problem is currently available.');
      return;
    }
    
    if (!data?.apiKey) {
      showToast('API key is required. Please add it in Settings.');
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
          language: dueProblems[0].language,
          apiKey: data.apiKey,
          mode: "generate",
          editorContent: dueProblems[0].functionSignature || editorContent // Use function signature or current editor content
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setGeneratedSolution(result.message);
        showToast('Solution generated successfully!');
      } else {
        showToast('Failed to generate solution. Please try again.');
      }
    } catch (error) {
      console.error('Error generating solution:', error);
      showToast('Error generating solution. Please try again.');
    } finally {
      setIsGeneratingSolution(false);
    }
  };
  
    if (isLoading) {
      return (
          <div className="flex justify-center items-center h-full">
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-12 h-12 text-secondary animate-spin dark:text-base_100 fill-load"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
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

  // Tab button component to match Problem.tsx
  const TabButton = ({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon?: string }) => {
    return (
      <button
        onClick={onClick}
        className={`
          px-4 py-2 text-sm font-medium rounded-lg flex items-center
          transition-all duration-200
          ${active ? 'bg-[#2A303C] text-primary shadow-sm' : 'text-[#B0B7C3] hover:text-primary hover:bg-[#2A303C]/50'}
        `}
      >
        {icon && <span className="material-icons mr-1" style={{ fontSize: '18px' }}>{icon}</span>}
        {label}
      </button>
    );
  };

  const ActionButton = ({ onClick, icon, label }: { onClick: () => void, icon: string, label: string }) => {
    return (
      <button
        onClick={onClick}
        className="px-4 py-2 text-sm font-medium rounded-lg flex items-center text-[#B0B7C3] hover:text-primary hover:bg-[#2A303C]/50 transition-all duration-200"
      >
        <span className="material-icons mr-1" style={{ fontSize: '18px' }}>{icon}</span>
        {label}
      </button>
    );
  };

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
            <span>all systems operational</span>
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
              <div className="p-4 border-b border-[#3A4253] flex-shrink-0">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <TabButton 
                    active={content === 'question'} 
                    label="Description" 
                    onClick={() => setContent('question')}
                    icon="description"
                  />
                  <TabButton 
                    active={content === 'notes'} 
                    label="Notes" 
                    onClick={() => setContent('notes')}
                    icon="edit_note"
                  />
                  <TabButton
                    active={content=== 'whiteboard'}
                    label="Whiteboard"
                    onClick={() => setContent('whiteboard')}
                    icon="dataset"
                  />
                  <div id="solution-tab">
                    <TabButton 
                      active={content === 'solution'} 
                      label="Solution" 
                      onClick={() => setContent('solution')}
                      icon="code"
                    />
                  </div>
                  <TabButton
                    active={content=== 'ai-assistant'}
                    label="Repcode AI"
                    onClick={() => setContent('ai-assistant')}
                    icon="bolt"
                  />
                  
                  {/* Vertical divider */}
                  {dueProblems.length > 0 && (
                    <>
                      <div className="h-8 w-px bg-[#3A4253] mx-3"></div>
                      
                      {/* Action buttons */}
                        <ActionButton 
                          onClick={() => setIsEditModalOpen(true)}
                          icon="edit"
                          label="Edit"
                        />
                        <ActionButton 
                          onClick={() => setIsStatsModalOpen(true)}
                          icon="bar_chart"
                          label="Stats"
                        />
                        {dueProblems[0]?.link && (
                          <div id="run-leetcode-button">
                            <ActionButton 
                              onClick={() => window.open(dueProblems[0].link, '_blank')}
                              icon="open_in_new"
                              label="Run on Leetcode"
                            />
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <div className="p-6 bg-base_100">
                {content === 'solution' && buttons?.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {buttons.map((button: any, index: any) => {
                      // Determine button styling based on label
                      let buttonStyle = '';
                      switch (button.label) {
                        case 'Again':
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
                    ) : content === 'solution' ? (
                      <div className="bg-base_100">
                        {/* Always display the "Generate Solution" or "Regenerate Solution" button */}
                        {!generatedSolution && (
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={generateSolution}
                              disabled={isGeneratingSolution}
                              className={`
                                px-4 py-2 text-sm font-medium rounded-lg flex items-center
                                transition-all duration-200
                                ${isGeneratingSolution ? 'bg-[#3A4253] text-[#B0B7C3] cursor-not-allowed' : 'bg-[#2A303C] text-primary hover:bg-[#3A4253]'}
                              `}
                            >
                              <span className="material-icons mr-1" style={{ fontSize: '18px' }}>
                                {isGeneratingSolution ? 'hourglass_empty' : 'auto_fix_high'}
                              </span>
                              {isGeneratingSolution ? 'Generating...' : 
                                (!dueProblems[0].solution || dueProblems[0].solution.includes("# TODO")) ? 'Generate with AI' : 'Regenerate Solution'}
                            </button>
                          </div>
                        )}
                        
                        {/* Show save button if solution was generated but not saved yet */}
                        {generatedSolution && !isGeneratingSolution && generatedSolution !== dueProblems[0].solution && (
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={saveSolution}
                              disabled={isSavingSolution}
                              className={`
                                px-4 py-2 text-sm font-medium rounded-lg flex items-center
                                transition-all duration-200 mr-2
                                ${isSavingSolution ? 'bg-[#3A4253] text-[#B0B7C3] cursor-not-allowed' : 'bg-[#10B981] text-white hover:bg-[#0D9668]'}
                              `}
                            >
                              <span className="material-icons mr-1" style={{ fontSize: '18px' }}>
                                {isSavingSolution ? 'hourglass_empty' : 'save'}
                              </span>
                              {isSavingSolution ? 'Saving...' : 'Save Solution'}
                            </button>
                            <button
                              onClick={() => setIsEditModalOpen(true)}
                              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center
                                bg-[#2A303C] text-primary hover:bg-[#3A4253] transition-all duration-200"
                            >
                              <span className="material-icons mr-1" style={{ fontSize: '18px' }}>edit</span>
                              Edit Problem
                            </button>
                          </div>
                        )}
                        
                        {isGeneratingSolution ? (
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            <span className="ml-3 text-primary">Generating solution...</span>
                          </div>
                        ) : (
                          <>
                            {generatedSolution && generatedSolution !== dueProblems[0].solution && (
                              <div className="flex items-center mb-4 p-2 bg-[#3A4253] rounded-lg text-sm text-[#B0B7C3]">
                                <span className="material-icons mr-1" style={{ fontSize: '18px' }}>auto_fix_high</span>
                                <span>
                                  {isSavingSolution 
                                    ? "Saving AI-generated solution to the database..."
                                    : "This solution was generated by AI and has not been saved yet."
                                  }
                                </span>
                              </div>
                            )}
                            
                            {isMarkdown(generatedSolution || dueProblems[0].solution) ? (
                              <div 
                                className="solution-markdown prose prose-invert max-w-none wrap-text bg-base_100"
                                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(generatedSolution || dueProblems[0].solution) }}
                              />
                            ) : (
                              <pre className="wrap-text bg-base_100 whitespace-pre-wrap overflow-auto">
                                <code className={`language-${dueProblems[0].language} mr-5`}>{generatedSolution || dueProblems[0].solution}</code>
                              </pre>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <pre className="wrap-text overflow-auto"><code className={`language-${dueProblems[0].language} mr-5`}>{dueProblems[0].solution}</code></pre>
                    )}
                  </div>
                )}
                </div>
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
          <div className="fixed bottom-6 right-[1rem] z-10">
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