"use client";

import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/data/DataContext";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases } from "@/lib/appwrite";
import { UserProfile } from "@/types";
import { Query } from "appwrite";
import React, { useEffect, useState } from "react";

const PAGE_LIMIT = 5;

export default function FriendList({
  friends,
  setFriends,
}: {
  friends: UserProfile[];
  setFriends: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}) {
  const { currentUser } = useUser();

  const [hasNext, setHasNext] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    (async () => {
      if (currentUser?.profile) {
        const friendsRes = await databases.listDocuments(
          config.dbId,
          config.userProfileCollectionId,
          [
            Query.equal("$id", currentUser.profile.friendIds),
            Query.limit(PAGE_LIMIT),
          ]
        );
        const friends = friendsRes.documents as UserProfile[];
        setFriends(friends);
      }
    })();
  }, []);

  const handleNextPage = async () => {
    if (currentUser?.profile) {
      const lastId = friends[friends.length - 1].$id;

      const nextPageRes = await databases.listDocuments(
        config.dbId,
        config.userProfileCollectionId,
        [
          Query.equal("$id", currentUser.profile.friendIds),
          Query.limit(1),
          Query.cursorAfter(lastId),
        ]
      );

      const nextPageFriends = nextPageRes.documents as UserProfile[];

      if (nextPageFriends.length <= 0) {
        setHasNext(false);
        return;
      }
      setFriends(nextPageFriends);
      setHasPrev(true);
    }
  };

  const handlePrevPage = async () => {
    if (currentUser?.profile) {
      if (friends.length < PAGE_LIMIT) {
        setHasPrev(false);
        return;
      }

      const firstId = friends[0].$id;

      const prevPageRes = await databases.listDocuments(
        config.dbId,
        config.userProfileCollectionId,
        [
          Query.equal("$id", currentUser.profile.friendIds),
          Query.limit(1),
          Query.cursorBefore(firstId),
        ]
      );

      const prevPageFriends = prevPageRes.documents as UserProfile[];

      if (prevPageFriends.length <= 0) {
        setHasPrev(false);
        return;
      }
      setFriends(prevPageFriends);
      setHasNext(true);
    }
  };

  return (
    <div className="">
      {currentUser?.profile && currentUser.profile.friendIds.length > 0 ? (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {friends.map((f) => (
              <li key={f.id} className="p-2 rounded-md border border-border">
                {f.name}
              </li>
            ))}
          </ul>
          {currentUser.profile.friendIds.length > 0 && (
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevPage}
                disabled={!hasPrev}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNextPage}
                disabled={!hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm text-center">
          Add friends by their usernames
        </div>
      )}
    </div>
  );
}
