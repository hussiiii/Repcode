import React from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background bg-opacity-75 flex items-center justify-center z-50">
      {/* Modal Container */}
      <div className="relative bg-surface-video rounded-lg shadow-xl w-[90%] max-w-4xl p-8">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground hover:text-muted-foreground transition-colors duration-200"
        >
          <span className="material-icons text-3xl">close</span>
        </button>

        {/* Video Container with 16:9 aspect ratio */}
        <div className="relative pt-[56.25%] mt-4">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModal; 