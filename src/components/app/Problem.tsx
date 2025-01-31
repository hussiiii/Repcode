import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import '../../app/globals.css'; 
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/theme-crimson_editor";
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

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

  const { isLoading, data, error } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user, 
  })

  const handleGoBack = () => {
    router.push(`/app/collections/${collectionId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
          return 'text-easy bg-easybg px-4'; 
      case 'medium':
          return 'text-medium bg-mediumbg px-2';
      case 'hard':
          return 'text-hard bg-hardbg px-4';
      default:
          return 'text-secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'new':
          return 'text-new bg-newbg px-4'; 
      case 'learning':
          return 'text-learning bg-warningbg px-2'; 
      case 'relearning':
          return 'text-learning bg-warningbg px-2'; 
      case 'review':
          return 'text-review bg-successbg px-2'; 
      default:
          return 'text-neutral dark:text-secondary'; 
    }
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

  if (!problem) {
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

  console.log(data)
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="flex-1 overflow-auto bg-tertiary p-4 rounded-sm shadow-md" style={{ maxHeight: '70vh' }}>
        {/* Buttons for toggling between question and solution */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handleGoBack} 
            className="flex items-center space-x-2 text-secondary bg-transparent hover:bg-divide hover:text-primary transition duration-300 ease-in-out p-2 rounded-md"
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
            <span>Back to collection</span>
          </button>

          <div className="flex space-x-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="py-2 px-4 text-secondary rounded-md transition duration-300 bg-tertiary hover:bg-divide flex items-center gap-1"
            >
              <span className="material-icons text-secondary" style={{ fontSize: '19px' }}>edit</span>
              Edit
            </button>
            <button 
              onClick={() => setIsStatsModalOpen(true)}
              className="py-2 px-4 text-secondary rounded-md transition duration-300 bg-tertiary hover:bg-divide flex items-center gap-1"
            >
              <span className="material-icons text-secondary" style={{ fontSize: '19px' }}>bar_chart</span>
              Stats
            </button>
          </div>
        </div>
        <div className="mb-4 flex space-x-2 bg-tertiary p-2 rounded-md">
          <button className={`py-2 px-4 text-primary rounded-md transition duration-300 ${contentActive === 'question' ? 'bg-divide' : 'bg-[#1e1e20]'}`} onClick={() => setContentActive('question')}><span className="material-icons text-secondary mr-1" style={{ fontSize: '19px' }}>library_books</span> Problem</button>
          <button className={`py-2 px-4 text-primary rounded-md transition duration-300 ${contentActive === 'notes' ? 'bg-divide' : 'bg-[#1e1e20]'}`} onClick={() => setContentActive('notes')}><span className="material-icons text-secondary mr-1" style={{ fontSize: '19px' }}>edit</span> Notes</button>
          <button className={`py-2 px-4 text-primary rounded-md transition duration-300 ${contentActive === 'solution' ? 'bg-divide' : 'bg-[#1e1e20]'}`} onClick={() => setContentActive('solution')}><span className="material-icons text-secondary mr-1" style={{ fontSize: '19px' }}>code</span> Solution</button>
        </div>
        {/* Left side content (The question) */}
        <div className="flex justify-between items-center text-secondary">
          <h1 className="text-xl font-bold">
            {problem.name}
            <a href={problem.link} target="_blank" rel="noopener noreferrer">
              <span className="material-icons hover:scale-110 text-pop2 ml-2"  data-tooltip-id="my-tooltip-1" data-tooltip-html="View on Leetcode">
                open_in_new
              </span>
            </a>
          </h1>
          <div className="text-right m-5">
            <span className={`${getDifficultyColor(problem.difficulty)} rounded-full py-1`}>
              {problem.difficulty}
            </span> 
            <span className="text-divide"> / </span> 
            <span className={`${getTypeColor(problem.type)} rounded-full py-1`}>
              {problem.type}
            </span>
          </div>
        </div>
        {contentActive === 'notes' ? (
          <p className="text-secondary mt-4 whitespace-pre-wrap text-lg wrap-text">{problem.notes}</p>
        ) : contentActive === 'question' ? (
          <div 
            className="text-secondary mt-4 problem-content"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeCodeBlocks(problem.question)
            }}
          />
        ) : (
          <pre className="wrap-text"><code className={`language-${problem.language} mr-5`}>{problem.solution}</code></pre>
        )}
      </div>
      
      <div className="w-px bg-gray-800"></div> {/* Vertical line */}
      <div className="flex-1 overflow-auto shadow-md" style={{ maxHeight: '70vh' }}>
        {/* Right side content (Ace Editor) */}
        <AceEditor
          className="rounded"
          mode={problem.language}
          theme="chaos"
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          fontSize={16}
          showPrintMargin={true}
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
          }}
          style={{ height: '100%', width: '100%' }}  
        />
        <button 
          onClick={() => setShowChat(true)} 
          className="inline-flex justify-center items-center absolute bottom-2 right-4 text-neutral bg-primary font-medium px-4 py-2 rounded-lg hover:scale-95 transition-transform duration-100"
        >
          <span className="material-icons text-neutral mr-1" style={{ fontSize: '20px' }}>chat</span> AI Feedback
        </button>
      </div>
      {showChat && (
        <ChatWindow 
          problem={problem} 
          editorContent={editorContent} 
          apiKey={data.apiKey}
          onClose={() => setShowChat(false)} 
        />
      )}
      <ReactTooltip
        id="my-tooltip-1"
        place="bottom"
        style={{ backgroundColor: "#111111" }}
      />
      {isEditModalOpen && (
        <ProblemModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          collectionId={collectionId}
          isEditMode={true}
          problemToEdit={problem}
          showToast={showToast}
        />
      )}

      {isStatsModalOpen && (
        <ProblemStatsModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          problem={problem}
        />
      )}

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </div>
  );
};

export default Problem;