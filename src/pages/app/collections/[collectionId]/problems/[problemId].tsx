import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/loading-state';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext } from 'react';
import { AppShell } from '@/components/layout/app-shell';
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
  useEffect(() => {
    setContentActive('question');
    setEditorContent('');
  }, [problemId]);

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
    <AppShell locked>
      <div className="flex-1 overflow-hidden">
        {isLoadingCollection || isLoadingProblem || isLoadingUser ? (
            <div className="flex justify-center items-center h-[80vh]">
            <LoadingState />
          </div>
        ) : collectionError || problemError || userError ? (
          <Alert variant="error">Error: {(collectionError as Error || problemError as Error || userError as Error).message}</Alert>
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
    </AppShell>
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
