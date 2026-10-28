import { useRouter } from 'next/router';
import React from 'react';
import "../../../app/globals.css"; 
import SideBar from '@/components/app/SideBar';
import nookies from "nookies"; 
import firebaseAdmin from "../../../../firebaseAdmin"; 
import Settings from '@/components/app/Settings';
import Link from 'next/link';

const UserSettingsPage = () => {
  const router = useRouter(); 

  return ( 
    <div className="flex min-h-screen bg-background">
      <SideBar />
      <div className="flex-1 transition-all duration-300">
        <div className="p-6 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                Settings
              </h1>
              <p className="text-muted-foreground text-lg">
                Configure your study preferences and algorithm settings
              </p>
            </header>

            <div className="flex items-start bg-surface/50 p-4 rounded-lg border border-status-attention/20 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-attention mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-sm text-muted-foreground">
                For most users, the default algorithm settings should be the
                most optimal and don&apos;t need to be adjusted. If you want to learn more
                about these settings, check out our comprehensive{' '}
                <Link
                  className="text-study-new underline"
                  href="/guide"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Guide
                </Link>.
              </p>
            </div>

            <Settings />
          </div>
        </div>
      </div>
    </div>
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

export default UserSettingsPage;
