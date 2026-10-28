import React from 'react';

const MoreInfo = () => {
  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-16"> {/* Adjusts the margin for different screen sizes */}
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-foreground">Your Path to <span className="text-brand">Leetcode Mastery</span></h1>
        <p className="text-lg text-muted-foreground mt-2">
          Each feature works together to empower you to review and analyze problems <br /> with ease, boosting your Leetcoding skills
        </p>
      </div>

      {/* Section 1: Image on the left, header and text on the right */}
      <div className="flex flex-col md:flex-row items-center justify-center py-10">
        <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0"> 
          <video className="max-w-full h-auto mx-auto rounded-xl border border-border" autoPlay loop muted>
            <source src="/video1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="w-full md:w-1/2 text-center md:text-left md:pl-5">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Organize and Customize Problems</h2>
          <p className="text-muted-foreground mt-4 md:mt-2 text-lg">No more excel spreadsheets! Use our friendly and intuitive UI to store, organize, and customize problems</p>
        </div>
      </div>

      {/* Section 2: Image on the right, header and text on the left */}
      <div className="flex flex-col md:flex-row-reverse items-center justify-center py-10">
        <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0"> 
          <video className="max-w-full h-auto mx-auto rounded-xl border border-border" autoPlay loop muted>
              <source src="/video2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
          </video>        
        </div>
        <div className="w-full md:w-1/2 text-center md:text-left md:pr-5">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Spatial Repitition Review</h2>
          <p className="text-muted-foreground mt-4 md:mt-2 text-lg">Each day, solve only the problems you need to so your brain learns new strategies and reinforces key concepts in the most effective way possible</p>
        </div>
      </div>

      {/* Section 3: Image on the left, header and text on the right */}
      <div className="flex flex-col md:flex-row items-center justify-center py-10">
        <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0">
          <video className="max-w-full h-auto mx-auto rounded-xl border border-border" autoPlay loop muted>
              <source src="/video3.mp4" type="video/mp4" />
              Your browser does not support the video tag.
          </video>   
        </div>
        <div className="w-full md:w-1/2 text-center md:text-left md:pl-5">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Check Your Code with AI</h2>
          <p className="text-muted-foreground mt-4 md:mt-2 text-lg">Receive immediate feedback on your solutions and get tips on how to improve and optimize your code</p>
        </div>
      </div>

      {/* Image at the bottom */}
      <div className="flex justify-center py-10">
        <img src="/cycle.png" alt="Cycle" className="w-full sm:w-1/3 md:w-full" /> 
      </div>

    </div>
  );
};

export default MoreInfo;
