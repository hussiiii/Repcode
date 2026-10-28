import React, { useState, forwardRef } from 'react';
import ReportBugModal from './ReportBugModal';
import { Bug as BugIcon } from 'lucide-react';

const ReportBugButton = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        ref={ref as any}
        type={'button'}
        onClick={() => setIsOpen(true)}
        {...props}
        className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-lg transition-all duration-200 text-sm font-medium mt-2
          ${isOpen
            ? 'bg-gradient-to-r from-app-action-start to-app-action-end text-foreground shadow-md'
            : 'bg-transparent text-app-highlight hover:bg-surface-report-bug/60 hover:text-foreground'}
        `}
      >
        <BugIcon size={18} className="mr-2" />
        Report Bug
      </button>
      <ReportBugModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
});
ReportBugButton.displayName = 'ReportBugButton';

export default ReportBugButton;
