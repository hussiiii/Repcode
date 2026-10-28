// Toast.tsx
import React from 'react';
import '../../app/globals.css';

const Toast = ({ message, isVisible }: { message: any; isVisible: any }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative overflow-hidden bg-surface border border-border rounded-xl shadow-[0_10px_40px_rgb(var(--overlay)/0.3)] text-foreground animate-toastEnter max-w-full sm:max-w-md">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-app-action-start to-app-action-end"></div>
        
        {/* Toast content */}
        <div className="px-6 py-4 relative">
          <div className="text-sm font-medium">
            {message}
          </div>
        </div>
        
        {/* Subtle bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-action-end/30 to-transparent"></div>
      </div>
    </div>
  );
};

export default Toast;
