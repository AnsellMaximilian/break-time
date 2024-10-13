"use client";

import { Contribution, Pinata } from "@/types";
import React, { useEffect, useState } from "react";
import useWindowSize from "react-use/lib/useWindowSize";

import Confetti from "react-confetti";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Skeleton } from "./ui/skeleton";

export default function OpenPinata({ pinata }: { pinata: Pinata }) {
  const { width, height } = useWindowSize();
  const [launchConfetti, setLaunchConfetti] = useState(true);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showRibbons, setShowRibbons] = useState(true);

  useEffect(() => {
    const timeOut = setTimeout(() => setLaunchConfetti(false), 5000);

    return () => clearTimeout(timeOut);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setContributionsLoading(true);

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
  return (
    <div className="">
      <div className="grid grid-cols-5">
        {contributionsLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton className="h-24 rounded-md" />
            ))
          : contributions.map((c) => <div key={c.$id}>{c.title}</div>)}
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
