"use client";

import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import breakTimeSquare from "@/assets/break-time-square.png";
import { Pinata, UserProfile } from "@/types";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "appwrite";
import { Checkbox } from "@/components/ui/checkbox";
import { truncateString } from "@/utils/common";
import { pinata } from "@/lib/pinata";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500),
});

export default function CreatePinataPage() {
  const { currentUser } = useUser();

  const { toast } = useToast();

  const router = useRouter();

  const [isLoading, setisLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreviewURL, setThumbnailPreviewURL] = useState<string | null>(
    null
  );

  const [contributeStart, setContributeStart] = useState("");
  const [contributeEnd, setContributeEnd] = useState("");

  const [minimumOpenTime, setMinimumOpenTime] = useState("");

  const [isPublic, setIsPublic] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // FRIENDS
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [allowedContributorIds, setAllowedContributorIds] = useState<string[]>(
    []
  );
  const [
    friendUsernameSearchContributorVal,
    setFriendUsernameSearchContributorVal,
  ] = useState("");

  const [filteredContributorFriends, setFilteredContributorFriends] = useState<
    UserProfile[]
  >([]);

  const [allowedOpenerIds, setAllowedOpenerIds] = useState<string[]>([]);
  const [friendUsernameSearchOpenerVal, setFriendUsernameSearcOpenerVal] =
    useState("");

  const [filteredOpenerFriends, setFilteredOpenerFriends] = useState<
    UserProfile[]
  >([]);

  useEffect(() => {
    if (friendUsernameSearchContributorVal) {
      setFilteredContributorFriends(
        friends.filter(
          (f) =>
            f.username
              .toLowerCase()
              .includes(friendUsernameSearchContributorVal.toLowerCase()) ||
            currentUser?.$id === f.$id
        )
      );
    }
  }, [friendUsernameSearchContributorVal]);

  useEffect(() => {
    if (friendUsernameSearchOpenerVal) {
      setFilteredOpenerFriends(
        friends.filter(
          (f) =>
            f.username
              .toLowerCase()
              .includes(friendUsernameSearchOpenerVal.toLowerCase()) ||
            currentUser?.$id === f.$id
        )
      );
    }
  }, [friendUsernameSearchOpenerVal]);

  useEffect(() => {
    (async () => {
      if (currentUser?.profile) {
        const friendsRes = await databases.listDocuments(
          config.dbId,
          config.userProfileCollectionId,
          [Query.equal("$id", currentUser.profile.friendIds), Query.limit(100)]
        );
        const friends = friendsRes.documents as UserProfile[];
        setFriends(friends);
      }
    })();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser?.profile) return;
    try {
      setisLoading(true);

      let thumbnailCid: string | null = null;
      if (thumbnail) {
        const keyRequest = await fetch("/api/key");
        const keyData = await keyRequest.json();
        const upload = await pinata.upload.file(thumbnail).key(keyData.JWT);
        thumbnailCid = upload.cid;
      }

      const createdPinata = await databases.createDocument(
        config.dbId,
        config.pinataCollectionId,
        ID.unique(),
        {
          title: values.title,
          description: values.description,
          thumbnailCid: thumbnailCid,
          contributeStart: contributeStart ?? null,
          contributeEnd: contributeEnd ?? null,
          minimumOpenTime: minimumOpenTime ?? null,
          allowedContributorIds,
          allowedOpenerIds,
          userId: currentUser.$id,
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(currentUser.$id)),
        ]
      );
      toast({
        title: "Successfully created Pinata",
        description: "Your Pinata is ready!",
      });
      router.push("/app/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast({
        variant: "destructive",
        title: "Failed to create Pinata",
        description: message,
      });
    } finally {
      setisLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser) {
      setAllowedContributorIds((prev) => [...prev, currentUser.$id]);
      setAllowedOpenerIds((prev) => [...prev, currentUser.$id]);
    }
  }, [currentUser]);

  const handleThumbnailChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      setThumbnail(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Pinata</h1>

      {currentUser?.profile ? (
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-12 gap-8 bg-[#FEDE00] p-4 rounded-md text-black">
                <div className="space-y-8 col-span-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Pinata Title" {...field} />
                        </FormControl>
                        <FormDescription className="text-gray-800">
                          The name of your Pinata, e.g., "Anniversary",
                          "Birthday", "2024 Time Capsule"
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Pinata description..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-800">
                          Further information on your Pinata, e.g., "The
                          contents of this Pinata represent the celebration of
                          John and Mary's 17th Anniversary"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormItem className="col-span-4">
                  <FormLabel>Thumbnail</FormLabel>
                  <div className="flex flex-col gap-4">
                    <Image
                      className="w-64 h-64 border-border border-4 rounded-md"
                      width={500}
                      height={500}
                      alt="thumbnail"
                      onClick={() => fileInputRef?.current?.click()}
                      src={thumbnailPreviewURL ?? breakTimeSquare}
                    ></Image>
                    <FormControl>
                      <Input
                        type="file"
                        className=""
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        ref={fileInputRef}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-800">
                      The thumbnail picture for your Pinata.
                    </FormDescription>
                  </div>
                </FormItem>
              </div>

              <div className="col-span-8 bg-[#1CB9D1] p-4 rounded-md">
                <h2 className="font-semibold mb-4 text-white">
                  Contribution Time
                </h2>
                <div className="flex gap-8">
                  <FormField
                    name="contributeStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            onChange={(e) => setContributeStart(e.target.value)}
                            value={contributeStart}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-800">
                          Select the date and time when contributions to the
                          time capsule will begin. Users will not be able to
                          contribute before this date.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="contributeEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            onChange={(e) => setContributeEnd(e.target.value)}
                            value={contributeEnd}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-800">
                          Select the date and time when contributions to the
                          time capsule will close. After this time, no further
                          contributions will be accepted.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="col-span-8 bg-[#D14193] rounded-md p-4 pb-8">
                <h2 className="font-semibold mb-4 text-white">Contributions</h2>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Allowed Contributors
                  </label>
                  <div className="flex gap-4">
                    <div className="flex gap-1 items-center">
                      <Switch
                        checked={isPublic}
                        onCheckedChange={(v) => {
                          setIsPublic(v);
                        }}
                      />{" "}
                      <span className="text-sm">Public</span>
                    </div>

                    <Input
                      value={friendUsernameSearchContributorVal}
                      onChange={(e) =>
                        setFriendUsernameSearchContributorVal(e.target.value)
                      }
                      placeholder="Search username"
                      className="p-2 text-xs h-6 rounded-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                  {[
                    currentUser.profile,
                    ...(friendUsernameSearchContributorVal &&
                    filteredContributorFriends.length > 0
                      ? filteredContributorFriends
                      : friends),
                  ].map((f) => (
                    <div
                      key={`${f.$id}-contributor`}
                      className="p-2 text-sm rounded-sm border-border border bg-white text-black"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${f.$id}-contributor`}
                          checked={allowedContributorIds.includes(f.$id)}
                          onCheckedChange={(val) => {
                            if (!val)
                              setAllowedContributorIds((prev) =>
                                prev.filter((c) => c !== f.$id)
                              );
                            else
                              setAllowedContributorIds((prev) => [
                                ...prev,
                                f.$id,
                              ]);
                          }}
                        />
                        <label
                          htmlFor={`${f.$id}-contributor`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {currentUser.$id !== f.$id ? (
                            truncateString(f.username, 12)
                          ) : (
                            <span className="font-bold">Include Yourself</span>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <FormDescription className="text-gray-200 mt-2">
                  Specify friends are permitted to contribute to this time
                  capsule. You may choose to exclude yourself from the list if
                  you do not wish to contribute.
                </FormDescription>
              </div>

              <div className="col-span-8 bg-[#6A3CC8] p-4 rounded-md">
                <h2 className="font-semibold mb-4 text-white">
                  Opening the Pinata
                </h2>
                <div className="space-y-8">
                  <FormField
                    name="contributeStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            onChange={(e) => setMinimumOpenTime(e.target.value)}
                            value={minimumOpenTime}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-200">
                          Set the earliest date and time when the time capsule
                          can be opened. The capsule will remain sealed until
                          this moment, after which it can be accessed by the
                          authorized openers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Allowed Openers
                      </label>
                      <div className="flex gap-4">
                        <Input
                          value={friendUsernameSearchOpenerVal}
                          onChange={(e) =>
                            setFriendUsernameSearcOpenerVal(e.target.value)
                          }
                          placeholder="Search username"
                          className="p-2 text-xs h-6 rounded-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                      {[
                        currentUser.profile,
                        ...(friendUsernameSearchOpenerVal &&
                        filteredOpenerFriends.length > 0
                          ? filteredOpenerFriends
                          : friends),
                      ].map((f) => (
                        <div
                          key={`${f.$id}-opener`}
                          className="p-2 text-sm rounded-sm border-border border bg-white text-black"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${f.$id}-opener`}
                              checked={allowedOpenerIds.includes(f.$id)}
                              onCheckedChange={(val) => {
                                if (!val)
                                  setAllowedOpenerIds((prev) =>
                                    prev.filter((c) => c !== f.$id)
                                  );
                                else
                                  setAllowedOpenerIds((prev) => [
                                    ...prev,
                                    f.$id,
                                  ]);
                              }}
                            />
                            <label
                              htmlFor={`${f.$id}-opener`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {currentUser.$id !== f.$id ? (
                                truncateString(f.username, 12)
                              ) : (
                                <span className="font-bold">
                                  Include Yourself
                                </span>
                              )}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormDescription className="text-gray-200 mt-2">
                      List the individuals who are required to authorize the
                      opening of the time capsule. Each person must press the
                      'Open' button to unlock and reveal the contents. All
                      listed individuals must approve before the capsule can be
                      opened.
                    </FormDescription>
                  </div>
                </div>
              </div>

              <div className="flex">
                <Button type="submit" className="ml-auto" disabled={isLoading}>
                  Create Pinata
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
