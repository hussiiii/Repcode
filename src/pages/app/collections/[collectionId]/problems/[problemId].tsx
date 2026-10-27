import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext } from 'react';
import '../../../../../app/globals.css'; 
import SideBar from '@/components/app/SideBar';
import nookies from "nookies"; 
import firebaseAdmin from "../../../../../../firebaseAdmin";
import Problem from '@/components/app/Problem';
import { AuthContext } from '@/auth/AuthContext';
import { useQuery } from 'react-query';
import VideoModal from '@/components/app/VideoModal';

const ProblemDetailPage = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { collectionId, problemId } = router.query;

  const [contentActive, setContentActive] = useState('question');
  const [editorContent, setEditorContent] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // to get the user ID to verify that user can only access problems they have created 
  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

  const fetchCollectionDetails = async (collectionId:any) => {
    if (!collectionId) return null; // Guard clause to ensure collectionId is not undefined
    const response = await authenticatedFetch(`/api/getCollectionDetails?collectionId=${collectionId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };
  
  const fetchProblemDetails = async (problemId: any, userId: any) => {
    if (!problemId || !userId) return null; // Guard clause to ensure problemId and userId are not undefined
    const response = await authenticatedFetch(`/api/getProblemDetails?problemId=${problemId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  const { 
    isLoading: isLoadingUser, 
    data: currentUser, 
    error: userError, 
  } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user, 
  })


  const {
    data: collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useQuery(['collectionDetails', collectionId], () => fetchCollectionDetails(collectionId), {
    enabled: !!collectionId,
  });

  const {
    data: problem,
    isLoading: isLoadingProblem,
    error: problemError,
  } = useQuery(
    ['problemDetails', problemId, currentUser?.id],
    () => fetchProblemDetails(problemId, currentUser.id),
    {
      enabled: !!problemId && !!currentUser,
    }
  );

  return (
    <div className="flex min-h-screen h-screen max-h-screen overflow-hidden bg-[#2A303C]">
      <SideBar />
      <div className="flex-1 overflow-hidden">
        {isLoadingCollection || isLoadingProblem || isLoadingUser ? (
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
                
                {/* Inner circle with logo or icon */}
                
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
        ) : collectionError || problemError || userError ? (
          <div className="text-primary p-8">Error: {(collectionError as Error || problemError as Error || userError as Error).message}</div>
        ) : (
          <>
            <VideoModal
              isOpen={isVideoModalOpen}
              onClose={() => setIsVideoModalOpen(false)}
              videoId="5wKetDFAki4"
            />

            <Problem
              problem={problem}
              contentActive={contentActive}
              setContentActive={setContentActive}
              editorContent={editorContent}
              setEditorContent={setEditorContent}
            />
          </>
        )}
      </div>
    </div>
  );
}

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

export default ProblemDetailPage;
