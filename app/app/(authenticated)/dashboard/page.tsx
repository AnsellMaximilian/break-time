"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user/UserContext";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AddFriendForm from "./AddFriendForm";
import { useData } from "@/contexts/data/DataContext";
import FriendList from "./FriendList";
import { Pinata, UserProfile } from "@/types";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { getColorScheme } from "@/utils/colors";
import PinataCard from "@/components/PinataCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { currentUser } = useUser();

  const [friends, setFriends] = useState<UserProfile[]>([]);

  const [pinatas, setPinatas] = useState<Pinata[]>([]);

  const [pinatasLoading, setPinatasLoading] = useState(false);
  useEffect(() => {
    (async () => {
      if (currentUser) {
        setPinatasLoading(true);
        const pinatas = (
          await databases.listDocuments(
            config.dbId,
            config.pinataCollectionId,
            [Query.equal("userId", currentUser.$id), Query.limit(10)]
          )
        ).documents as Pinata[];

        setPinatas(pinatas);
      }
      setPinatasLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 border-border p-4 rounded-md shadow-sm border bg-[#FD8900]">
          <header className="flex justify-between items-center">
            <h2 className="font-semibold uppercase">Pinatas</h2>
            <Link
              href="/app/pinatas/create"
              className={buttonVariants({ size: "sm" })}
            >
              Create
            </Link>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {pinatasLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton className="h-32" />
                ))
              : pinatas.map((p, i) => (
                  <PinataCard key={p.$id} pinata={p} index={i} />
                ))}
          </div>
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
