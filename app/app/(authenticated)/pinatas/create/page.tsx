"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500),
  //   contributeStart: z.date(),
  //   contributeEnd: z.date(),
  //   minimumOpenTime: z.date(),
});

export default function CreatePinataPage() {
  const [isLoading, setisLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreviewURL, setThumbnailPreviewURL] = useState<string | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {}

  const handleThumbnailChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      setThumbnail(file);

      // Create a preview URL using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Pinata</h1>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormItem>
                  <FormLabel htmlFor="thumbnail">Thumbnail</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      className="hidden"
                      id="thumbnail"
                      onChange={handleThumbnailChange}
                    />
                  </FormControl>
                </FormItem>
                <Image
                  className="w-24 h-24 border-border border"
                  width={200}
                  height={200}
                  alt="thumbnail"
                  src={thumbnailPreviewURL ?? ""}
                ></Image>
              </div>
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex">
              <Button type="submit" className="ml-auto" disabled={isLoading}>
                Register
              </Button>{" "}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
