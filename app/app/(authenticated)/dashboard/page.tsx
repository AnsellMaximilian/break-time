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
import { ApiResponse, Contribution, Pinata, UserProfile } from "@/types";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { getColorScheme } from "@/utils/colors";
import PinataCard from "@/components/PinataCard";
import { Skeleton } from "@/components/ui/skeleton";
import UploadDialog from "@/components/UploadDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { pinata as pnt } from "@/lib/pinata";

export default function DashboardPage() {
  const { currentUser } = useUser();

  const [friends, setFriends] = useState<UserProfile[]>([]);

  const [pinatas, setPinatas] = useState<Pinata[]>([]);

  const [pinatasLoading, setPinatasLoading] = useState(false);

  // Pinata Deletion
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState("");
  const [pinataToDelete, setPinataToDelete] = useState<Pinata | null>(null);

  const [currentDeleteProgress, setCurrentDeleteProgress] = useState(0);

  const handleDelete = async (pinata: Pinata) => {
    try {
      setPinataToDelete(null);
      setIsDeleting(true);
      setDeletionMessage("Deleting Pinata");

      const contributions = (
        await databases.listDocuments(
          config.dbId,
          config.contributionCollectionId,
          [Query.equal("pinataId", pinata.$id), Query.limit(100)]
        )
      ).documents as Contribution[];

      setDeletionMessage("Fetched related contributions");
      setCurrentDeleteProgress((prev) => prev + 1);

      const deletedContributions = await Promise.all(
        contributions.map(async (c) => {
          return await databases.deleteDocument(
            config.dbId,
            config.contributionCollectionId,
            c.$id
          );
        })
      );

      setDeletionMessage(
        `Deleted ${deletedContributions.length} contributions`
      );
      setCurrentDeleteProgress((prev) => prev + 1);
      const delRes = await fetch("/api/delete-files", {
        method: "POST", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Specify the content type (JSON in this case)
        },
        body: JSON.stringify({ fileIds: contributions.map((c) => c.fileId) }), // Convert the JavaScript object to JSON
      });

      const deletedFiles = (await delRes.json()) as ApiResponse<number>;

      setDeletionMessage(`Deleted ${deletedFiles.data} files from Pinata`);
      setCurrentDeleteProgress((prev) => prev + 1);

      const deletedPinata = await databases.deleteDocument(
        config.dbId,
        config.pinataCollectionId,
        pinata.$id
      );
      setDeletionMessage(`Deleted ${pinata.title} Pinata`);
      setCurrentDeleteProgress((prev) => prev + 1);
      setPinatas((prev) => prev.filter((p) => p.$id !== pinata.$id));
    } catch (error) {
    } finally {
      setIsDeleting(false);
      setCurrentDeleteProgress(0);
      setDeletionMessage("");
    }
  };
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
                  <PinataCard
                    key={p.$id}
                    pinata={p}
                    index={i}
                    setPinataToDelete={setPinataToDelete}
                  />
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
      <ConfirmDialog
        open={!!pinataToDelete}
        onOpenChange={(val) => {
          if (!val) setPinataToDelete(null);
        }}
        title="Delete Pinata?"
        description="All associated files will also be deleted"
        action={() => {
          if (pinataToDelete) handleDelete(pinataToDelete);
        }}
      />
      <UploadDialog
        title="Deleting Pinata"
        description="Deleting Pinata and it's contributions"
        currentProgress={currentDeleteProgress}
        maxProgress={4}
        open={isDeleting}
        message={deletionMessage}
      />
    </div>
  );
}
