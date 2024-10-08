"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user/UserContext";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import AddFriendForm from "./AddFriendForm";
import { useData } from "@/contexts/data/DataContext";
import FriendList from "./FriendList";
import { UserProfile } from "@/types";

export default function DashboardPage() {
  const { currentUser } = useUser();

  const [friends, setFriends] = useState<UserProfile[]>([]);

  return (
    <div>
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 border-border p-4 rounded-md shadow-sm border">
          <header className="flex justify-between items-center">
            <h2 className="font-semibold uppercase">Pinatas</h2>
            <Link
              href="/app/pinatas/create"
              className={buttonVariants({ size: "sm" })}
            >
              Create
            </Link>
          </header>
        </section>
        <section className="col-span-6 border-border p-4 rounded-md shadow-sm border">
          <h2 className="font-semibold uppercase">People&apos;s Pinatas</h2>
        </section>
        <section className="col-span-6 border-border p-4 rounded-md shadow-sm border space-y-8">
          <header className="flex justify-between items-center">
            <h2 className="font-semibold uppercase">Friends</h2>
            <span className="text-sm">
              ({currentUser?.profile ? currentUser.profile.friendIds.length : 0}
              )
            </span>
          </header>
          <FriendList friends={friends} setFriends={setFriends} />
          <AddFriendForm />
        </section>
      </div>
    </div>
  );
}
