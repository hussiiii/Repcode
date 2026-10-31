import { Toaster } from '@/components/ui/toast';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../auth/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SidebarProvider } from '../auth/SidebarContext';
import Router from 'next/router';
import NProgress from 'nprogress';
import '../styles/globals.css';
import 'nprogress/nprogress.css';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
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
          <div className={inter.className}>
          <style jsx global>{`body { font-family: ${inter.style.fontFamily}; }`}</style>
          <Component {...pageProps} />
          <Toaster />
          </div>
          <Analytics />
        </AuthProvider>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;
