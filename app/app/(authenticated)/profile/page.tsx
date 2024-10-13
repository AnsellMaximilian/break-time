"use client";

import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import breakTimeSquare from "@/assets/break-time-square.png";

import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases } from "@/lib/appwrite";
import { UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { pinata } from "@/lib/pinata";
import UploadDialog from "@/components/UploadDialog";
import { getFileUrl } from "@/utils/files";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 30 characters.",
  }),
});

export default function Page() {
  const { currentUser, setCurrentUser } = useUser();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreviewURL, setProfilePicturePreviewURL] = useState<
    string | null
  >(null);

  const [currentUploadProgress, setCurrentUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
      bio: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentUser) {
      try {
        setIsLoading(true);

        const updatedProfile = (await databases.updateDocument(
          config.dbId,
          config.userProfileCollectionId,
          currentUser.$id,
          {
            name: values.name,
            bio: values.bio,
          }
        )) as UserProfile;
        setCurrentUser((prev) =>
          prev ? { ...prev, profile: updatedProfile } : null
        );
        toast({
          description: "Your profile has been updated",
        });
      } catch (error) {
        form.setValue("username", currentUser.profile.username);
        form.setValue("name", currentUser.profile.name || "");
        form.setValue("bio", currentUser.profile.bio || "");
        toast({
          variant: "destructive",
          title: "Failed to update profile.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleThumbnailChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    if (!currentUser?.profile) return;
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      setCurrentUploadProgress(0);
      setProfilePicture(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);

      // actually uploading
      setIsUploading(true);
      const keyRequest = await fetch("/api/key");
      setUploadMessage(`Received key for ${file.name}`);

      setCurrentUploadProgress((prev) => prev + 1);

      const keyData = await keyRequest.json();
      const upload = await pinata.upload.file(file).key(keyData.JWT);
      setUploadMessage(`Uploaded file ${file.name}`);
      setCurrentUploadProgress((prev) => prev + 1);

      if (currentUser.profile.profilePictureFileId) {
        const delRes = await fetch("/api/delete-files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileIds: currentUser.profile.profilePictureFileId,
          }),
        });
        setUploadMessage(`Deleted old profile picture`);
        setCurrentUploadProgress((prev) => prev + 1);
      }

      await databases.updateDocument(
        config.dbId,
        config.userProfileCollectionId,
        currentUser.profile.$id,
        {
          profilePictureFileId: upload.id,
          profilePictureCid: upload.cid,
        }
      );

      setUploadMessage(`Updated metadata`);
      setCurrentUploadProgress((prev) => prev + 1);

      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.profile) {
      form.setValue("username", currentUser.profile.username);
      form.setValue("name", currentUser.profile.name || "");
      form.setValue("bio", currentUser.profile.bio || "");

      (async () => {
        if (currentUser.profile.profilePictureCid) {
          const res = (await getFileUrl(
            currentUser.profile.profilePictureCid
          )) as string;
          setProfilePicturePreviewURL(res);
        }
      })();
    }
  }, [currentUser?.profile, form]);
  return (
    <div className="p-4">
      <h1 className="text-3xl font-semibold">Your Profile</h1>
      <div className="mt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-w-[800px]"
          >
            <div className="flex gap-4">
              <div className="space-y-4 grow">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your username"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormDescription>This is your name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem className="">
                <FormLabel>Thumbnail</FormLabel>
                <div className="flex flex-col gap-4">
                  <Image
                    className="w-40 h-40 border-border border-4 rounded-md"
                    width={500}
                    height={500}
                    alt="thumbnail"
                    onClick={() => fileInputRef?.current?.click()}
                    src={profilePicturePreviewURL ?? breakTimeSquare}
                  ></Image>
                  <FormControl>
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      ref={fileInputRef}
                    />
                  </FormControl>
                </div>
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none text-black"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Your bio.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              Update
            </Button>
          </form>
        </Form>
      </div>
      <UploadDialog
        title="Uploading Profile Picture"
        description="Replacing or uploading new profile picture"
        currentProgress={currentUploadProgress}
        maxProgress={currentUser?.profile.profilePictureFileId ? 4 : 3}
        message={uploadMessage}
        open={isUploading}
      />
    </div>
  );
}
