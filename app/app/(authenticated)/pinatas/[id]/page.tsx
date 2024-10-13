"use client";

import UploadDialog from "@/components/UploadDialog";
import { config, databases } from "@/lib/appwrite";
import { Contribution, Pinata } from "@/types";
import { Upload, UploadCloud } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { pinata as pnt } from "@/lib/pinata";
import { ID, Query } from "appwrite";
import { fileTypeIcons, UnknownFileIcon } from "@/const/fileTypes";
import { getFileUrl } from "@/utils/files";
import Image from "next/image";
import fallbackImg from "@/assets/break-time-square.png";
import { format } from "date-fns";
import CountDownTimer from "@/components/CountDownTimer";
import loadingLogo from "@/assets/breaktime-logo.svg";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  doesPinataAcceptContributions,
  getContributionTimeNode,
  isUserAllowedToContribute,
} from "@/utils/pinatas";
import { useUser } from "@/contexts/user/UserContext";

export default function PinataPage({
  params: { id: pinataId },
}: {
  params: { id: string };
}) {
  const { currentUser } = useUser();
  const [pinata, setPinata] = useState<Pinata | null>(null);
  const [thumbnailURL, setThumbnailURL] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [maxUploadProgress, setMaxUploadProgress] = useState(0);
  const [currentUploadProgress, setCurrentUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");

  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!pinata || !currentUser) return;

    if (!doesPinataAcceptContributions(pinata)) {
      toast({
        variant: "destructive",
        description: "This Pinata is currently not accepting contrubitons.",
        title: "Contribution Failed",
      });
      return;
    }

    if (!isUserAllowedToContribute(pinata, currentUser)) {
      toast({
        variant: "destructive",
        description: "You are not allowed to contribute to this Pinata.",
        title: "Contribution Failed",
      });
      return;
    }
    try {
      setUploadDialogOpen(true);
      setCurrentUploadProgress(0);
      setMaxUploadProgress(acceptedFiles.length * 3);
      const uploadRes = await Promise.all(
        acceptedFiles.map(async (file) => {
          const keyRequest = await fetch("/api/key");
          setUploadMessage(`Received key for ${file.name}`);

          setCurrentUploadProgress((prev) => prev + 1);
          const keyData = await keyRequest.json();
          const upload = await pnt.upload.file(file).key(keyData.JWT);
          setUploadMessage(`Uploaded file ${file.name}`);
          setCurrentUploadProgress((prev) => prev + 1);

          const metadata = (await databases.createDocument(
            config.dbId,
            config.contributionCollectionId,
            ID.unique(),
            {
              pinataId,
              cid: upload.cid,
              fileType: file.type,
              title: file.name,
            }
          )) as Contribution;
          setUploadMessage(`Uploaded metadata for ${file.name}`);

          setCurrentUploadProgress((prev) => prev + 1);

          return metadata;
        })
      );
      setContributions((prev) => [...prev, ...uploadRes]);
    } catch (error) {
    } finally {
      setUploadDialogOpen(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    (async () => {
      const pinata = (await databases.getDocument(
        config.dbId,
        config.pinataCollectionId,
        pinataId
      )) as Pinata;

      if (pinata.thumbnailCid) {
        const res = (await getFileUrl(pinata.thumbnailCid)) as string;
        setThumbnailURL(res);
      }

      setPinata(pinata);

      const contributions = (
        await databases.listDocuments(
          config.dbId,
          config.contributionCollectionId,
          [Query.equal("pinataId", pinataId), Query.limit(100)]
        )
      ).documents as Contribution[];

      setContributions(contributions);
    })();
  }, [pinataId]);

  return (
    <div className="grow">
      {pinata ? (
        <div className="grid grid-cols-12 text-white rounded-md overflow-hidden">
          <div className="col-span-12 lg:col-span-8 bg-[#1DB9D2] p-4 flex gap-8 row-start-2 lg:row-start-1 items-center">
            <Image
              src={thumbnailURL}
              onError={() => setThumbnailURL(fallbackImg.src)}
              width={250}
              height={250}
              alt="Pinata Thumbnail"
              className="rounded-full border-white border-8"
            />
            <div className="">
              <h1 className="text-3xl tracking-tight font-bold">
                {pinata?.title}
              </h1>
              <p className="">
                {pinata?.description
                  ? pinata.description
                  : "No description for this Pinata."}
              </p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-[#FFDD00] p-4 text-black flex flex-col">
            <h2 className="text-xl font-semibold">Open the Pinata</h2>
            {pinata?.minimumOpenTime && (
              <div className="">
                <div className="text-right">
                  <span className="text-sm">Openable at</span>{" "}
                  <span className="text-xs font-bold">
                    {format(
                      new Date(pinata.minimumOpenTime),
                      "MMMM do, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>

                <div className="mt-4 flex justify-center">
                  <CountDownTimer date={pinata.minimumOpenTime} />
                </div>
              </div>
            )}

            <div className="mt-auto flex items-center">
              <div>0/3</div>
              <button className="w-24 h-24 shadow-md rounded-full bg-[#FD8900] text-white font-bold uppercase ml-auto text-xl hover:opacity-90">
                Open
              </button>
            </div>
          </div>
          <div className="col-span-12 bg-[#CE3F8F] p-4">
            <h2 className="text-xl font-semibold">Friends and Contributors</h2>
          </div>
          <div className="col-span-12 bg-[#6D3AC6] p-4 space-y-4">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Files and Contributions
                </h2>
                <div className="text-sm">
                  {getContributionTimeNode(pinata)}
                  {!doesPinataAcceptContributions(pinata) &&
                    `. This Pinata is currently not accepting contrubitons.`}
                </div>
              </div>
              <Button
                disabled={!isUserAllowedToContribute(pinata, currentUser)}
                onClick={() => fileInputRef.current?.click()}
                className="flex gap-2"
              >
                <span>Upload</span> <UploadCloud />
              </Button>
            </div>
            <div
              className=" min-h-56 border-white flex flex-col"
              {...getRootProps({
                onClick: (event) => {
                  event.stopPropagation();
                },
              })}
            >
              {contributionsLoading ? (
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-md" />
                  ))}
                </div>
              ) : contributions.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    These are your files. You can access them after the Pinata
                    has been opened
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {contributions.map((c) => {
                      const Icon = fileTypeIcons[c.fileType] ?? UnknownFileIcon;
                      return (
                        <div
                          key={c.$id}
                          className="p-4 border border-white rounded-md flex gap-4 items-center hover:bg-white hover:text-black cursor-pointer"
                        >
                          <Icon size={24} />{" "}
                          <div className="text-xs">{c.title}</div>
                        </div>
                      );
                    })}
                    {isDragActive && (
                      <div className="p-4 border border-white rounded-md flex gap-4 items-center bg-white text-black cursor-pointer">
                        <UnknownFileIcon size={24} />{" "}
                        <div className="text-xs">New File</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center flex-col justify-center gap-2 grow border-white border rounded-md">
                  <Upload size={44} />

                  {isDragActive ? (
                    <p>Drop your files here...</p>
                  ) : (
                    <p>
                      Drag and drop your file contribution(s) here, or click to
                      select files
                    </p>
                  )}
                </div>
              )}

              <input {...getInputProps()} ref={fileInputRef} />
            </div>
          </div>
          <UploadDialog
            open={uploadDialogOpen}
            currentProgress={currentUploadProgress}
            maxProgress={maxUploadProgress}
            message={uploadMessage}
          />
        </div>
      ) : (
        <div className="flex justify-center h-full overflow-hidden">
          <Image
            src={loadingLogo}
            alt="logo"
            width={250}
            height={250}
            className="animate-ping"
          />
        </div>
      )}
    </div>
  );
}
