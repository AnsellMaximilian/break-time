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

  const [othersPinatas, setOthersPinatas] = useState<Pinata[]>([]);
  const [othersPinatasLoading, setOthersPinatasLoading] = useState(false);

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
        setOthersPinatasLoading(true);
        const pinatas = (
          await databases.listDocuments(
            config.dbId,
            config.pinataCollectionId,
            [Query.equal("userId", currentUser.$id), Query.limit(100)]
          )
        ).documents as Pinata[];

        setPinatas(pinatas);
        setPinatasLoading(false);

        // other pinatas
        const othersPinatas = (
          await databases.listDocuments(
            config.dbId,
            config.pinataCollectionId,
            [
              Query.and([
                Query.notEqual("userId", currentUser.$id),
                Query.or([
                  Query.contains("allowedContributorIds", currentUser.$id),
                  Query.contains("allowedOpenerIds", currentUser.$id),
                ]),
              ]),
              Query.limit(5),
            ]
          )
        ).documents as Pinata[];
        setOthersPinatas(othersPinatas);
        setOthersPinatasLoading(false);
      }
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
          {!pinatasLoading && pinatas.length <= 0 && (
            <div className="py-4 text-center">
              <div className="text-xl font-bold">No Pinatas Yet! </div>
              <p>
                It looks like you haven't started creating any Pinatas yet.
                Start building your own digital time capsule to capture
                memories, moments, and meaningful contributions. Whether it's
                photos, notes, or special files, you can save them all for
                future discovery. Invite friends to contribute, and unlock your
                Pinatas together when you're ready to take a trip down memory
                lane!
              </p>
            </div>
          )}
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
        <section className="col-span-6 border-border p-4 rounded-md shadow-sm border bg-[#7B42B3] flex flex-col">
          <h2 className="font-semibold uppercase">People&apos;s Pinatas</h2>
          {othersPinatas.length <= 0 ? (
            <div className="mt-4 text-center grow flex items-center justify-center">
              Here you'll see Pinatas you've been invited to either contribute
              or open.
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              {othersPinatas.map((p) => {
                return (
                  <Link
                    href={`/app/pinatas/${p.$id}`}
                    key={p.$id}
                    className="text-white p-4 border-white border rounded-md cursor-pointer hover:bg-white hover:text-black"
                  >
                    <div className="font-semibold">{p.title}</div>
                    <div className="flex">
                      <div className="ml-auto text-xs">
                        By {p.creatorUsername}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
        <section className="col-span-6 border-border p-4 rounded-md shadow-sm border space-y-8 bg-[#D34681]">
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
