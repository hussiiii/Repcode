import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useState, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import Link from 'next/link';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const fetchUserSettings = async () => {
        if (!user) throw new Error("No user found");
        const response = await authenticatedFetch(`/api/getUserSettings`);
        if (!response.ok) throw new Error("Failed to fetch user settings");
        return response.json();
    };

    const { isLoading, data, error } = useQuery(['userSettings', user?.email], fetchUserSettings, {
        enabled: !!user, 
    });

    const getMembershipClass = (membershipType: string) => {
        switch (membershipType) {
            case 'pro':
                return 'text-status-warning';
            case 'lifetime':
                return 'text-study-new';
            case 'free':
                return 'text-foreground';
            default:
                return '';
        }
    };

    if (error) return <div>Error: {(error as Error).message}</div>;
    if (isLoading || !data) {
        return (
            <div className="flex justify-center items-center h-screen h-full">
                <div role="status">
                    <svg
                        aria-hidden="true"
                        className="w-12 h-12 text-background animate-spin dark:text-background fill-action"
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
        );
    }

    return (
      <>
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 p-8">
          <div className="bg-surface-profile text-foreground p-8 rounded-md w-full md:w-1/2">
              <h2 className="text-2xl font-bold">Account Information</h2>
              <p className="text-muted-foreground mb-8 text-sm">View your account information</p>
              <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-6">
                      <img src="/default_avatar.jpg" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4">
                      <p className="text-muted-foreground"><span className="material-icons text-muted-foreground mr-1" style={{ fontSize: '15px' }}>mail</span>{user?.email}</p>
                  </div>
              </div>
              <p className="text-muted-foreground">Membership Type</p>
              <p className={`font-bold ${getMembershipClass(data?.membershipType)}`}>{data?.membershipType.toUpperCase()}</p>
          </div>

          <div className="bg-surface-profile text-foreground p-8 rounded-md w-full md:w-1/2">
              <h2 className="text-2xl font-bold">Billing Information</h2>
              <p className="text-muted-foreground mb-14 text-sm">View your invoice and payment history</p>
              <p className="text-muted-foreground mb-4">Repcode is currently completely FREE to use! Even if we add pricing in the future, your Lifetime status will never be revoked. Thanks for being a beta tester!</p>
              <button 
                  onClick={() => window.open('https://billing.stripe.com/p/login/bIY4gj80X3Q93LO5kk', '_blank')} 
                  className={`font-medium py-2 px-6 rounded-md transition ease-in-out duration-150 ${data?.membershipType !== 'pro' ? 'bg-control-disabled text-control-disabled-foreground cursor-not-allowed' : 'bg-action text-foreground'}`}
                  disabled={data?.membershipType !== 'pro'}
              >
                  View Full History
              </button>
          </div>
      </div>
      </>
  );
};

export default Profile;
