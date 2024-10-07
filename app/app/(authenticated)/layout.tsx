"use client";

import { UserContextProvider } from "@/contexts/user/UserContextProvider";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import privateRoute from "@/hooks/privateRoute";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="grow h-full">
        <ScrollArea className="h-full overflow-y-auto">{children}</ScrollArea>
      </div>
    </div>
  );
}

export default privateRoute(AppLayout);
