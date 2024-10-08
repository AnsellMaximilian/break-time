"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user/UserContext";
import { UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { UserProfile } from "@/types";

export default function AddFriendForm() {
  const [username, setusername] = useState("");
  const { setCurrentUser, currentUser } = useUser();

  const { toast } = useToast();

  const handleAddFriend = async () => {
    if (currentUser?.profile) {
      if (username === currentUser.profile.username) {
        toast({
          variant: "destructive",
          title: "Failed to Add Friend",
          description: "That's your own username...",
        });
        return;
      }

      const foundFriend = await databases.listDocuments(
        config.dbId,
        config.userProfileCollectionId,
        [
          Query.and([
            Query.notEqual("$id", currentUser.$id),
            Query.equal("username", username),
          ]),
          Query.limit(1),
        ]
      );

      if (foundFriend.total <= 0) {
        toast({
          title: "Failed to Add Friend",

          variant: "destructive",
          description: "No user found with that username",
        });
        return;
      }

      if (
        currentUser.profile.friendIds.includes(foundFriend.documents[0].$id)
      ) {
        toast({
          title: "Failed to Add Friend",

          variant: "destructive",
          description: "User already added",
        });
        return;
      }

      const updatedUserProfile = await databases.updateDocument(
        config.dbId,
        config.userProfileCollectionId,
        currentUser.$id,
        {
          friendIds: [
            ...currentUser.profile.friendIds,
            foundFriend.documents[0].$id,
          ],
        }
      );

      const userProf = updatedUserProfile as UserProfile;

      setCurrentUser((prev) => (prev ? { ...prev, profile: userProf } : null));

      toast({ title: "Add friend successful" });
    }
  };
  return (
    <div className="flex gap-4">
      <Input
        name="addFriend"
        placeholder="Add by username"
        value={username}
        onChange={(e) => setusername(e.target.value)}
      />
      <Button className="flex items-center gap-2" onClick={handleAddFriend}>
        <UserPlus size={16} /> <span>Add Friend</span>
      </Button>
    </div>
  );
}
