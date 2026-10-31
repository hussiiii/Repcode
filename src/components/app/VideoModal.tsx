import { MediaFrame } from '@/components/ui/media-frame';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoId }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      {/* Modal Container */}
      <DialogContent variant="video" size="lg">
        <DialogTitle className="sr-only">Video tutorial</DialogTitle>
        {/* Close Button */}
        <Button variant="icon" className="absolute top-4 right-4" tone="video" aria-label="Close video"
          onClick={onClose}>
          <span className="material-icons text-3xl">close</span>
        </Button>

        {/* Video Container with 16:9 aspect ratio */}
        <MediaFrame className="mt-4">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
</MediaFrame>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
