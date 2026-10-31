import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import { Prose, Heading } from '@/components/ui/typography';
import { formatProblemContent } from '@/lib/problem-content';
import { ProblemWorkspace, type WorkspaceView } from './ProblemWorkspace';
import { LoadingState } from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useQueryClient } from 'react-query';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import hljs from 'highlight.js';
import { AuthContext } from '@/auth/AuthContext';
import ChatWindow from './ChatWindow';
import ProblemModal from './ProblemModal';
import ProblemStatsModal from './ProblemStatsModal';
import { useToast } from '@/components/ui/use-toast';
import { Whiteboard, DrawingElement } from './WhiteBoard';
import { ArrowLeft } from "lucide-react";
import Stopwatch from './Stopwatch';


const Problem = ({ problem, contentActive, setContentActive, editorContent, setEditorContent }: {problem:any, contentActive:any, setContentActive:any, editorContent:any, setEditorContent:any}) => {
  const { toast: showToast } = useToast(3000);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { collectionId } = router.query // Assuming collectionId is part of the URL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const editorRef = useRef<AceEditor | null>(null);
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
  const [localProblem, setLocalProblem] = useState(problem);

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await authenticatedFetch(`/api/getUserSettings`);
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
        if (currentProblemId.current !== null) {
          setWhiteboardElements([]);
          setWhiteboardHistory([[]]);
          setWhiteboardHistoryIndex(0);
          setChatInput('');
        }
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
    if (isAnalyzing && problem && data?.hasApiKey && contentActive === 'ai-assistant') {
      const requestProblemId = problem.id;
      const stillCurrent = () => currentProblemId.current === requestProblemId;
      const analyzeCode = async () => {
        try {
          const response = await authenticatedFetch('/api/openai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: problem.question,
              solution: problem.solution,
              userSolution: editorContent,
              userMessage: "analyze",
              mode: "analyze"
            }),
          });
          if (!stillCurrent()) return;

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
          if (!stillCurrent()) return;
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
  }, [isAnalyzing, problem, data?.hasApiKey, editorContent, contentActive]);



  // Sync local problem state when prop changes
  useEffect(() => {
    setLocalProblem(problem);
  }, [problem]);


  if (!problem) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <LoadingState />
      </div>
    );
  }

  const renderTabContent = (view: WorkspaceView) => {
    if (view === 'notes')
      return <p className="text-foreground mt-4 whitespace-pre-wrap text-lg break-words [word-break:break-word] bg-background">{localProblem.notes}</p>;
    if (view === 'question')
      return (
        <Prose
          dangerouslySetInnerHTML={{
            __html: formatProblemContent(localProblem.question)
          }}
        />
      );
    if (view === 'whiteboard')
      return (
        <Whiteboard
          active={contentActive === 'whiteboard'}
          className="mt-4 h-[600px]"
          elements={whiteboardElements}
          setElements={setWhiteboardElements}
          history={whiteboardHistory}
          setHistory={setWhiteboardHistory}
          historyIndex={whiteboardHistoryIndex}
          setHistoryIndex={setWhiteboardHistoryIndex}
        />
      );
    if (view === 'ai-assistant')
      return (
        <ChatWindow
          active={contentActive === 'ai-assistant'}
          problem={localProblem}
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
      );
    if (view === 'solution')
      return (
        <pre className="break-words [word-break:break-word] bg-background"><code className={`language-${localProblem.language} mr-5`}>{localProblem.solution}</code></pre>
      );
    return null;
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Add the style tag to include the CSS */}


      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border bg-surface" style={{ color: cssColor('foreground') }}>
        <div className="flex items-center">
          <Button variant="text" className="flex items-center mr-4" tone="editor" aria-label="Back to collection"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Heading as="h1" size="2xl" weight="semibold" tone="foreground" className="mr-4" style={{ color: cssColor('foreground') }}>
            {localProblem.name}
          </Heading>
          <div className="flex gap-2">
            <DifficultyBadge
              value={localProblem.difficulty}
              size="problem" foreground
            />
            <StudyStateBadge
              value={localProblem.type}
              size="problem" foreground
            />
          </div>
        </div>
        <div className="flex items-center text-xs text-foreground" style={{ color: cssColor('foreground') }}>
          <Stopwatch resetKey={localProblem.id} />
          <div className="relative mr-2">
            <div className="w-2.5 h-2.5 bg-study-review rounded-full"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 bg-presence-online rounded-full opacity-70 animate-pulse" style={{ filter: "blur(1px)" }}></div>
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

      <ProblemWorkspace activeView={contentActive} onViewChange={setContentActive} problemKey={localProblem.id}
        renderView={renderTabContent} onEdit={() => setIsEditModalOpen(true)} onStats={() => setIsStatsModalOpen(true)} link={localProblem.link}
        onEditorResize={() => editorRef.current?.editor.resize()}
        editor={<AceEditor
            ref={editorRef}
            className="rounded"
            mode={localProblem.language}
            theme="one_dark"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            fontSize={16}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            wrapEnabled={true}
            value={editorContent || localProblem.functionSignature}
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

      {/* Always render modals but control visibility with isOpen prop */}
      <ProblemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        collectionId={Number(collectionId)}
        isEditMode={true}
        problemToEdit={localProblem}
        showToast={showToast}
      />

      <ProblemStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        problem={localProblem}
      />
    </div>
  );
};

export default Problem;
