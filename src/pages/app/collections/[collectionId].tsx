import React from 'react';
import { useRouter } from 'next/router';
import ProblemsList from '../../../components/app/ProblemsList'; 
import { AppShell } from '@/components/layout/app-shell';
import nookies from "nookies"; 
import firebaseAdmin from "../../../../firebaseAdmin"; 

const CollectionPage = () => {
  const router = useRouter();
  const { collectionId } = router.query;

  return (
    <>
      <AppShell>
        <div className="flex-1 transition-all duration-300">
          <div className="p-6">
            <ProblemsList collectionId={collectionId} />
          </div>
        </div>
      </AppShell>
    </>
  );
};

export async function getServerSideProps(context:any) {
  try {
    const cookies = nookies.get(context);
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
    
    return {
      props: {},
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}

export default CollectionPage;
