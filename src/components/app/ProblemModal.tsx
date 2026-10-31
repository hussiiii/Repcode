import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/ui/typography';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { FieldLabel, Field } from '@/components/ui/field';
import { InputGroup } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
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
  showToast: notify
}: ProblemModalProps) => {
  const { toast } = useToast();
  const showToast = notify ?? toast;
  const submittingRef = React.useRef(false);
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
    const response = await authenticatedFetch(`/api/getUserSettings`);
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
    const response = await authenticatedFetch(`/api/getCollectionProblems?collectionId=${collectionId}`);
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
      const response = await authenticatedFetch(`/api/getCollectionProblems?collectionId=${collectionId}`);
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

      const response = await authenticatedFetch(url, {
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
        const updateResponse = await authenticatedFetch('/api/updateCollectionCounts', {
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

            await authenticatedFetch('/api/updateStreak', {
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
            <span className="inline-block mr-2 bg-status-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
            {isEditMode ? 'Problem updated successfully' : 'Problem created successfully'}
          </>
        );
        onClose();
      },
      onError: (error: any) => {
        console.error('Failed to submit problem:', error);
        showToast?.(
          <>
            <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
            {error.message}
          </>
        );
      },
      onSettled: () => {
        setIsSubmitting(false);
        submittingRef.current = false;
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
            <span className="inline-block mr-2 bg-status-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
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
    if (!theUser?.hasApiKey) {
      showToast?.(
        <>
          <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Please add your OpenAI API key in settings first
        </>
      );
      return;
    }

    if (!question.trim()) {
      showToast?.(
        <>
          <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Please enter a question first
        </>
      );
      return;
    }

    setIsGeneratingSolution(true);
    try {
      const response = await authenticatedFetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          solution: '',
          userSolution: '',
          userMessage: `Generate a complete solution for this problem in ${language}. Strictly only provide the code without any explanations, comments, or markdown formatting.`,
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
          <span className="inline-block mr-2 bg-status-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Solution generated successfully
        </>
      );
    } catch (error) {
      console.error('Error generating solution:', error);
      showToast?.(
        <>
          <span className="inline-block mr-2 bg-status-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
          Failed to generate solution. Please try again.
        </>
      );
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || !name.trim() || !question.trim() || !solution.trim()) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Authentication token is not available.');
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
    } catch (error) {
      console.error('Failed to submit form:', error);
      showToast('Unable to submit. Please sign in again and retry.');
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ======= Render =======
  return (
    <>
      {/* Backdrop */}


      {/* Modal Container */}
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent size="lg" scroll="contained" dismissible={!isSubmitting}>
        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end" />

        <ScrollArea direction="both" className="p-6 relative">
          {/* Header with close button and curved gradient line */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center">
              <DialogTitle>
                {isEditMode ? 'Edit Problem' : 'Add New Problem'}
              </DialogTitle>

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
                      <stop stopColor={cssColor('app-action-start')} />
                      <stop offset="1" stopColor={cssColor('app-action-end')} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <Button variant="close" aria-label="Close dialog" disabled={isSubmitting}
              onClick={onClose}>
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
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* QUICK IMPORT SECTION */}
            <Card surface="muted" radius="lg" border="none" padding="md" elevation="none">
              <Heading as="h3" size="lg" weight="semibold" tone="foreground" className="mb-2 text-center">Quick Import</Heading>
              <p className="text-foreground-soft text-sm mb-4 text-center">
                Enter a Leetcode problem number to automatically fill out the details
              </p>

              <div className="flex justify-center gap-6">
                {/* Problem number input */}
                <InputGroup variant="glow" motion="fast" >
                  <Input variant="problem" className="w-36" align="center" aria-label="LeetCode problem number"
                    type="text"
                    value={problemNumber}
                    onChange={(e) => setProblemNumber(e.target.value)}
                    placeholder="e.g. 1337"
                  />

                </InputGroup>

                {/* Autofill button */}
                <Button variant="autofill" size="dialog" loading={isAutofilling}
                  type="button"
                  onClick={handleAutofill}
                  disabled={isAutofilling}>
                  {isAutofilling ? (
                    <div className="flex items-center gap-2">
                      <Spinner variant="autofill" />
                      Autofilling...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="material-icons">auto_fix_high</span>
                      Autofill
                    </div>
                  )}
                  <span className="absolute inset-0 bg-overlay/10 opacity-0 hover:opacity-10 transition-opacity duration-300" />
                </Button>
              </div>
            </Card>

            {/* MANUAL ENTRY SECTION */}
            <Collapsible open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen} asChild>
            <Card surface="muted" radius="lg" border="soft" padding="md" elevation="none">
              <CollapsibleTrigger asChild>
              <Button variant="disclosure" size="natural" className="w-full">

                <span>Manual Entry</span>
                <span
                  aria-hidden="true" className={`material-icons transition-transform duration-300 text-muted-foreground ${
                    isManualEntryOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  {/* NAME */}
                  <Field spacing="tight" >
                    <FieldLabel variant="field" >
                      Name <span className="ml-1 text-status-error">*</span>
                    </FieldLabel>
                    <InputGroup variant="glow" motion="fast" >
                      <Input variant="problem" className="w-full" aria-required="true"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter the name of the problem"
                      />

                    </InputGroup>
                  </Field>

                  {/* QUESTION */}
                  <Field spacing="tight" >
                    <FieldLabel variant="field" >
                      Question <span className="ml-1 text-status-error">*</span>
                    </FieldLabel>
                    <InputGroup variant="minimal" motion="fast" >
                      <Textarea variant="problem" className="w-full" minSize="md" resizable aria-required="true"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={`Copy/paste the actual question here. Use HTML tags (<code>, <pre>, <p>, etc.) if needed.`}
                      />

                    </InputGroup>
                  </Field>

                  {/* SOLUTION */}
                  <Field spacing="tight" >
                    <div className="flex items-center justify-between">
                      <FieldLabel variant="field" >
                        Solution <span className="ml-1 text-status-error">*</span>
                      </FieldLabel>
                      <Button variant="generate" size="small" loading={isGeneratingSolution}
                        type="button"
                        onClick={generateAISolution}
                        disabled={isGeneratingSolution || !question.trim()}>
                        {isGeneratingSolution ? (
                          <>
                            <Spinner variant="compact" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-icons" style={{ fontSize: '14px' }}>auto_awesome</span>
                            <span>Generate Solution</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <InputGroup variant="minimal" motion="fast" >
                      <Textarea variant="problem" className="w-full" minSize="lg" resizable aria-required="true"
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        placeholder="Copy/paste the solution here (syntax highlighting is applied after creation)."
                      />

                    </InputGroup>
                  </Field>

                  {/* FUNCTION SIGNATURE */}
                  <Field spacing="tight" >
                    <FieldLabel variant="field" >
                      Function Signature
                    </FieldLabel>
                    <InputGroup variant="minimal" motion="fast" >
                      <Textarea variant="problem" className="w-full" minSize="sm"
                        value={functionSignature}
                        onChange={(e) => setFunctionSignature(e.target.value)}
                        placeholder="Paste the boilerplate code or function signature here."
                      />

                    </InputGroup>
                  </Field>

                  {/* PROGRAMMING LANGUAGE */}
                  <Field spacing="tight" >
                    <FieldLabel variant="field" >
                      Programming Language <span className="ml-1 text-status-error">*</span>
                    </FieldLabel>
                    <InputGroup variant="glow" motion="fast" >
                      <NativeSelect variant="problem" className="w-full"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python3</option>
                        <option value="c_cpp">C/C++</option>
                        <option value="java">Java</option>
                      </NativeSelect>

                    </InputGroup>
                  </Field>

                  {/* LINK */}
                  <Field spacing="tight" >
                    <FieldLabel variant="field" >
                      Link to Problem
                    </FieldLabel>
                    <InputGroup variant="glow" motion="fast" >
                      <Input variant="problem" className="w-full"
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://leetcode.com/problems/two-sum/"
                      />

                    </InputGroup>
                  </Field>

                  {/* NOTES */}
                  <Field spacing="tight" >
                    <FieldLabel variant="field" >
                      Additional Notes
                    </FieldLabel>
                    <InputGroup variant="minimal" motion="fast" >
                      <Textarea variant="problem" className="w-full" minSize="sm"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="- Add any notes for yourself about this problem"
                      />

                    </InputGroup>
                  </Field>

                  {/* DIFFICULTY */}
                  <Field spacing="tight" >
                    <FieldLabel variant="field" >
                      Difficulty <span className="ml-1 text-status-error">*</span>
                    </FieldLabel>
                    <RadioGroup variant="pills" name="difficulty" value={difficulty} onValueChange={setDifficulty} orientation="horizontal"><RadioGroupItem variant="pill" tone="easy" value="Easy"><span className="material-icons mr-1.5 fill-current" aria-hidden="true" style={{ fontSize: '12px' }}>circle</span>Easy</RadioGroupItem>
<RadioGroupItem variant="pill" tone="medium" value="Medium"><span className="material-icons mr-1.5 fill-current" aria-hidden="true" style={{ fontSize: '12px' }}>circle</span>Medium</RadioGroupItem>
<RadioGroupItem variant="pill" tone="hard" value="Hard"><span className="material-icons mr-1.5 fill-current" aria-hidden="true" style={{ fontSize: '12px' }}>circle</span>Hard</RadioGroupItem></RadioGroup>
                  </Field>
                </div>
              </CollapsibleContent>
            </Card>
            </Collapsible>

            {/* FOOTER / STATUS & BUTTONS */}
            <div className="border-t border-border-subtle/70 pt-4 flex items-center justify-between">
              {/* Status Indicator */}
              <div className="flex items-center">
                {(() => {
                  const requiredFields = [name, question, solution];
                  const filledFields = requiredFields.filter(field => field.trim() !== '');

                  if (filledFields.length === 0) {
                    return (
                      <div className="flex items-center">
                        <span
                          className="inline-block mr-2 bg-status-error rounded-full"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <span className="text-muted-foreground text-sm">No problem selected</span>
                      </div>
                    );
                  } else if (filledFields.length < requiredFields.length) {
                    return (
                      <div className="flex items-center">
                        <span
                          className="inline-block mr-2 bg-status-warning rounded-full"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <span className="text-muted-foreground text-sm">Partially filled out</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center">
                        <span
                          className="inline-block mr-2 bg-status-success rounded-full"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <span className="text-muted-foreground text-sm">{name}</span>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="dialog" size="dialog" loading={isSubmitting}
                  type="submit"
                  disabled={!name.trim() || !question.trim() || !solution.trim() || isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Spinner variant="button" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditMode ? 'Update' : 'Create'
                  )}
                  <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default ProblemModal;
