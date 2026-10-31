import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel, Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useRef } from 'react';
import { Bug as BugIcon } from 'lucide-react';
import { useForm } from '@formspree/react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_ISSUES_URL = 'https://github.com/hussiiii/Repcode/issues/';

const ReportBugModal = ({ isOpen, onClose }: ReportBugModalProps) => {
  const { toast: showToast } = useToast(5000);
  const [state, handleSubmit, reset] = useForm("xkndvdrp"); // Using same Formspree form as ContactForm
  const closeRef = useRef(onClose);
  const resetRef = useRef(reset);
  closeRef.current = onClose;
  resetRef.current = reset;
  useEffect(() => { if (!isOpen) resetRef.current?.(); }, [isOpen]);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    type: 'bug'
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Custom form submission handler to include user email
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.submitting || !formData.description.trim()) return;

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
    if (isOpen && state.succeeded) {
      setFormData({
        description: '',
        type: 'bug'
      });
      showToast('Bug report submitted! Thank you.');
      const timer = setTimeout(() => {
        closeRef.current();
      }, 2000); // Close modal after showing success message
      return () => clearTimeout(timer);
    }
  }, [state.succeeded, isOpen, showToast]);

  // Show error toast if submission fails
  useEffect(() => {
    if (isOpen && state.errors) {
      showToast('Submission failed. Please try again.');
    }
  }, [state.errors, isOpen, showToast]);

  return (
    <>
      {/* Modal Backdrop */}

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent dismissible={!state.submitting}>
        {/* Decorative accent line at top */}
        <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end"></div>
        <div className="p-6 relative">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <DialogTitle className="text-center w-full">Report a Bug</DialogTitle>
            <Button variant="close" className="absolute top-0 right-0" aria-label="Close dialog" disabled={state.submitting}
              onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <div className="space-y-5 relative z-10">
            <p className="text-foreground-soft text-sm">
              Please describe the bug you encountered. You can also check the <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer" className="text-app-highlight underline">GitHub Issues page</a> to see if it has already been reported.
            </p>
            <p className="text-foreground-quiet text-xs">
              Your email ({user?.email}) will be included automatically so we can follow up with you.
            </p>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <Field>
                <FieldLabel variant="report" >Bug Description <span className="text-difficulty-hard">*</span></FieldLabel>
                <Textarea variant="report" className="w-full" minSize="report"
                  name="description"
                  placeholder="Describe the bug in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Field>

              {/* Hidden field to identify this as a bug report */}
              <input type="hidden" name="type" value={formData.type} />

              <div className="flex justify-end pt-4">
                <Button variant="dialog" size="dialog" emphasis="dialog" loading={state.submitting}
                  type="submit"
                  disabled={!formData.description.trim() || state.submitting}>
                  {state.submitting ? (
                    <>
                      <Spinner variant="button" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Bug Report'
                  )}
                  <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportBugModal;
