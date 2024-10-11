"use client";

import privateRoute from "@/hooks/privateRoute";
import Image from "next/image";
import horizontalLogo from "@/assets/breaktime-logo-horizontal.svg";
import Link from "next/link";
import { DataContextProvider } from "@/contexts/data/DataContextProvider";
import UserMenu from "@/components/UserMenu";
import { useUser } from "@/contexts/user/UserContext";

const NavItem = ({ label, href }: { label: string; href: string }) => {
  return (
    <li>
      <Link href={href}>{label}</Link>
    </li>
  );
};

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = useUser();
  return (
    <DataContextProvider>
      <div className="h-screen flex flex-col">
        <header className="p-4">
          <nav className="flex gap-8 items-center">
            <Image
              src={horizontalLogo}
              width={300}
              height={200}
              alt="logo"
              className="w-24"
            />
            <ul className="flex items-center gap-4">
              <NavItem label="Home" href="/app/dashboard" />
              <NavItem label="Home" href="/app/dashboard" />
              <NavItem label="Home" href="/app/dashboard" />
            </ul>
            <div className="ml-auto">
              {currentUser && <UserMenu user={currentUser} />}
            </div>
          </nav>
        </header>
        <div className="container p-4 mx-auto grow flex flex-col">
          {children}
        </div>
      </div>
    </DataContextProvider>
  );
}

export default privateRoute(AppLayout);
