import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/ui/typography';
import { MediaFrame } from '@/components/ui/media-frame';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import Link from 'next/link';

const FirstTimeLogIn = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionSelect = (option: number) => {
    setSelectedOption(option);
  };

  const renderMessage = () => {
    switch (selectedOption) {
      case 0:
      case 1:
        return (
          <div className="text-muted-foreground">
            <p className="mb-6">No worries! Repcode actually works really well when you have little to no experience with Leetcode. To get the most out of Repcode and master Leetcode the quickest based on your experience level, please watch the short video on the right. It will teach how to use this platform in the most effective way possible.</p>
            <p className="mb-6">Later, whenever you get a chance, also check out the <Link className="text-app-highlight underline hover:text-app-action-end" href="/guide" target="_blank" rel="noopener noreferrer">guide</Link> page to learn how the spatial repetition algorithm works and to learn the nuances of this platform in more detail. </p>
            <p className="mb-6">Hope this platform can help you on your Leetcode journey in some small way :)</p>
            <p>Happy coding! 🚀</p>
          </div>
        );
      case 2:
        return (
          <div className="text-muted-foreground">
            <p className="mb-6">Great, looks like you&apos;re off to a good start! Repcode was designed to seamlessly integrate into existing workflows, so although you seem to already have the hang of things it can still help. To get the most out of Repcode and master Leetcode the quickest based on your experience level, please watch the short video on the right. It will teach how to use this platform in the most effective way possible.</p>
            <p className="mb-6">Later, whenever you get a chance, also check out the <Link className="text-app-highlight underline hover:text-app-action-end" href="/guide" target="_blank" rel="noopener noreferrer">guide</Link> page to learn how the spatial repetition algorithm works and to learn the nuances of this platform in more detail. </p>
            <p className="mb-6">Hope this platform can help you on your Leetcode journey in some small way :)</p>
            <p>Happy coding! 🚀</p>
          </div>
        );
      case 3:
        return (
          <div className="text-muted-foreground">
            <p className="mb-6">Oops! Unfortunately, you&apos;re in the wrong place. If you can solve almost any Leetcode problem with little to no help, this platform isn&apos;t for you. Seriously, you&apos;re good. Go apply to NASA or something. Better yet, you should look into competitive programming if you aren&apos;t already, you&apos;d probably be amazing at it.</p>
            <p>This is kinda awkward. Umm, well thank you for checking out the platform at least! Bye!</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}


      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent size={selectedOption !== null ? "xl" : "sm"} scroll="frame">
        {/* Decorative accent line at top */}
        <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end"></div>

        <ScrollArea direction="both" className="p-6 relative max-h-[calc(90vh-2px)]">

          <div className="text-left relative z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <DialogTitle>Welcome to Repcode!</DialogTitle>
              <Button variant="close" aria-label="Close dialog"
                onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {selectedOption === null && (
              <p className="mb-6 text-muted-foreground">Hi! Looks like this is your first time here, welcome! To get the most out of this application, please select your experience level with Leetcode:</p>
            )}

            {selectedOption === null ? (
              <div className="space-y-3">
                {["Um, Leetcode? What's that? 😶", "I've solved a few problems, but I'm nowhere near FAANG level 🥲", "I've solved hundreds of problems, and can solve most easy/mediums 😎", "I am an LLM that can solve any novel problem with 99% accuracy 🤖"].map((option, index) => (
                  <Button variant="choice" size="choice" className="w-full"
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* 2-Panel Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Panel - Text Content */}
                  <div className="flex-1">
                    {renderMessage()}
                  </div>

                  {/* Right Panel - YouTube Video */}
                  <div className="flex-1">
                    <Card surface="field" radius="lg" border="subtle" padding="md" elevation="none">
                      <Heading as="h4" size="lg" weight="semibold" tone="foreground" className="mb-4">Quick Platform Overview</Heading>
                      <MediaFrame>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-md"
                          src="https://www.youtube.com/embed/Hn4znv8I2a4"
                          title="Repcode Platform Overview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
</MediaFrame>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button variant="dialog" size="dialog" emphasis="dialog" weight="medium"
                    onClick={onClose}>
                    Sounds good!
                    <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default FirstTimeLogIn;
