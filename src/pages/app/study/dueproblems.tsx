import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useEffect, useState, useContext } from 'react';
import "../../../app/globals.css"; 
import SideBar from '@/components/app/SideBar';
import nookies from "nookies"; 
import firebaseAdmin from "../../../../firebaseAdmin"; 
import ProblemsQueue from '@/components/app/ProblemsQueue';
import { AuthContext } from '@/auth/AuthContext';
import { useQuery } from 'react-query';
import VideoModal from '@/components/app/VideoModal';

const DueProblems = () => {
  const { user } = useContext(AuthContext);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const fetchDueTodayProblems = async () => {
    if (!user) throw new Error("No user found");
    const response = await authenticatedFetch(`/api/getAllProblemsFromUser`);
    if (!response.ok) throw new Error("Failed to fetch all problems");
    const data = await response.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    return data.filter((problem: any) => {
        const dueDate = new Date(problem.dueDate);
        return dueDate < today || (dueDate.getDate() === today.getDate() && dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear());
    }).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

  const {
    data: dueTodayProblems,
    isLoading: isLoadingProblems,
    error: problemsError,
    refetch, 
  } = useQuery(['dueTodayProblems', user?.email], fetchDueTodayProblems, {
    enabled: !!user,
  });

  const {
    data: userSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user,
  });

  return (
    <div className="flex min-h-screen h-screen max-h-screen overflow-hidden bg-[#2A303C]">
      <SideBar />
      <div className="flex-1 overflow-hidden">
        {isLoadingSettings || isLoadingProblems ? (
          <div className="flex justify-center items-center h-[80vh]">
            <div className="relative flex flex-col items-center">
              {/* Outer glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] blur-xl opacity-20 animate-pulse"></div>
              
              {/* Spinner container */}
              <div className="relative">
                {/* Gradient ring */}
                <div className="w-16 h-16 rounded-full border-2 border-transparent 
                                bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] opacity-20"></div>
                
                {/* Spinning gradient arc */}
                <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent 
                                rounded-full animate-spin duration-1000" 
                      style={{
                        borderTopColor: '#06b6d4',
                        borderRightColor: '#3b82f6',
                        animationDuration: '1s'
                      }}>
                </div>
              </div>
              
              {/* Loading text with shimmer effect */}
              <div className="mt-4 text-sm font-medium text-[#B0B7C3] relative overflow-hidden">
                <span>Loading</span>
                <span className="inline-flex overflow-hidden ml-1">
                  <span className="animate-ellipsis">.</span>
                  <span className="animate-ellipsis animation-delay-300">.</span>
                  <span className="animate-ellipsis animation-delay-600">.</span>
                </span>
              </div>
            </div>
          </div>
        ) : problemsError || settingsError ? (
          <div className="text-primary p-8">Error: {(problemsError as Error || settingsError as Error).message}</div>
        ) : (
          <>
            {/* <div className="flex items-start gap-3 p-4 mb-8 bg-[#ffd70015] border-l-4 border-[#ffd700] rounded">
                <span className="material-icons text-2xl text-[#ffd700] flex-shrink-0">warning</span>
                <div className="text-md text-secondary">
                  <strong>IMPORTANT:</strong> We have updated how Repcode renders problems to match Leetcode exactly, so existing problem statements will look incorrect. To fix this, please re-import the problem by clicking Edit, entering the problem number, and clicking Autofill (make sure to copy/paste your prior solution beforehand).{' '}
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsVideoModalOpen(true);
                    }} 
                    className="text-link hover:underline"
                  >
                    Watch this video for a quick walkthrough.
                  </a>
                  <span> I know this banner is annoying sorry, it will go away a few days from now</span>
                </div>
              </div> */}

              <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                videoId="5wKetDFAki4"
              />

              {dueTodayProblems && dueTodayProblems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6">
                  <div className="max-w-md mx-auto text-center">
                    {/* Icon */}
                    <div className="mb-6 relative">
                      <div className="w-20 h-20 mx-auto bg-tertiary rounded-2xl flex items-center justify-center relative overflow-hidden">
                        {/* Subtle gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0fb20c]/10 to-[#87cf3a]/5"></div>
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-success relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M20 6L9 17l-5-5"></path>
                         </svg>
                      </div>
                      {/* Floating dots decoration */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-success/30 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-[#87cf3a]/40 rounded-full animate-pulse animation-delay-300"></div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-primary mb-3">
                      🎉 All Caught Up!
                    </h3>
                    
                    {/* Message */}
                    <p className="text-secondary leading-relaxed mb-6">
                      Congratulations! You don&apos;t have any problems due today. Take a break or review some old problems to stay sharp.
                    </p>
                    
                    
                    {/* Decorative element */}
                    <div className="flex items-center justify-center space-x-1 opacity-50">
                      <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-[#87cf3a] rounded-full animate-pulse animation-delay-300"></div>
                      <div className="w-1 h-1 bg-success rounded-full animate-pulse animation-delay-600"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <ProblemsQueue
                  problems={dueTodayProblems}
                  userSettings={userSettings}
                  refetchProblems={refetch}
                />
              )}
            </>
          )}
      </div>
    </div>
  );
};

export async function getServerSideProps(context:any) {
  try {
    const cookies = nookies.get(context);
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
    
    // Optionally fetch more data for your page using token.uid or other identifiers

    // If the token is valid, return empty props (or props based on token/user data)
    return {
      props: {},
    };
  } catch (err) {
    // If token verification fails or token doesn't exist, redirect to sign-in page
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}

export default DueProblems;
