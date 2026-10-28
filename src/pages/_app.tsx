import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../auth/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SidebarProvider } from '../auth/SidebarContext';
import { loadStripe } from '@stripe/stripe-js';
import Router from 'next/router';
import NProgress from 'nprogress';
import '../app/globals.css';
import 'nprogress/nprogress.css';
import '../styles/vendor-colors.css';
import { Analytics } from '@vercel/analytics/react'; 
import { Inter } from 'next/font/google'; 

NProgress.configure({ showSpinner: false });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, 
      refetchOnWindowFocus: false, 
      refetchOnMount: true, 
    },
  },
});

// const stripePromise = loadStripe("your-stripe-key-here"); 

const inter = Inter({
  subsets: ['latin'], 
  weight: '400', 
})

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleStop);
    Router.events.on('routeChangeError', handleStop);

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleStop);
      Router.events.off('routeChangeError', handleStop);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AuthProvider>
          <main className={inter.className}>
          <Component {...pageProps} />
          </main>
          <Analytics />
        </AuthProvider>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;
