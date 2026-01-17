import React, { useState, useEffect, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query'; 
import { AuthContext } from '@/auth/AuthContext';

const MAX_PROBLEMS = 152;

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
  isEditMode?: boolean;
  problemToEdit?: any;
  showToast?: any;
}

const ProblemModal = ({
  isOpen,
  onClose,
  collectionId,
  isEditMode = false,
  problemToEdit = null,
  showToast
}: ProblemModalProps) => {
  const [problemNumber, setProblemNumber] = useState('');
  const [name, setName] = useState(isEditMode && problemToEdit ? problemToEdit.name : '');
  const [question, setQuestion] = useState(isEditMode && problemToEdit ? problemToEdit.question : '');
  const [solution, setSolution] = useState(isEditMode && problemToEdit ? problemToEdit.solution : '');
  const [difficulty, setDifficulty] = useState(isEditMode && problemToEdit ? problemToEdit.difficulty : 'Easy');
  const [functionSignature, setFunctionSignature] = useState(isEditMode && problemToEdit ? problemToEdit.functionSignature : '');
  const [language, setLanguage] = useState(isEditMode && problemToEdit ? problemToEdit.language : 'python');
  const [link, setLink] = useState(isEditMode && problemToEdit ? problemToEdit.link : '');
  const [notes, setNotes] = useState(isEditMode && problemToEdit ? problemToEdit.notes : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(isEditMode && problemToEdit ? problemToEdit.name : '');
      setQuestion(isEditMode && problemToEdit ? problemToEdit.question : '');
      setSolution(isEditMode && problemToEdit ? problemToEdit.solution : '');
      setDifficulty(isEditMode && problemToEdit ? problemToEdit.difficulty : 'Easy');
      setFunctionSignature(isEditMode && problemToEdit ? problemToEdit.functionSignature : '');
      setLanguage(isEditMode && problemToEdit ? problemToEdit.language : 'python');
      setLink(isEditMode && problemToEdit ? problemToEdit.link : '');
      setNotes(isEditMode && problemToEdit ? problemToEdit.notes : '');
      setProblemNumber('');
      // Expand Manual Entry by default when editing, collapse when adding new
      setIsManualEntryOpen(isEditMode);
    }
  }, [isOpen, isEditMode, problemToEdit]);

  // ======= React Query hooks =======

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

  const {
    isLoading: userLoading,
    data: theUser,
    error: userError
  } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user,
  });

  const fetchProblems = async () => {
    const response = await fetch(`/api/getCollectionProblems?collectionId=${collectionId}&userId=${theUser?.id}`);
    if (!response.ok) throw new Error('Failed to fetch problems');
    return response.json();
  };

  useQuery(
    ['collectionProblems', collectionId, theUser?.id],
    fetchProblems,
    { enabled: isOpen && !!user }
  );

  const { data: problemCount } = useQuery(
    ['problemCount', collectionId],
    async () => {
      const response = await fetch(`/api/getCollectionProblems?collectionId=${collectionId}`);
      const probs = await response.json();
      return probs.length;
    },
    { enabled: !!collectionId && !isEditMode }
  );

  // ======= Mutations =======

  const mutation = useMutation(
    async ({
      name,
      question,
      solution,
      difficulty,
      collectionId,
      functionSignature,
      language,
      link,
      notes,
      headers
    }: {
      name: string;
      question: string;
      solution: string;
      difficulty: string;
      collectionId: number;
      functionSignature: string;
      language: string;
      link: string;
      notes: string;
      headers: HeadersInit;
    }) => {
      if (!isEditMode && problemCount && problemCount >= MAX_PROBLEMS) {
        throw new Error(`Collections cannot have more than ${MAX_PROBLEMS} problems`);
      }

      setIsSubmitting(true);
      const url = isEditMode
        ? `/api/updateProblem?problemId=${problemToEdit.id}`
        : '/api/createProblem';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name,
          question,
          solution,
          difficulty,
          collectionId,
          functionSignature,
          language,
          link,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit problem');
      }
      const result = await response.json();

      // Update collection counts if this is a new problem
      if (!isEditMode) {
        const updateResponse = await fetch('/api/updateCollectionCounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionId }),
        });
        if (!updateResponse.ok) {
          throw new Error('Failed to update collection counts');
        }
      }

      return result;
    },
    {
      onSuccess: async () => {
        // Update streak only when CREATING a new problem (not editing)
        // This must happen BEFORE invalidating userSettings so the refetch gets the new value
        if (!isEditMode && user?.email) {
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

        // Invalidate queries (after streak update so userSettings gets fresh data)
        queryClient.invalidateQueries(['collectionDetails']);
        queryClient.invalidateQueries(['problemDetails']);
        queryClient.invalidateQueries(['allProblems', user?.email]);
        queryClient.invalidateQueries(['dueTodayProblems', user?.email]);
        queryClient.invalidateQueries(['userSettings', user?.email]);
        queryClient.invalidateQueries(['collectionProblems', collectionId]);
        queryClient.invalidateQueries(['collections', user?.email]);

        showToast?.(
          <>
            <span className="inline-block mr-2 bg-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
            {isEditMode ? 'Problem updated successfully' : 'Problem created successfully'}
          </>
        );
        onClose();
      },
      onError: (error: any) => {
        console.error('Failed to submit problem:', error);
        showToast?.(
          <>
            <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
            {error.message}
          </>
        );
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // ======= Handlers =======

  const handleAutofill = async () => {
    setIsAutofilling(true);
    try {
      const response = await fetch('/problems.json');
      if (!response.ok) throw new Error('Failed to load problems data');
      const problemsData = await response.json();

      // Compare the problem number as a string
      const problem = problemsData.find((p: any) => p.number === problemNumber.trim());
      if (problem) {
        setName(`${problem.number}. ${problem.title}`);
        setQuestion(problem.content);
        setDifficulty(problem.difficulty);
        setLink(problem.url);
        setFunctionSignature(problem.boilerplate);
        setSolution('# TODO: Enter your solution here by editing the problem');

        showToast?.(
          <>
            <span className="inline-block mr-2 bg-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
            Problem autofilled successfully
          </>
        );
      } else {
        showToast?.('Problem not found');
      }
    } catch (error) {
      console.error('Error fetching problem data:', error);
      showToast?.('Error fetching problem data');
    } finally {
      setIsAutofilling(false);
    }
  };

  const generateAISolution = async () => {
    if (!theUser?.apiKey) {
      showToast?.(
        <>
          <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Please add your OpenAI API key in settings first
        </>
      );
      return;
    }

    if (!question.trim()) {
      showToast?.(
        <>
          <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Please enter a question first
        </>
      );
      return;
    }

    setIsGeneratingSolution(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          solution: '',
          userSolution: '',
          userMessage: `Generate a complete solution for this problem in ${language}. Strictly only provide the code without any explanations, comments, or markdown formatting.`,
          apiKey: theUser.apiKey,
          mode: 'chat'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate solution');
      }

      const data = await response.json();
      let generatedCode = data.message || '';

      // Remove markdown code blocks if present
      generatedCode = generatedCode.replace(/```[\w]*\n?/g, '').trim();

      // Filter out lines that look like explanations
      const lines = generatedCode.split('\n');
      const codeLines = lines.filter((line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return true; // Keep empty lines for formatting

        // Keep comments
        if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return true;
        }

        // Keep lines that look like code 
        const hasCodeSymbols = /[{}\[\]();=<>+\-*/%&|^]/.test(trimmed);
        const startsWithKeyword = /^(function|const|let|var|class|def|import|from|return|if|else|for|while|try|catch|async|await|public|private|protected|static)/i.test(trimmed);

        return hasCodeSymbols || startsWithKeyword;
      });

      const cleanedCode = codeLines.join('\n').trim();
      setSolution(cleanedCode);

      showToast?.(
        <>
          <span className="inline-block mr-2 bg-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Solution generated successfully
        </>
      );
    } catch (error) {
      console.error('Error generating solution:', error);
      showToast?.(
        <>
          <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Failed to generate solution. Please try again.
        </>
      );
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      console.error('Authentication token is not available.');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    mutation.mutate({
      name,
      question,
      solution,
      difficulty,
      collectionId,
      functionSignature,
      language,
      link,
      notes,
      headers
    });
  };

  // ======= Render =======
  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div
        className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl rounded-xl 
          shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 
          bg-gradient-to-b from-[#2A303C] to-[#252B38] border border-[#3A4150]/50 
          text-primary overflow-hidden max-h-[90vh] flex flex-col
          ${isOpen ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-[40%] pointer-events-none"}
        `}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]" />

        <div className="p-6 relative overflow-y-auto">
          {/* Header with close button and curved gradient line */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold tracking-tight text-primary">
                {isEditMode ? 'Edit Problem' : 'Add New Problem'}
              </h2>
              
              {/* Curved gradient line - now positioned next to the header with increased width */}
              <div className="ml-4 w-[600px] h-6 overflow-hidden pointer-events-none">
                <svg
                  className="w-full"
                  height="20"
                  viewBox="0 0 400 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path d="M0 10C80 20 180 0 400 10" stroke="url(#blueGradient)" strokeWidth="1.5" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="10" x2="400" y2="10" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#06b6d4" />
                      <stop offset="1" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-[#3A4150]/70 transition-colors duration-200 flex items-center justify-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* QUICK IMPORT SECTION */}
            <div className="p-4 rounded-lg bg-[#343B4A]/50">
              <h3 className="text-lg font-semibold text-primary mb-2 text-center">Quick Import</h3>
              <p className="text-gray-300 text-sm mb-4 text-center">
                Enter a Leetcode problem number to automatically fill out the details
              </p>

              <div className="flex justify-center gap-6">
                {/* Problem number input */}
                <div className="relative group">
                  <input
                    type="text"
                    value={problemNumber}
                    onChange={(e) => setProblemNumber(e.target.value)}
                    className="w-36 px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70 rounded-md shadow-sm 
                               outline-none focus:outline-none focus:border-[#06b6d4]/70 focus:ring-1 focus:ring-[#3b82f6]/50 
                               transition-colors duration-75 text-primary h-11 text-center"
                    placeholder="e.g. 1337"
                  />
                  <div className="absolute inset-0 rounded-md border border-[#3b82f6]/0 
                                  group-focus-within:border-[#3b82f6]/30 pointer-events-none 
                                  transition-all duration-75 shadow-[0_0_0_0_rgba(59,130,246,0)]
                                  group-focus-within:shadow-[0_0_10px_1px_rgba(59,130,246,0.2)]"
                  />
                </div>

                {/* Autofill button */}
                <button
                  type="button"
                  onClick={handleAutofill}
                  disabled={isAutofilling}
                  className={`
                    relative overflow-hidden bg-[#FAFAFA] text-neutral px-6 py-2 rounded-md 
                    transition duration-200 border border-transparent
                    hover:opacity-90
                    ${isAutofilling ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isAutofilling ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral inline-block"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Autofilling...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="material-icons">auto_fix_high</span>
                      Autofill
                    </div>
                  )}
                  <span className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-10 transition-opacity duration-300" />
                </button>
              </div>
            </div>

            {/* MANUAL ENTRY SECTION */}
            <div className="bg-[#343B4A]/50 p-4 rounded-lg border border-[#3A4150]/30">
              <div
                onClick={() => setIsManualEntryOpen(!isManualEntryOpen)}
                className="p-2 rounded-md hover:bg-[#3A4150]/50 cursor-pointer transition-colors duration-200 flex items-center justify-between"
              >
                <span className="text-lg font-semibold text-primary">Manual Entry</span>
                <span
                  className={`material-icons transition-transform duration-300 text-secondary ${
                    isManualEntryOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>

              <div
                className={`
                  transition-all duration-300 ease-in-out overflow-hidden
                  ${isManualEntryOpen ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="space-y-4">
                  {/* NAME */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      Name <span className="ml-1 text-error">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70 
                                   rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 
                                   focus:ring-1 focus:ring-[#3b82f6]/50 transition-colors duration-75
                                   text-primary h-11"
                        placeholder="Enter the name of the problem"
                      />
                      <div className="absolute inset-0 rounded-md border border-[#3b82f6]/0 
                                      group-focus-within:border-[#3b82f6]/30 pointer-events-none 
                                      transition-all duration-75 shadow-[0_0_0_0_rgba(59,130,246,0)]
                                      group-focus-within:shadow-[0_0_10px_1px_rgba(59,130,246,0.2)]"
                      />
                    </div>
                  </div>

                  {/* QUESTION */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      Question <span className="ml-1 text-error">*</span>
                    </label>
                    <div className="relative group">
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70 
                                   rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 
                                   focus:ring-1 focus:ring-[#3b82f6]/50 transition-colors duration-75
                                   text-primary min-h-[8rem] resize-none appearance-none"
                        placeholder={`Copy/paste the actual question here. Use HTML tags (<code>, <pre>, <p>, etc.) if needed.`}
                      />
                      <div className="absolute inset-0 rounded-md 
                                      group-focus-within:border-[#3b82f6]/30 pointer-events-none 
                                      transition-all duration-75"
                      />
                    </div>
                  </div>

                  {/* SOLUTION */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        Solution <span className="ml-1 text-error">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateAISolution}
                        disabled={isGeneratingSolution || !question.trim()}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                          transition-all duration-200
                          ${isGeneratingSolution || !question.trim()
                            ? 'bg-[#3A4150]/50 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white hover:from-[#0ea5c4] hover:to-[#2d74e7]'
                          }
                        `}
                      >
                        {isGeneratingSolution ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-icons" style={{ fontSize: '14px' }}>auto_awesome</span>
                            <span>Generate Solution</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative group">
                      <textarea
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70
                                   rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70
                                   focus:ring-1 focus:ring-[#3b82f6]/50 transition-colors duration-75
                                   text-primary min-h-[12rem] resize-y"
                        placeholder="Copy/paste the solution here (syntax highlighting is applied after creation)."
                      />
                      <div className="absolute inset-0 rounded-md
                                      group-focus-within:border-[#3b82f6]/30 pointer-events-none
                                      transition-all duration-75"
                      />
                    </div>
                  </div>

                  {/* FUNCTION SIGNATURE */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      Function Signature
                    </label>
                    <div className="relative group">
                      <textarea
                        value={functionSignature}
                        onChange={(e) => setFunctionSignature(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70 
                                   rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 
                                   focus:ring-1 focus:ring-[#3b82f6]/50 transition-colors duration-75
                                   text-primary min-h-[4rem]"
                        placeholder="Paste the boilerplate code or function signature here."
                      />
                      <div className="absolute inset-0 rounded-md 
                                      group-focus-within:border-[#3b82f6]/30 pointer-events-none 
                                      transition-all duration-75 "
                      />
                    </div>
                  </div>

                  {/* PROGRAMMING LANGUAGE */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      Programming Language <span className="ml-1 text-error">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70 
                                   rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 
                                   focus:ring-1 focus:ring-[#3b82f6]/50 transition-colors duration-75
                                   text-primary h-11"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python3</option>
                        <option value="c_cpp">C/C++</option>
                        <option value="java">Java</option>
                      </select>
                      <div className="absolute inset-0 rounded-md border border-[#3b82f6]/0 
                                      group-focus-within:border-[#3b82f6]/30 pointer-events-none 
                                      transition-all duration-75 shadow-[0_0_0_0_rgba(59,130,246,0)]
                                      group-focus-within:shadow-[0_0_10px_1px_rgba(59,130,246,0.2)]"
                      />
                    </div>
                  </div>

                  {/* LINK */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      Link to Problem
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70 
                                   rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 
                                   focus:ring-1 focus:ring-[#3b82f6]/50 transition-colors duration-75
                                   text-primary h-11"
                        placeholder="https://leetcode.com/problems/two-sum/"
                      />
                      <div className="absolute inset-0 rounded-md border border-[#3b82f6]/0 
                                      group-focus-within:border-[#3b82f6]/30 pointer-events-none 
                                      transition-all duration-75 shadow-[0_0_0_0_rgba(59,130,246,0)]
                                      group-focus-within:shadow-[0_0_10px_1px_rgba(59,130,246,0.2)]"
                      />
                    </div>
                  </div>

                  {/* NOTES */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      Additional Notes
                    </label>
                    <div className="relative group">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E232C] border border-[#3A4150]/70 
                                   rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 
                                   focus:ring-1 focus:ring-[#3b82f6]/50 transition-colors duration-75
                                   text-primary min-h-[4rem]"
                        placeholder="- Add any notes for yourself about this problem"
                      />
                      <div className="absolute inset-0 rounded-md 
                                      group-focus-within:border-[#3b82f6]/30 pointer-events-none 
                                      transition-all duration-75"
                      />
                    </div>
                  </div>

                  {/* DIFFICULTY */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      Difficulty <span className="ml-1 text-error">*</span>
                    </label>
                    <div className="flex gap-4 pt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="Easy"
                          name="difficulty"
                          checked={difficulty === 'Easy'}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border 
                                     ${difficulty === 'Easy' 
                                       ? 'text-easy bg-easybg border-[#296C62]' 
                                       : 'text-[#B0B7C3] bg-[#3A4253] border-[#3A4253]'} 
                                     transition-all duration-200 cursor-pointer`}
                        >
                          <span className="material-icons mr-1.5 fill-current" style={{ fontSize: '12px' }}>circle</span>
                          Easy
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="Medium"
                          name="difficulty"
                          checked={difficulty === 'Medium'}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border 
                                     ${difficulty === 'Medium' 
                                       ? 'text-medium bg-mediumbg border-[#815954]' 
                                       : 'text-[#B0B7C3] bg-[#3A4253] border-[#3A4253]'} 
                                     transition-all duration-200 cursor-pointer`}
                        >
                          <span className="material-icons mr-1.5 fill-current" style={{ fontSize: '12px' }}>circle</span>
                          Medium
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="Hard"
                          name="difficulty"
                          checked={difficulty === 'Hard'}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border 
                                     ${difficulty === 'Hard' 
                                       ? 'text-hard bg-hardbg border-[#7D3E55]' 
                                       : 'text-[#B0B7C3] bg-[#3A4253] border-[#3A4253]'} 
                                     transition-all duration-200 cursor-pointer`}
                        >
                          <span className="material-icons mr-1.5 fill-current" style={{ fontSize: '12px' }}>circle</span>
                          Hard
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER / STATUS & BUTTONS */}
            <div className="border-t border-[#3A4150]/70 pt-4 flex items-center justify-between">
              {/* Status Indicator */}
              <div className="flex items-center">
                {(() => {
                  const requiredFields = [name, question, solution];
                  const filledFields = requiredFields.filter(field => field.trim() !== '');
                  
                  if (filledFields.length === 0) {
                    return (
                      <div className="flex items-center">
                        <span
                          className="inline-block mr-2 bg-error rounded-full"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <span className="text-secondary text-sm">No problem selected</span>
                      </div>
                    );
                  } else if (filledFields.length < requiredFields.length) {
                    return (
                      <div className="flex items-center">
                        <span
                          className="inline-block mr-2 bg-warning rounded-full"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <span className="text-secondary text-sm">Partially filled out</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center">
                        <span
                          className="inline-block mr-2 bg-success rounded-full"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <span className="text-secondary text-sm">{name}</span>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!name.trim() || !question.trim() || !solution.trim() || isSubmitting}
                  className={`
                    relative overflow-hidden bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] 
                    text-primary px-6 py-2 rounded-md transition-all duration-200
                    ${(!name.trim() || !question.trim() || !solution.trim() || isSubmitting)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:from-[#0ea5c4] hover:to-[#2d74e7]"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary inline-block"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditMode ? 'Update' : 'Create'
                  )}
                  <span className="absolute inset-0 w-full h-full bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProblemModal;
