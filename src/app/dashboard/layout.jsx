"use client"; // This is crucial for the Account component to work

import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";

export default function Layout({ children }) {
  return (
    <DashboardLayout>
      <PageContainer>{children}</PageContainer>
    </DashboardLayout>
  );
}