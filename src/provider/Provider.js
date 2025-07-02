"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";

import theme from "@/theme/theme";
import { BRAND, NAVIGATION } from "@/components/appbar/AppBar";
import { Account } from "@/components/appbar/Account";

export default function Provider({ children }) {
  return (
    <AppRouterCacheProvider>
      <NextAppProvider navigation={NAVIGATION} theme={theme} branding={BRAND}>
        <DashboardLayout
        slots={{toolbarActions: Account}}
        >
          <PageContainer>{children}</PageContainer>
        </DashboardLayout>
      </NextAppProvider>
    </AppRouterCacheProvider>
  );
}
