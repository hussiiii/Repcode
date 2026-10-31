import { Heading } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
// Entry point for the actual app, once user successfully logs in 

import React, { useEffect, useState, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import { AuthContext } from "@/auth/AuthContext"; 
import CollectionCards from '../../components/app/CollectionCards';
import { AppShell } from '@/components/layout/app-shell';
import firebaseAdmin from '../../../firebaseAdmin'; 
import nookies from "nookies"; 
import FirstTimeLogIn from '@/components/app/FirstTimeLogin';
import RandomProblemModal from '@/components/app/RandomProblemModal';
import { useQuery, useQueryClient } from 'react-query'; 

const Main = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRandomProblemModalOpen, setIsRandomProblemModalOpen] = useState(false);
  const { user } = useContext(AuthContext); 
  const queryClient = useQueryClient(); 

  const fetchUserStatus = async () => {
    if (!user) throw new Error("No user found");
    const response = await authenticatedFetch(`/api/getUserStatus`);
    if (!response.ok) throw new Error("Failed to fetch user status");
    return response.json();
  };

  const { data, error, isLoading } = useQuery(
    ['userStatus', user?.email],
    fetchUserStatus,
    {
      enabled: !!user, 
      onSuccess: (data) => {
        if (data.newUser) {
          setIsModalOpen(true);  // Open the modal if newUser is true
        }
      },
    }
  );

  const handleCloseModal = async () => {
    try {
      await authenticatedFetch('/api/updateNewUserStatus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: user?.email }), 
      });

      // Invalidate the cache after updating newUser status to false
      queryClient.invalidateQueries(['userStatus', user?.email]);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating newUser status:', error);
    }
  };

  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const handleNewCollection = () => setCreateCollectionOpen(true);

  return (
    <>
      <FirstTimeLogIn isOpen={isModalOpen} onClose={handleCloseModal} />
      <RandomProblemModal 
        isOpen={isRandomProblemModalOpen} 
        onClose={() => setIsRandomProblemModalOpen(false)} 
      />
      <AppShell className="transition-width duration-300">
        <div className="flex-1 transition-all duration-300">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="max-w-6xl mx-auto">
              <header className="mb-8">
                <div className="flex justify-between items-center">
                  <Heading as="h1" size="page" weight="bold" tone="foreground" className="tracking-tight">
                    Your Collections
                  </Heading>
                  <div className="flex gap-3">
                    <Button variant="quiet" size="action"
                      onClick={() => setIsRandomProblemModalOpen(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                        <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                      </svg>
                      <span>Solve Random Problem</span>
                    </Button>
                    <Button variant="action" size="action" emphasis="raised"
                      onClick={handleNewCollection}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v8"></path>
                        <path d="M8 12h8"></path>
                      </svg>
                      <span>New Collection</span>
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2 text-lg">
                  Organize and manage your problem sets
                </p>
              </header>
              
              <div>
                {/* Collection Cards */}
                <CollectionCards createOpen={createCollectionOpen} onCreateOpenChange={setCreateCollectionOpen} />
              </div>
            </div>
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

export default Main;

