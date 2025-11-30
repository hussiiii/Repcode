// Entry point for the actual app, once user successfully logs in 

import React, { useEffect, useState, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import { AuthContext } from "@/auth/AuthContext"; 
import CollectionCards from '../../components/app/CollectionCards';
import SideBar from '../../components/app/SideBar'; 
import '../../app/globals.css'; 
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
    const response = await fetch(`/api/getUserStatus?userEmail=${user.email}`);
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
      await fetch('/api/updateNewUserStatus', {
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

  const handleNewCollection = () => {
    // This will trigger the CollectionCards component to open the modal
    document.getElementById('add-collection-button')?.click();
  };

  return (
    <>
      <FirstTimeLogIn isOpen={isModalOpen} onClose={handleCloseModal} />
      <RandomProblemModal 
        isOpen={isRandomProblemModalOpen} 
        onClose={() => setIsRandomProblemModalOpen(false)} 
      />
      <div className="flex min-h-screen bg-[#2A303C] transition-width duration-300"> 
        <SideBar /> 
        <div className="flex-1 transition-all duration-300">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="max-w-6xl mx-auto">
              <header className="mb-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                    Your Collections
                  </h1>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsRandomProblemModalOpen(true)}
                      className="flex items-center px-4 py-2 bg-[#343B4A] hover:bg-[#3F475A] border border-[#3A4253] hover:border-[#4A5267] text-primary rounded-lg transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                        <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                      </svg>
                      <span>Solve Random Problem</span>
                    </button>
                    <button 
                      onClick={handleNewCollection}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0891b2] hover:to-[#2563eb] text-primary rounded-lg transition-all duration-200"
                      style={{ 
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)'}
                      onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v8"></path>
                        <path d="M8 12h8"></path>
                      </svg>
                      <span>New Collection</span>
                    </button>
                  </div>
                </div>
                <p className="text-[#B0B7C3] mt-2 text-lg">
                  Organize and manage your problem sets
                </p>
              </header>
              
              <main>
                {/* Collection Cards */}
                <CollectionCards />
                
                {/* Hidden button for the CollectionCards component to reference */}
                <button 
                  id="add-collection-button" 
                  className="hidden"
                  aria-hidden="true"
                />
              </main>
            </div>
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

