"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user/UserContext";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import AddFriendForm from "./AddFriendForm";
import { useData } from "@/contexts/data/DataContext";

export default function DashboardPage() {
  const { currentUser } = useUser();
  const { friends } = useData();

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
          <div className="">
            {currentUser?.profile &&
            currentUser.profile.friendIds.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {friends.data.map((f) => (
                  <li
                    key={f.id}
                    className="p-2 rounded-md border border-border"
                  >
                    {f.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground text-sm text-center">
                Add friends by their usernames
              </div>
            )}
          </div>
          <AddFriendForm />
        </section>
      </div>
    </div>
  );
}
