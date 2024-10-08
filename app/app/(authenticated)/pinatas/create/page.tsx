"use client";

import React, { useRef, useState } from "react";
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

const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500),
  // contributeStart: z.date(),
  // contributeEnd: z.date(),
  //   minimumOpenTime: z.date(),
});

export default function CreatePinataPage() {
  const [isLoading, setisLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreviewURL, setThumbnailPreviewURL] = useState<string | null>(
    null
  );

  const [contributeStart, setContributeStart] = useState("");
  const [contributeEnd, setContributeEnd] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-12 gap-8">
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
                      <FormDescription>
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
                      <FormDescription>
                        Further information on your Pinata, e.g., "The contents
                        of this Pinata represent the celebration of John and
                        Mary's 17th Anniversary"
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
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                </div>
              </FormItem>
            </div>

            <div className="col-span-8 bg-[#1CB9D1]">
              <h2 className="font-semibold mb-4">Contribution Time</h2>
              <div className="flex gap-8">
                <FormField
                  name="contributeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        When can other users and/or yourself start uploading
                        files into the Pinata.
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
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your Pinata, e.g., "Anniversary",
                        "Birthday", "2024 Time Capsule"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="col-span-8 bg-[#D14193]">
              <h2 className="font-semibold mb-4">Allowed Contributors</h2>
              <div className="flex gap-8">
                <FormField
                  name="contributeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        When can other users and/or yourself start uploading
                        files into the Pinata.
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
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your Pinata, e.g., "Anniversary",
                        "Birthday", "2024 Time Capsule"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex">
              <Button type="submit" className="ml-auto" disabled={isLoading}>
                Register
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
