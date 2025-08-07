import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import '../../app/globals.css'; 
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css'; // or any other style of your choice
import { marked } from 'marked';
import { AuthContext } from '@/auth/AuthContext';
import ChatWindow from './ChatWindow';
import { Tooltip as ReactTooltip } from "react-tooltip";
import ProblemModal from './ProblemModal';
import ProblemStatsModal from './ProblemStatsModal';
import Toast from './Toast';
import Badge from '@/components/ui/Badge';
import { Whiteboard, DrawingElement } from './WhiteBoard';

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
    // TypeScript is confused by the marked API
    return marked.parse(markdown) as unknown as string;
  } catch (e) {
    console.error('Error parsing markdown:', e);
    return markdown; // Return the original text if parsing fails
  }
};

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

// Add this CSS block (same as in ProblemsQueue.tsx)
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
  
  /* Styling for the markdown solution output */
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

const Problem = ({ problem, contentActive, setContentActive, editorContent, setEditorContent }: {problem:any, contentActive:any, setContentActive:any, editorContent:any, setEditorContent:any}) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { collectionId: collectionIdParam } = router.query // Assuming collectionId is part of the URL
  // Ensure collectionId is properly parsed as a number
  const collectionId = collectionIdParam ? parseInt(collectionIdParam as string, 10) : problem?.collectionId
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const queryClient = useQueryClient();
  
  // State for solution generation
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [generatedSolution, setGeneratedSolution] = useState<string | null>(null);
  const [isSavingSolution, setIsSavingSolution] = useState(false);
  
  // Whiteboard state
  const [whiteboardElements, setWhiteboardElements] = useState<DrawingElement[]>([]);
  const [whiteboardHistory, setWhiteboardHistory] = useState<DrawingElement[][]>([]);
  const [whiteboardHistoryIndex, setWhiteboardHistoryIndex] = useState(-1);
  
  // State for preserving ChatWindow content
  const [chatMessages, setChatMessages] = useState<Array<{ text: string, sender: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  
  // For resizable panels
  const [panelWidth, setPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

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

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

  const { data } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user, 
  });

  const handleGoBack = () => {
    router.push(`/app/collections/${collectionId}`);
  };

  // Use useEffect to highlight code when the component mounts or updates
  useEffect(() => {
    // Slight delay to ensure the DOM is updated with the markdown content
    setTimeout(() => {
      hljs.highlightAll();
    }, 100);
  }, [contentActive, problem, generatedSolution]);
  
  // Initialize whiteboard history if it's empty when first accessing whiteboard
  useEffect(() => {
    if (contentActive === 'whiteboard' && whiteboardHistory.length === 0) {
      setWhiteboardHistory([[]]);
      setWhiteboardHistoryIndex(0);
    }
  }, [contentActive, whiteboardHistory.length]);

  // Initialize chat when problem or apiKey changes
  const currentProblemId = useRef<string | null>(null);
  
  // Effect for resetting chat when the problem changes
  useEffect(() => {
    if (problem) {
      const newProblemId = problem.id;
      
      // If this is a new problem, reset chat state
      if (currentProblemId.current !== newProblemId) {
        currentProblemId.current = newProblemId;
        
        // Reset chat state for the new problem
        setChatMessages([]);
        setIsAnalyzing(true);
        setIsTyping(false);
        setShowQuickQuestions(true);
      }
    }
  }, [problem]);
  
  // Effect for handling tab switching to AI assistant
  useEffect(() => {
    // When switching to AI assistant tab, make sure we're not stuck in analyzing state
    if (contentActive === 'ai-assistant' && chatMessages.length > 0) {
      setIsAnalyzing(false);
    }
  }, [contentActive, chatMessages.length]);
  
  // Separate effect for actual API call, depending on analyzing state
  useEffect(() => {
    // Only proceed if we're in analyzing state and have a problem and API key
    if (isAnalyzing && problem && data?.apiKey && contentActive === 'ai-assistant') {
      const analyzeCode = async () => {
        try {
          const response = await fetch('/api/openai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: problem.question,
              solution: problem.solution,
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
  }, [isAnalyzing, problem, data?.apiKey, editorContent, contentActive]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  // Mutation to save the solution directly to the database
  const updateSolutionMutation = useMutation(
    async (newSolution: string) => {
      // Get authentication token
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Authentication token is not available');
      }
      
      const response = await fetch(`/api/updateProblem?problemId=${problem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: problem.name,
          question: problem.question,
          solution: newSolution,
          difficulty: problem.difficulty,
          collectionId: Number(collectionId),
          functionSignature: problem.functionSignature,
          language: problem.language,
          link: problem.link,
          notes: problem.notes
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
        // Update the cached data
        queryClient.invalidateQueries(['problem', problem.id]);
        
        // Update the problem object with the new solution
        if (data && typeof data === 'object') {
          // Update any local data or state that might be needed
          problem.solution = data.solution || generatedSolution;
        }
        
        // Reset the generated solution state since it's now the actual solution
        setGeneratedSolution(null);
      },
      onError: (error) => {
        console.error('Error saving solution:', error);
        
        // Provide more user-friendly error messages
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
  
  // Function to save the generated solution
  const saveSolution = async () => {
    if (!generatedSolution) return;
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      showToast('Please sign in to save your solution.');
      return;
    }
    
    console.log('Saving solution for problem:', problem.id);
    console.log('Collection ID:', collectionId, 'Type:', typeof collectionId);
    
    setIsSavingSolution(true);
    updateSolutionMutation.mutate(generatedSolution);
  };

  // Function to generate solution using AI
  const generateSolution = async () => {
    if (!problem || !data?.apiKey) {
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
          question: problem.question,
          language: problem.language,
          apiKey: data.apiKey,
          mode: "generate",
          editorContent: problem.functionSignature || editorContent // Use function signature or current editor content
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

  // Function for handling AI interactions - no longer needed for modal toggle

  if (!problem) {
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
            
            {/* Inner circle with logo or icon */}
            
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

  const renderTabContent = () => {
    if (contentActive === 'notes') {
      return <p className="text-primary mt-4 whitespace-pre-wrap text-lg wrap-text bg-base_100">{problem.notes}</p>;
    } else if (contentActive === 'question') {
      return (
        <div 
          className="text-primary mt-4 problem-content prose prose-invert max-w-none bg-base_100"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeCodeBlocks(problem.question)
          }}
        />
      );
    } else if (contentActive === 'whiteboard') {
      return <Whiteboard 
        className="mt-4 h-[800px]"
        elements={whiteboardElements}
        setElements={setWhiteboardElements}
        history={whiteboardHistory}
        setHistory={setWhiteboardHistory}
        historyIndex={whiteboardHistoryIndex}
        setHistoryIndex={setWhiteboardHistoryIndex}
      />
    } else if (contentActive === 'ai-assistant') {
      return <ChatWindow
          problem={problem} 
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
    } else {
      // Solution tab
      const isTodoSolution = problem.solution?.includes("# TODO: Enter your solution here by editing the problem");
      const solutionToDisplay = generatedSolution || problem.solution;
      
      return (
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
                  (isTodoSolution || !problem.solution) ? 'Generate with AI' : 'Regenerate Solution'}
              </button>
            </div>
          )}
          
          {/* Show save button if solution was generated but not saved yet */}
          {generatedSolution && !isGeneratingSolution && generatedSolution !== problem.solution && (
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
          
          {/* Display solution or loading indicator */}
          {isGeneratingSolution ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3 text-primary">Generating solution...</span>
            </div>
          ) : (
            <>
              {/* Show AI indicator if solution was generated by AI */}
              {generatedSolution && generatedSolution !== problem.solution && (
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
              {/* Check if solution is likely markdown and render appropriately */}
              {isMarkdown(solutionToDisplay) ? (
                <div 
                  className="solution-markdown prose prose-invert max-w-none wrap-text bg-base_100"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(solutionToDisplay) }}
                />
              ) : (
                <pre className="wrap-text bg-base_100 whitespace-pre-wrap">
                  <code className={`language-${problem.language} mr-5`}>{solutionToDisplay}</code>
                </pre>
              )}
            </>
          )}
        </div>
      );
    }
  };

  return (
    <div className="h-screen bg-[#2A303C] flex flex-col">
      {/* Add the style tag to include the CSS */}
      <style>{preBlockStyles}</style>
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-[#3A4253] bg-[#343B4A]">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center text-[#B0B7C3] hover:text-primary transition-colors mr-6 group"
          >
            <div className="p-2 rounded-lg group-hover:bg-[#2A303C] transition-colors">
              <span className="material-icons">arrow_back</span>
            </div>
          </button>
          <h1 className="text-2xl font-semibold text-primary mr-4">
            {problem.name}
          </h1>
          <div className="flex gap-2 mr-4">
            <Badge 
              type="difficulty" 
              value={problem.difficulty} 
              className="text-sm py-1.5 px-4" 
            />
            <Badge 
              type="problemType" 
              value={problem.type} 
              className="text-sm py-1.5 px-4"
            />
          </div>
        </div>
        
        {/* System status indicator moved to the right */}
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
          className="h-full overflow-auto bg-base_100"
          style={{ width: `${panelWidth}%` }}
        >
          <div className="h-full border-r border-[#3A4253] bg-base_100">
            <div className="p-4 border-b border-[#3A4253]">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <TabButton 
                  active={contentActive === 'question'} 
                  label="Description" 
                  onClick={() => setContentActive('question')}
                  icon="description"
                />
                <TabButton 
                  active={contentActive === 'notes'} 
                  label="Notes" 
                  onClick={() => setContentActive('notes')}
                  icon="edit_note"
                />
                <TabButton
                  active={contentActive==='whiteboard'}
                  label="Whiteboard"
                  onClick={() => setContentActive('whiteboard')}
                  icon='dataset'
                />
                <TabButton 
                  active={contentActive === 'solution'} 
                  label="Solution" 
                  onClick={() => setContentActive('solution')}
                  icon="code"
                />
                <TabButton
                  active={contentActive === 'ai-assistant'}
                  label="Repcode AI"
                  onClick={() => setContentActive('ai-assistant')}
                  icon='bolt'
                />
                
                {/* Vertical divider */}
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
                   <ActionButton 
                     onClick={() => window.open(problem.link, '_blank')}
                     icon="open_in_new"
                     label="Run on Leetcode"
                   />
              </div>
            </div>
            <div className="p-6 bg-base_100">
              {renderTabContent()}
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
          <AceEditor
            className="rounded"
            mode={problem.language}
            theme="one_dark"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            fontSize={16}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            value={editorContent || problem.functionSignature}
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
        </div>
      </div>
      
      <ReactTooltip
        id="my-tooltip-1"
        place="bottom"
        style={{ backgroundColor: "#111111" }}
      />
      
      {/* Always render modals but control visibility with isOpen prop */}
      <ProblemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        collectionId={collectionId}
        isEditMode={true}
        problemToEdit={generatedSolution ? {...problem, solution: generatedSolution} : problem}
        showToast={showToast}
      />

      <ProblemStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        problem={problem}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </div>
  );
};

export default Problem;