"use client";

import * as React from 'react';
import { useSession, SessionProvider } from 'next-auth/react';

// MUI and Toolpad Imports
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Your App-Specific Imports
import theme from '@/theme/theme';
import { BRAND, NAVIGATION } from '@/components/appbar/AppBar';

/**
 * A wrapper component that contains the client-side logic for providers.
 * This needs to be a separate component because useSession is a client hook.
 */
function AppProviders({ children }) {
  // Get the real session and status from NextAuth
  const { data: session, status } = useSession();

  // Create the authentication object for Toolpad's sign-in/out buttons
  const authentication = React.useMemo(() => ({
    signIn: () => signIn(),
    signOut: () => signOut(),
  }), []);

  return (
    <AppRouterCacheProvider>
      <NextAppProvider
        navigation={NAVIGATION}
        theme={theme}
        branding={BRAND}
        session={session}
        sessionStatus={status}
        authentication={authentication}
      >
        {children}
      </NextAppProvider>
    </AppRouterCacheProvider>
  );
}

/**
 * The main provider component for your RootLayout.
 * It sets up the top-level contexts like SessionProvider and LocalizationProvider.
 */
export default function Providers({ children }) {
  return (
    <SessionProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AppProviders>{children}</AppProviders>
      </LocalizationProvider>
    </SessionProvider>
  );
}