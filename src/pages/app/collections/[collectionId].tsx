import React from 'react';
import { useRouter } from 'next/router';
import ProblemsList from '../../../components/app/ProblemsList'; 
import SideBar from '../../../components/app/SideBar'; 
import '../../../app/globals.css'; 
import nookies from "nookies"; 
import firebaseAdmin from "../../../../firebaseAdmin"; 

const CollectionPage = () => {
  const router = useRouter();
  const { collectionId } = router.query;

  return (
    <>
      <div className="flex min-h-screen bg-background">
        <SideBar /> 
        <div className="flex-1 transition-all duration-300">
          <div className="p-6">
            <ProblemsList collectionId={collectionId} />
          </div>
        </div>
      </div>
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