import { Heading } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
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

    if (error) return <Alert variant="plain">Error: {(error as Error).message}</Alert>;
    if (isLoading || !data) {
        return (
            <div className="flex justify-center items-center h-screen h-full">
                <LoadingState variant="legacy" />
            </div>
        );
    }

    return (
      <>
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 p-8">
          <Card surface="profile" radius="md" border="none" padding="2xl" elevation="none" foreground className="w-full md:w-1/2">
              <Heading as="h2" size="2xl" weight="bold">Account Information</Heading>
              <p className="text-muted-foreground mb-8 text-sm">View your account information</p>
              <div className="flex items-center mb-4">
                  <Avatar variant="profile" className="mb-6">
                      <AvatarImage src="/default_avatar.jpg" alt="Avatar" />
                      <AvatarFallback role="img" aria-label="Avatar">{user?.email?.slice(0, 1).toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                      <p className="text-muted-foreground"><span className="material-icons text-muted-foreground mr-1" style={{ fontSize: '15px' }}>mail</span>{user?.email}</p>
                  </div>
              </div>
              <p className="text-muted-foreground">Membership Type</p>
              <p className={`font-bold ${getMembershipClass(data?.membershipType)}`}>{data?.membershipType.toUpperCase()}</p>
          </Card>

          <Card surface="profile" radius="md" border="none" padding="2xl" elevation="none" foreground className="w-full md:w-1/2">
              <Heading as="h2" size="2xl" weight="bold">Billing Information</Heading>
              <p className="text-muted-foreground mb-14 text-sm">View your invoice and payment history</p>
              <p className="text-muted-foreground mb-4">Repcode is currently completely FREE to use! Even if we add pricing in the future, your Lifetime status will never be revoked. Thanks for being a beta tester!</p>
              <Button variant="billing" size="dialog"
                  onClick={() => window.open('https://billing.stripe.com/p/login/bIY4gj80X3Q93LO5kk', '_blank')}
                  disabled={data?.membershipType !== 'pro'}
              >
                  View Full History
              </Button>
          </Card>
      </div>
      </>
  );
};

export default Profile;
