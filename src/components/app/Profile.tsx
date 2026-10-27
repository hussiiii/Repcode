import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useState, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import Link from 'next/link';
import Accordion from './Accordian';

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
                return 'text-warning';
            case 'lifetime':
                return 'text-new';
            case 'free':
                return 'text-primary';
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
                        className="w-12 h-12 text-base_100 animate-spin dark:text-base_100 fill-load"
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
          <div className="bg-[#1E1E20] text-primary p-8 rounded-md w-full md:w-1/2">
              <h2 className="text-2xl font-bold">Account Information</h2>
              <p className="text-secondary mb-8 text-sm">View your account information</p>
              <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-6">
                      <img src="/default_avatar.jpg" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4">
                      <p className="text-secondary"><span className="material-icons text-secondary mr-1" style={{ fontSize: '15px' }}>mail</span>{user?.email}</p>
                  </div>
              </div>
              <p className="text-secondary">Membership Type</p>
              <p className={`font-bold ${getMembershipClass(data?.membershipType)}`}>{data?.membershipType.toUpperCase()}</p>
          </div>

          <div className="bg-[#1E1E20] text-primary p-8 rounded-md w-full md:w-1/2">
              <h2 className="text-2xl font-bold">Billing Information</h2>
              <p className="text-secondary mb-14 text-sm">View your invoice and payment history</p>
              <p className="text-secondary mb-4">Repcode is currently completely FREE to use! Even if we add pricing in the future, your Lifetime status will never be revoked. Thanks for being a beta tester!</p>
              <button 
                  onClick={() => window.open('https://billing.stripe.com/p/login/bIY4gj80X3Q93LO5kk', '_blank')} 
                  className={`font-medium py-2 px-6 rounded-md transition ease-in-out duration-150 ${data?.membershipType !== 'pro' ? 'bg-disabled text-disabledText cursor-not-allowed' : 'bg-blue text-primary'}`}
                  disabled={data?.membershipType !== 'pro'}
              >
                  View Full History
              </button>
          </div>
      </div>
      {/* <div className="mt-8">
          <Accordion title="I purchased a membership yet my membership type is still showing as Free. What do I do?" content="Please contact repcode.io@gmail.com. Issues relating to payment/membership are given the highest priority, so we will get back to you very soon." />
          <Accordion title="How do I cancel if I've purchased a monthly membership?" content="Simply click the View button above and then enter the email associated with the account you purchased membership for to receive a link to that email that will take you to your billing portal, where you can then cancel your membership." />
          <Accordion title="How do I upgrade my membership type?" content="To upgrade your membership, go to repcode.io/pricing." />
      </div> */}
      </>
  );
};

export default Profile;