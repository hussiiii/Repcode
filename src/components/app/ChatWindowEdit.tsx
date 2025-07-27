import React, { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

const ChatWindow = ({ 
  problem, 
  editorContent, 
  apiKey, 
  baseUrl,
  llmApiKey,
  llmModel,
  llmTemperature,
  llmTopP,
  onClose, 
  buttonPosition 
}: { 
  problem: any, 
  editorContent: string, 
  apiKey: any,
  baseUrl?: string,
  llmApiKey?: string,
  llmModel?: string,
  llmTemperature?: number,
  llmTopP?: number, 
  onClose: () => void,
  buttonPosition: { x: number, y: number } | null 
}) => {
  const [messages, setMessages] = useState<Array<{ text: string, sender: string }>>([]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initial analysis when component mounts
  useEffect(() => {
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
            userMessage: "analyze", // Special flag to just analyze the code
            apiKey: apiKey,
            baseUrl: baseUrl,
            llmApiKey: llmApiKey,
            llmModel: llmModel,
            llmTemperature: llmTemperature,
            llmTopP: llmTopP,
            mode: "analyze" // Tell the API we're just loading context
          }),
        });
        
        setIsAnalyzing(false);
        
        if (response.ok) {
          // After analysis is complete, show the greeting message
          setMessages([{ text: "How can I help you with this problem?", sender: "ai" }]);
        } else {
          setMessages([{ 
            text: "Failed to analyze your code. Please make sure you have entered a valid API Key in the Settings page.", 
            sender: "ai" 
          }]);
          setShowQuickQuestions(false);
        }
      } catch (error) {
        setIsAnalyzing(false);
        setMessages([{ 
          text: "Failed to analyze your code. Please make sure you have entered a valid API Key in the Settings page.", 
          sender: "ai" 
        }]);
        setShowQuickQuestions(false);
      }
    };
    
    analyzeCode();
  }, [problem, editorContent, apiKey, baseUrl, llmApiKey, llmModel, llmTemperature, llmTopP]);

  useEffect(() => {
    hljs.highlightAll();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Hide quick questions after first user message
  useEffect(() => {
    if (messages.length > 1 && showQuickQuestions) {
      setShowQuickQuestions(false);
    }
  }, [messages.length, showQuickQuestions]);

  const sendMessage = async (initialMessage = "") => {
    const userMessage = { text: initialMessage || input, sender: "user" };
    if (initialMessage === "") setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowQuickQuestions(false); // Hide quick questions once a message is sent

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
          userMessage: initialMessage || input,
          apiKey: apiKey,
          baseUrl: baseUrl,
          llmApiKey: llmApiKey,
          llmModel: llmModel,
          llmTemperature: llmTemperature,
          llmTopP: llmTopP,
          mode: "chat" // Specify we're in chat mode now
        }),
      });

      setIsTyping(false);
      
      if (response.ok) {
        const data = await response.json();
        const aiMessage = { text: data.message, sender: "ai" };
        setMessages(prevMessages => initialMessage ? [...prevMessages, userMessage, aiMessage] : [...prevMessages, aiMessage]);
      } else {
        const errorMessage = { text: "Failed to get response from AI. Please make sure you have entered a valid API Key in the Settings page, and that you have credits in your OpenAI account.", sender: "ai" };
        setMessages(prevMessages => initialMessage ? [...prevMessages, userMessage, errorMessage] : [...prevMessages, errorMessage]);
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage = { text: "Failed to get response from AI. Please make sure you have entered a valid API Key in the Settings page, and that you have credits in your OpenAI account.", sender: "ai" };
      setMessages(prevMessages => initialMessage ? [...prevMessages, userMessage, errorMessage] : [...prevMessages, errorMessage]);
    }
  };

  const renderMessage = (msg: { text: string, sender: string }, index: number) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = msg.text.split(codeRegex);

    return (
      <div key={index} className={`message ${msg.sender} animate-fade-in my-2 p-3 rounded-lg ${
        msg.sender === "ai" 
          ? "bg-[#343B4A] text-primary border-l-2 border-blue-400" 
          : "bg-gradient-to-r from-[#0891b2] to-[#2563eb] text-primary"
      }`}>
        {parts.map((part, i) => {
          if (i % 3 === 2) {
            const language = parts[i - 1] || 'plaintext';
            return (
              <pre key={i} className="mt-2 rounded-md p-0 overflow-auto">
                <code className={`language-${language} p-2 block`}>{part}</code>
              </pre>
            );
          }
          return part && <p key={i} className="whitespace-pre-wrap">{part}</p>;
        })}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage();
    }
  };

  // Quick questions to show as suggestion buttons
  const quickQuestions = [
    "Is my solution correct?",
    "Are there edge cases my code is missing?"
  ];

  // Calculate position based on button location
  const chatStyle = buttonPosition ? {
    bottom: `calc(100vh - ${buttonPosition.y}px + 16px)`,
    right: '16px',
    transform: 'translateY(0)',
    opacity: 1
  } : {};

  return (
    <div 
      ref={chatContainerRef}
      className="fixed z-30 w-96 h-[450px] rounded-lg shadow-2xl flex flex-col overflow-hidden chat-animation"
      style={{
        ...chatStyle,
        background: 'linear-gradient(to bottom, #343B4A, #2A303C)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#3A4253] text-primary">
        <div className="flex items-center">
          <span className="material-icons mr-2" style={{ fontSize: '20px' }}>auto_awesome</span>
          <h3 className="font-medium">AI Assistant</h3>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4 bg-[#2A303C]/60">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="analysis-animation mb-4">
              <div className="code-block">
                <div className="code-lines">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <div className="scanner"></div>
              </div>
            </div>
            <div className="text-primary text-lg font-medium">Analyzing your code...</div>
            <div className="text-[#B0B7C3] mt-2 text-sm">Preparing AI assistant</div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => renderMessage(msg, index))}
            
            {/* Quick question buttons */}
            {showQuickQuestions && messages.length === 1 && messages[0].sender === 'ai' && (
              <div className="quick-questions-container mt-4 space-y-2 animate-fade-in">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(question)}
                    className="w-full text-left p-2.5 rounded-md bg-[#3A4253] hover:bg-[#4A5267] text-primary text-sm font-medium transition-colors flex items-center"
                  >
                    <span className="material-icons mr-2 text-blue-300" style={{ fontSize: '18px' }}>
                      help_outline
                    </span>
                    {question}
                  </button>
                ))}
              </div>
            )}
            
            {isTyping && (
              <div className="my-2 p-3 rounded-lg bg-[#343B4A] text-primary border-l-2 border-blue-400 animate-pulse">
                <div className="flex items-center">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="ml-2 text-sm opacity-80">AI is thinking...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#343B4A] border-t border-[#4A5267]">
        <div className="flex rounded-lg border border-[#4A5267] bg-[#2A303C] overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            className="flex-1 px-4 py-2 bg-transparent text-primary outline-none placeholder:text-[#B0B7C3]"
            disabled={isAnalyzing || isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isAnalyzing || isTyping}
            className={`px-4 flex items-center justify-center ${
              input.trim() && !isTyping && !isAnalyzing
                ? 'text-primary hover:bg-[#4A5267]' 
                : 'text-[#B0B7C3] cursor-not-allowed'
            } transition-colors`}
          >
            <span className="material-icons transform rotate-90">send</span>
          </button>
        </div>
      </form>

      {/* CSS for typing indicator and animations */}
      <style jsx>{`
        .chat-animation {
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes popIn {
          0% {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: #B0B7C3;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
        
        .message {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .message.ai::before {
          content: "";
          position: absolute;
          top: 10px;
          left: -6px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #343B4A;
        }
        
        .message.user::after {
          content: "";
          position: absolute;
          top: 10px;
          right: -6px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 6px solid #0891b2;
        }
        
        /* Code analysis animation */
        .analysis-animation {
          width: 200px;
          height: 120px;
          position: relative;
        }
        
        .code-block {
          position: relative;
          width: 100%;
          height: 100%;
          background: #232830;
          border-radius: 8px;
          overflow: hidden;
          padding: 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        
        .code-lines {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .code-lines div {
          height: 10px;
          background: #343B4A;
          border-radius: 2px;
          opacity: 0.7;
        }
        
        .code-lines div:nth-child(1) { width: 100%; }
        .code-lines div:nth-child(2) { width: 85%; }
        .code-lines div:nth-child(3) { width: 65%; }
        .code-lines div:nth-child(4) { width: 90%; }
        .code-lines div:nth-child(5) { width: 75%; }
        
        .scanner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, 
            rgba(6, 182, 212, 0.1), 
            rgba(6, 182, 212, 0.8),
            rgba(59, 130, 246, 0.8),
            rgba(59, 130, 246, 0.1)
          );
          animation: scan 1.5s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.7);
        }
        
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 4px); }
          100% { top: 0; }
        }
        
        /* Quick questions container */
        .quick-questions-container {
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        
        .quick-questions-container button {
          position: relative;
          overflow: hidden;
        }
        
        .quick-questions-container button::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transition: left 0.5s ease-in-out;
        }
        
        .quick-questions-container button:hover::after {
          left: 100%;
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
