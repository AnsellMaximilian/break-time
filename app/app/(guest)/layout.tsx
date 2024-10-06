"use client";

import publicRoute from "@/hooks/publicRoute";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-screen flex overflow-hidden">{children}</div>;
}

export default publicRoute(Layout);
