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
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };

  const fetchCollectionDetails = async (collectionId:any) => {
    if (!collectionId) return null; // Guard clause to ensure collectionId is not undefined
    const response = await fetch(`/api/getCollectionDetails?collectionId=${collectionId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };
  
  const fetchProblemDetails = async (problemId: any, userId: any) => {
    if (!problemId || !userId) return null; // Guard clause to ensure problemId and userId are not undefined
    const response = await fetch(`/api/getProblemDetails?problemId=${problemId}&userId=${userId}`);
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
    <>
      <div className="flex min-h-screen h-auto max-h-screen overflow-hidden bg-base_100 transition-width duration-300">
        <SideBar />
        <div className="flex-grow p-8">
          {isLoadingCollection || isLoadingProblem || isLoadingUser ? (
            <div className="flex justify-center items-center h-full">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-12 h-12 text-base_100 animate-spin fill-load"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : collectionError || problemError || userError ? (
            <div>Error: {(collectionError as Error || problemError as Error || userError as Error).message}</div>
          ) : (
            <>
              <div className="text-primary text-4xl font-bold mb-4 flex justify-center">Collections/{collection.title}/{problem?.name}</div>
              <hr className="border-divide mb-8 transition-width duration-300"/>
              
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
    </>
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
