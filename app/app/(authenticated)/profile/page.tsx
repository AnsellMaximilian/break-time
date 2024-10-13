"use client";

import React, { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases } from "@/lib/appwrite";
import { UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    if (currentUser?.profile) {
      form.setValue("username", currentUser.profile.username);
      form.setValue("name", currentUser.profile.name || "");
      form.setValue("bio", currentUser.profile.bio || "");
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
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Your username" {...field} disabled />
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
    </div>
  );
}
