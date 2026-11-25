import React from "react";
import AppHeader from "./_components/AppHeader";
import { SiteFooter } from "@/app/_component/SiteFooter";

function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6 md:py-10">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}

export default DashboardLayout;
