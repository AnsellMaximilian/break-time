"use client";

import privateRoute from "@/hooks/privateRoute";
import Image from "next/image";
import horizontalLogo from "@/assets/breaktime-logo-horizontal.svg";
import Link from "next/link";

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
  return (
    <div className="h-screen">
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
          <div className="ml-auto">Profile bruh</div>
        </nav>
      </header>
      <div className="container p-4 mx-auto">{children}</div>
    </div>
  );
}

export default privateRoute(AppLayout);
