import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useQueryClient } from 'react-query';
import '../../app/globals.css';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css'; // or any other style of your choice
import { AuthContext } from '@/auth/AuthContext';
import ChatWindow from './ChatWindow';
import { Tooltip as ReactTooltip } from "react-tooltip";
import ProblemModal from './ProblemModal';
import ProblemStatsModal from './ProblemStatsModal';
import Toast from './Toast';
import Badge from '@/components/ui/Badge';
import { Whiteboard, DrawingElement } from './WhiteBoard';
import { ArrowLeft, Edit3, BarChart2, ExternalLink, ClipboardPen, NotepadText, Lightbulb, BotMessageSquare, PenSquare } from "lucide-react";
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

const Problem = ({ problem, contentActive, setContentActive, editorContent, setEditorContent }: {problem:any, contentActive:any, setContentActive:any, editorContent:any, setEditorContent:any}) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { collectionId } = router.query // Assuming collectionId is part of the URL 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const queryClient = useQueryClient();

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
    hljs.highlightAll();
  }, [contentActive, problem]);
  
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
    if (contentActive === 'notes') 
      return <p className="text-white mt-4 whitespace-pre-wrap text-lg wrap-text bg-base_100">{problem.notes}</p>;
    if (contentActive === 'question') 
      return (
        <div 
          className="text-white mt-4 problem-content prose prose-invert max-w-none bg-base_100" 
          dangerouslySetInnerHTML={{ 
            __html: sanitizeCodeBlocks(problem.question) 
          }} 
        />
      );
    if (contentActive === 'whiteboard') 
      return (
        <Whiteboard 
          className="mt-4 h-[600px]" 
          elements={whiteboardElements} 
          setElements={setWhiteboardElements} 
          history={whiteboardHistory} 
          setHistory={setWhiteboardHistory} 
          historyIndex={whiteboardHistoryIndex} 
          setHistoryIndex={setWhiteboardHistoryIndex} 
        />
      );
    if (contentActive === 'ai-assistant') 
      return (
        <ChatWindow 
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
      );
    return <pre className="wrap-text bg-base_100"><code className={`language-${problem.language} mr-5`}>{problem.solution}</code></pre>;
  };

  return (
    <div className="h-screen bg-[#2A303C] flex flex-col">
      {/* Add the style tag to include the CSS */}
      <style>{preBlockStyles}</style>

      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-[#3A4253] bg-[#343B4A]" style={{ color: '#FFFFFF' }}>
        <div className="flex items-center">
          <button 
            onClick={handleGoBack} 
            className="flex items-center text-white hover:text-[#2196F3] transition-colors mr-4" style={{ color: '#FFFFFF' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-white mr-4" style={{ color: '#FFFFFF' }}>
            {problem.name}
          </h1>
          <Badge 
            type="difficulty" 
            value={problem.difficulty} 
            className="text-white text-sm py-1.5 px-4 bg-[#3A4253]" 
          />
          <Badge 
            type="problemType" 
            value={problem.type} 
            className="text-white text-sm py-1.5 px-4 bg-[#3A4253]" 
          />
        </div>
        <div className="flex items-center text-xs text-white" style={{ color: '#FFFFFF' }}>
          <div className="relative mr-2">
            <div className="w-2.5 h-2.5 bg-review rounded-full"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 bg-[#00FF00] rounded-full opacity-70 animate-pulse" style={{ filter: "blur(1px)" }}></div>
          </div>
          <span>all systems operational</span>
        </div>
      </div>

      {/* Main Content with Resizable Panels */}
      <div 
        className="flex-1 flex overflow-hidden" 
        onMouseMove={handleMouseMove} style={{ color: '#FFFFFF' }}
      >
        {/* Left Panel */}
        <div 
          className="h-full overflow-auto bg-base_100" 
          style={{ width: `${panelWidth}%`, color: '#FFFFFF' }}
        >
          <div className="h-full border-r border-[#3A4253] bg-base_100 flex flex-col" style={{ color: '#FFFFFF' }}>
            <div className="border-b border-[#3A4253] bg-base_100 sticky top-0 z-10 p-2" style={{ color: '#FFFFFF' }}>
              <div className="flex flex-wrap items-center gap-1 px-2">
                <TabButton 
                  active={contentActive === 'question'} 
                  label="Description" 
                  onClick={() => setContentActive('question')} 
                  icon={<ClipboardPen />} 
                />
                <TabButton 
                  active={contentActive === 'notes'} 
                  label="Notes" 
                  onClick={() => setContentActive('notes')} 
                  icon={<NotepadText />} 
                />
                <TabButton 
                  active={contentActive === 'whiteboard'} 
                  label="Whiteboard" 
                  onClick={() => setContentActive('whiteboard')} 
                  icon={<PenSquare />} 
                />
                <TabButton 
                  active={contentActive === 'solution'} 
                  label="Solution" 
                  onClick={() => setContentActive('solution')} 
                  icon={<Lightbulb />} 
                />
                <TabButton 
                  active={contentActive === 'ai-assistant'} 
                  label="Repcode AI" 
                  onClick={() => setContentActive('ai-assistant')} 
                  icon={<BotMessageSquare />} 
                />
              </div>
              <div className="flex justify-start gap-2 px-2 mt-2">
                <ActionButton onClick={() => setIsEditModalOpen(true)} 
                icon={<Edit3 />} 
                label="Edit" 
                />
                <ActionButton 
                onClick={() => setIsStatsModalOpen(true)} 
                icon={<BarChart2 />} 
                label="Stats" 
                />
                <ActionButton 
                onClick={() => window.open(problem.link, '_blank')} 
                icon={<ExternalLink />} 
                label="Run on Leetcode" 
                />
              </div>
            </div>
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-base_100" style={{ color: '#FFFFFF' }}>{renderTabContent()}</div>
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
          className="
            absolute top-1/2 -translate-y-1/2 
            transition-all duration-200 opacity-0 
            group-hover:opacity-100">
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
        collectionId={Number(collectionId)}
        isEditMode={true}
        problemToEdit={problem}
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