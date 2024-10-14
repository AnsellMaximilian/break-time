"use client";

import UploadDialog from "@/components/UploadDialog";
import { client, config, databases } from "@/lib/appwrite";
import { Contribution, Pinata, UserProfile } from "@/types";
import { Upload, UploadCloud } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { pinata as pnt } from "@/lib/pinata";
import { ID, Permission, Query, Role } from "appwrite";
import {
  fileTypeIcons,
  openableFileTypes,
  UnknownFileIcon,
} from "@/const/fileTypes";
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
  canPinataBeOpened,
  doesPinataAcceptContributions,
  doesPinataOpenAutomatically,
  getContributionTimeNode,
  getTotalOpeners,
  isPinataOpened,
  isUserAllowedToContribute,
  isUserAllowedToOpen,
} from "@/utils/pinatas";
import { useUser } from "@/contexts/user/UserContext";
import { unsubscribe } from "diagnostics_channel";
import { truncateString, uniqueArray } from "@/utils/common";
import { FaUser } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import OpenPinata from "@/components/OpenPinata";

export default function PinataPage({
  params: { id: pinataId },
}: {
  params: { id: string };
}) {
  const { currentUser } = useUser();
  const router = useRouter();
  const [pinata, setPinata] = useState<Pinata | null>(null);
  const [thumbnailURL, setThumbnailURL] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [maxUploadProgress, setMaxUploadProgress] = useState(0);
  const [currentUploadProgress, setCurrentUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");

  const [isOpeningPinata, setIsOpeningPinata] = useState(false);

  const [contributionsLoading, setContributionsLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(true);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contributors, setContributors] = useState<UserProfile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // const formData = new FormData();
      // acceptedFiles.forEach((file) => {
      //   formData.append("file", file);
      // });

      // const response = await fetch("/api/scan-files", {
      //   method: "POST",
      //   body: formData, // FormData object containing the files
      // });

      // const data = await response.json();

      // console.log(data);

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
                userId: currentUser.$id,
                fileId: upload.id,
              },
              [
                Permission.read(Role.any()),
                Permission.delete(Role.user(currentUser.$id)),
              ]
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
    },
    [pinata, currentUser]
  );

  // realtime
  useEffect(() => {
    const unsubscribe = client.subscribe(
      [
        `databases.${config.dbId}.collections.${config.pinataCollectionId}.documents.${pinataId}`,
      ],
      (response) => {
        setPinata(response.payload as Pinata);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenPinata = async () => {
    if (pinata && canPinataBeOpened(pinata) && currentUser) {
      try {
        setIsOpeningPinata(true);

        await databases.updateDocument(
          config.dbId,
          config.pinataCollectionId,
          pinataId,
          {
            openerIds: [...pinata.openerIds, currentUser.$id],
          }
        );
      } catch (error) {
      } finally {
        setIsOpeningPinata(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    (async () => {
      try {
        setContributionsLoading(true);
        setContributorsLoading(true);
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
        setContributionsLoading(false);
        setContributions(contributions);

        if (
          pinata.allowedContributorIds.length + pinata.allowedOpenerIds.length >
          0
        ) {
          const contributors = (
            await databases.listDocuments(
              config.dbId,
              config.userProfileCollectionId,
              [
                Query.equal("$id", [
                  ...pinata.allowedContributorIds,
                  ...pinata.allowedOpenerIds,
                ]),
                Query.limit(100),
              ]
            )
          ).documents as UserProfile[];

          setContributors(contributors);
        }
        setContributorsLoading(false);
      } catch (error) {
        router.push("/app/dashboard");
        toast({
          title: "Pinata Not Found",
          description: "There isn't any Pinata with that ID",
          variant: "destructive",
        });
      }
    })();
  }, [pinataId]);

  return (
    <div className="grow">
      {pinata ? (
        isPinataOpened(pinata) ? (
          <OpenPinata pinata={pinata} />
        ) : (
          <div className="grid grid-cols-12 text-white rounded-md overflow-hidden">
            <div className="col-span-12 lg:col-span-8 bg-[#1DB9D2] p-4 flex gap-8 row-start-2 lg:row-start-1 items-center">
              <Image
                src={thumbnailURL}
                onError={() => setThumbnailURL(fallbackImg.src)}
                width={250}
                height={250}
                alt="Pinata Thumbnail"
                className="rounded-full border-white border-8 w-56 h-56 object-cover"
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
                    <span className="text-sm">
                      {doesPinataOpenAutomatically(pinata)
                        ? "Opens"
                        : "Openable"}{" "}
                      at
                    </span>{" "}
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

              {!doesPinataOpenAutomatically(pinata) && (
                <div className="mt-auto flex items-center">
                  <div>
                    <div className="">
                      <span className="font-bold text-xl">
                        {getTotalOpeners(pinata)}/
                        {uniqueArray(pinata.allowedOpenerIds).length}
                      </span>{" "}
                      <span>Opened</span>
                    </div>
                    <div className="text-xs uppercase font-semibold bg-white px-2">
                      {currentUser && pinata.openerIds.includes(currentUser.$id)
                        ? "Waiting for others"
                        : "Click to Open"}
                    </div>
                  </div>
                  <button
                    onClick={handleOpenPinata}
                    disabled={
                      !canPinataBeOpened(pinata) ||
                      !isUserAllowedToOpen(pinata, currentUser) ||
                      isOpeningPinata
                    }
                    className="disabled:opacity-70 disabled:cursor-not-allowed w-24 h-24 shadow-md rounded-full bg-[#FD8900] text-white font-bold uppercase ml-auto text-xl hover:opacity-90"
                  >
                    Open
                  </button>
                </div>
              )}
            </div>
            <div className="col-span-12 bg-[#CE3F8F] p-4">
              <h2 className="text-xl font-semibold">
                Friends and Contributors
              </h2>
              <div className="mt-4 min-h-56">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contributorsLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-md" />
                      ))
                    : contributors.map((c) => {
                        return (
                          <div
                            key={c.$id}
                            className="relative overflow-hidden p-4 border border-white rounded-md flex gap-4 items-center hover:bg-white hover:text-black cursor-pointer"
                          >
                            {c.$id === pinata.userId && (
                              <div className="absolute left-0 top-0 bg-white px-2 text-xs font-bold tracking-tighter text-black uppercase">
                                Creator
                              </div>
                            )}
                            <FaUser size={24} />
                            <div className="grow">
                              <div className="flex gap-2 justify-between items-center">
                                <div className="">
                                  {truncateString(c.username, 10)}
                                </div>
                                <div>
                                  <div className="flex gap-2 justify-end">
                                    {pinata.allowedOpenerIds.includes(
                                      c.$id
                                    ) && <Badge>Opener</Badge>}
                                    {pinata.allowedContributorIds.includes(
                                      c.$id
                                    ) && <Badge>Contributor</Badge>}
                                  </div>
                                  <div className="flex">
                                    <div className="ml-auto mt-4 text-xs">
                                      Contributions:{" "}
                                      {
                                        contributions.filter(
                                          (cb) => cb.userId === c.$id
                                        ).length
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
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
                  disabled={
                    !isUserAllowedToContribute(pinata, currentUser) ||
                    !doesPinataAcceptContributions(pinata)
                  }
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
                {contributions.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      These are your files. You can access them after the Pinata
                      has been opened
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contributionsLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-md" />
                          ))
                        : contributions.map((c) => {
                            const Icon =
                              fileTypeIcons[c.fileType] ?? UnknownFileIcon;
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
                        Drag and drop your file contribution(s) here, or click
                        to select files
                      </p>
                    )}
                  </div>
                )}

                <input
                  {...getInputProps()}
                  ref={fileInputRef}
                  // accept={openableFileTypes.join(", ")}
                />
              </div>
            </div>
            <UploadDialog
              open={uploadDialogOpen}
              currentProgress={currentUploadProgress}
              maxProgress={maxUploadProgress}
              message={uploadMessage}
            />
          </div>
        )
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
