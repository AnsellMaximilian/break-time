"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types";
import { useUser } from "@/contexts/user/UserContext";
import Link from "next/link";
import { getFileUrl } from "@/utils/files";
export default function UserMenu({ user }: { user: User }) {
  const { logout } = useUser();
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(
    null
  );

  useEffect(() => {
    (async () => {
      if (user.profile?.profilePictureCid) {
        const res = (await getFileUrl(
          user.profile.profilePictureCid
        )) as string;
        setProfilePictureURL(res);
      }
    })();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={profilePictureURL ?? ""} />
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/app/profile">Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
