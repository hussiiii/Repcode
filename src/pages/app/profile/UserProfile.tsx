import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext } from 'react';
import "../../../app/globals.css"; 
import SideBar from '@/components/app/SideBar';
import nookies from "nookies"; 
import firebaseAdmin from "../../../../firebaseAdmin"; 
import Profile from '@/components/app/Profile';

const UserProfilePage = () => {
  const router = useRouter(); 

  return ( 
    <div className="flex min-h-screen bg-background">
      <SideBar />
      <div className="flex-1 overflow-x-hidden">
      <div className="flex-grow p-8">
        <div className="text-foreground text-4xl font-bold mb-4 flex justify-center">Profile and Billing</div>
        <hr className="border-border mb-8 transition-width duration-300"/>
        <Profile />

      </div>
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


export default UserProfilePage;
