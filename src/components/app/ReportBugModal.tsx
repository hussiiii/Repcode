import React, { useState, useEffect } from 'react';
import { Bug as BugIcon } from 'lucide-react';
import { useForm } from '@formspree/react';
import { useAuth } from '../../auth/useAuth';
import Toast from './Toast';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_ISSUES_URL = 'https://github.com/hussiiii/Repcode/issues/';

const ReportBugModal = ({ isOpen, onClose }: ReportBugModalProps) => {
  const [state, handleSubmit] = useForm("xkndvdrp"); // Using same Formspree form as ContactForm
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    type: 'bug'
  });
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Custom form submission handler to include user email
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      email: user?.email || ""
    };
    
    const formDataToSubmit = new FormData();
    
    Object.entries(submitData).forEach(([key, value]) => {
      formDataToSubmit.append(key, value);
    });
    
    handleSubmit(submitData);
  };

  // Reset form after success and show toast
  useEffect(() => {
    if (state.succeeded) {
      setFormData({
        description: '',
        type: 'bug'
      });
      showToast('Bug report submitted! Thank you.');
      setTimeout(() => {
        onClose();
      }, 2000); // Close modal after showing success message
    }
  }, [state.succeeded, onClose]);

  // Show error toast if submission fails
  useEffect(() => {
    if (state.errors) {
      showToast('Submission failed. Please try again.');
    }
  }, [state.errors]);

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
            <p className="text-gray-400 text-xs">
              Your email ({user?.email}) will be included automatically so we can follow up with you.
            </p>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Bug Description <span className="text-hard">*</span></label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full px-3 py-2 bg-[#1E232C] rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all duration-200 text-primary min-h-[80px]"
                  placeholder="Describe the bug in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Hidden field to identify this as a bug report */}
              <input type="hidden" name="type" value={formData.type} />
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={!formData.description.trim() || state.submitting}
                  className={`relative overflow-hidden bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0ea5c4] hover:to-[#2d74e7] text-primary shadow-md transition-all duration-200 py-2 px-6 rounded-md ${(!formData.description.trim() || state.submitting) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {state.submitting ? (
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
