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
import { AuthContext } from '@/auth/AuthContext';
import ChatWindow from './ChatWindow';
import { Tooltip as ReactTooltip } from "react-tooltip";
import ProblemModal from './ProblemModal';
import ProblemStatsModal from './ProblemStatsModal';
import Toast from './Toast';
import Badge from '@/components/ui/Badge';

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
  
`;

const Problem = ({ problem, contentActive, setContentActive, editorContent, setEditorContent }: {problem:any, contentActive:any, setContentActive:any, editorContent:any, setEditorContent:any}) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { collectionId } = router.query // Assuming collectionId is part of the URL 
  const [showChat, setShowChat] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const queryClient = useQueryClient();
  
  // For resizable panels
  const [panelWidth, setPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ x: number, y: number } | null>(null);
  const aiButtonRef = useRef<HTMLButtonElement>(null);

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

  const { isLoading, data, error } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user, 
  });

  const handleGoBack = () => {
    router.push(`/app/collections/${collectionId}`);
  };

  // Use useEffect to highlight code when the component mounts or updates
  useEffect(() => {
    hljs.highlightAll();
  }, [contentActive, problem]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  // Function to toggle chat open/closed
  const handleToggleChat = () => {
    if (showChat) {
      // If chat is open, close it
      setShowChat(false);
    } else {
      // If chat is closed, open it and capture button position
      if (aiButtonRef.current) {
        const rect = aiButtonRef.current.getBoundingClientRect();
        setButtonPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top 
        });
        setShowChat(true);
      }
    }
  };

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
    } else {
      return <pre className="wrap-text bg-base_100"><code className={`language-${problem.language} mr-5`}>{problem.solution}</code></pre>;
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
                  active={contentActive === 'solution'} 
                  label="Solution" 
                  onClick={() => setContentActive('solution')}
                  icon="code"
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

      {showChat && (
        <ChatWindow 
          problem={problem} 
          editorContent={editorContent} 
          apiKey={data?.apiKey}
          baseUrl={data?.baseUrl}
          llmApiKey={data?.llmApiKey}
          llmModel={data?.llmModel}
          llmTemperature={data?.llmTemperature}
          llmTopP={data?.llmTopP}
          onClose={() => setShowChat(false)}
          buttonPosition={buttonPosition}
        />
      )}
      
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

      {/* Floating AI Help button with matching gradient and shadow */}
      <button 
        ref={aiButtonRef}
        onClick={handleToggleChat} 
        className={`fixed bottom-6 right-6 flex items-center px-4 py-3 bg-gradient-to-r ${
          showChat 
            ? "from-[#0891b2] to-[#2563eb]" // Slightly different gradient when active
            : "from-[#06b6d4] to-[#3b82f6]"
        } hover:from-[#0891b2] hover:to-[#2563eb] text-primary rounded-full transition-all duration-200 z-10 group`}
        style={{ 
          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)'
        }}
        onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)'}
        onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)'}
      >
        <span className="material-icons mr-2" style={{ fontSize: '20px' }}>auto_awesome</span>
        <span className="font-medium">{showChat ? "Close AI" : "AI Help"}</span>
        <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </button>
    </div>
  );
};

export default Problem;