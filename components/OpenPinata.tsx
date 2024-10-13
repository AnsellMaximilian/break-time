"use client";

import { Contribution, Pinata } from "@/types";
import React, { useEffect, useState } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import fallbackImg from "@/assets/break-time-square.png";

import Confetti from "react-confetti";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { getColorScheme } from "@/utils/colors";
import { truncateString } from "@/utils/common";
import { getFileUrl } from "@/utils/files";
import Image from "next/image";
import { fileTypeIcons, UnknownFileIcon } from "@/const/fileTypes";

export default function OpenPinata({ pinata }: { pinata: Pinata }) {
  const { width, height } = useWindowSize();
  const [launchConfetti, setLaunchConfetti] = useState(true);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showRibbons, setShowRibbons] = useState(true);
  const [thumbnailURL, setThumbnailURL] = useState("");

  useEffect(() => {
    const timeOut = setTimeout(() => setLaunchConfetti(false), 5000);

    return () => clearTimeout(timeOut);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setContributionsLoading(true);

        if (pinata.thumbnailCid) {
          const res = (await getFileUrl(pinata.thumbnailCid)) as string;
          setThumbnailURL(res);
        }

        const contributions = (
          await databases.listDocuments(
            config.dbId,
            config.contributionCollectionId,
            [Query.equal("pinataId", pinata.$id), Query.limit(100)]
          )
        ).documents as Contribution[];
        setContributions(contributions);
      } catch (error) {
      } finally {
        setContributionsLoading(false);
      }
    })();
  }, []);

  const openFile = async (contribution: Contribution) => {
    const fileURL = (await getFileUrl(contribution.cid)) as string;

    window.open(fileURL, "_blank");
  };
  return (
    <div className="">
      <div className="bg-[#FD8900] rounded-md mb-4 p-4 min-h-56 flex gap-8 items-center">
        <Image
          src={thumbnailURL}
          onError={() => setThumbnailURL(fallbackImg.src)}
          width={250}
          height={250}
          alt="Pinata Thumbnail"
          className="rounded-full border-white border-8"
        />
        <div>
          <h1 className="text-3xl font-bold">{pinata.title}</h1>
          <p className="text-xl">
            {pinata.description ? pinata.description : "No description"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {contributionsLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton className="h-24 rounded-md" />
            ))
          : contributions.map((c, i) => {
              const Icon = fileTypeIcons[c.fileType] ?? UnknownFileIcon;
              return (
                <div
                  onClick={() => {
                    openFile(c);
                  }}
                  key={c.$id}
                  className={cn(
                    "min-h-40 p-4 hover:opacity-90 cursor-pointer text-center flex flex-col items-center justify-center gap-4",
                    getColorScheme(i)
                  )}
                >
                  <Icon size={40} />
                  <div className="font-bold">{truncateString(c.title, 20)}</div>
                </div>
              );
            })}
      </div>
      {showRibbons && (
        <div className="fixed inset-0">
          <div
            className="bg-[#1DB9D2] h-[25vh] animate-slideRight"
            onAnimationEnd={() => setShowRibbons(false)}
          ></div>
          <div className="bg-[#FFDD00] h-[25vh] animate-slideLeft"></div>
          <div className="bg-[#CE3F8F] h-[25vh] animate-slideRight"></div>
          <div className="bg-[#6D57FF] h-[25vh] animate-slideLeft"></div>
        </div>
      )}
      {launchConfetti && <Confetti width={width} height={height} />}
    </div>
  );
}
