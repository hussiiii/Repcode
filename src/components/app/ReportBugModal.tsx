import React, { useState } from 'react';
import { Bug as BugIcon } from 'lucide-react';
import Toast from './Toast';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_ISSUES_URL = 'https://github.com/hussiiii/Repcode/issues/';

const ReportBugModal = ({ isOpen, onClose }: ReportBugModalProps) => {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forminator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          description,
          type: 'bug',
        }),
      });
      if (!response.ok) throw new Error('Failed to submit bug report');
      showToast('Bug report submitted! Thank you.');
      setEmail('');
      setDescription('');
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 bg-gradient-to-b from-[#2A303C] to-[#252B38] border border-[#3A4150]/50 text-primary overflow-hidden ${isOpen ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-[40%] pointer-events-none"}`}
      >
        {/* Decorative accent line at top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]"></div>
        <div className="p-6 relative">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-xl font-semibold tracking-tight text-primary text-center w-full">Report a Bug</h2>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 h-8 w-8 rounded-full hover:bg-[#3A4150]/70 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-5 relative z-10">
            <p className="text-gray-300 text-sm">
              Please describe the bug you encountered. You can also check the <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] underline">GitHub Issues page</a> to see if it has already been reported.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Your Email (optional)</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 bg-[#1E232C] rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all duration-200 text-primary h-11"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Bug Description <span className="text-hard">*</span></label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 bg-[#1E232C] rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all duration-200 text-primary min-h-[80px]"
                  placeholder="Describe the bug in detail..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={!description.trim() || isSubmitting}
                  className={`relative overflow-hidden bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0ea5c4] hover:to-[#2d74e7] text-primary shadow-md transition-all duration-200 py-2 px-6 rounded-md ${(!description.trim() || isSubmitting) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? (
                    <>
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Bug Report'
                  )}
                  <span className="absolute inset-0 w-full h-full bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
};

export default ReportBugModal;



// This component renders a modal for reporting bugs, allowing users to submit their email and a description of the bug.