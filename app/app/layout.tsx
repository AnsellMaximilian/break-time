"use client";

import { UserContextProvider } from "@/contexts/user/UserContextProvider";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UserContextProvider>{children}</UserContextProvider>;
}

export default Layout;
