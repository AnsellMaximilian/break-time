"use client";

import { config, databases } from "@/lib/appwrite";
import { Pinata } from "@/types";
import { title } from "process";
import React, { useEffect, useState } from "react";

export default function PinataPage({
  params: { id: pinataId },
}: {
  params: { id: string };
}) {
  const [pinata, setPinata] = useState<Pinata | null>(null);

  useEffect(() => {
    (async () => {
      const pinata = (await databases.getDocument(
        config.dbId,
        config.pinataCollectionId,
        pinataId
      )) as Pinata;

      setPinata(pinata);
    })();
  }, [pinataId]);
  return (
    <div className="grid grid-cols-12 text-white">
      <div className="col-span-8 bg-[#1DB9D2] p-4">
        <h1 className="text-2xl font-bold">{pinata?.title}</h1>
        <p className="">
          {pinata?.description
            ? pinata.description
            : "No description for this Pinata."}
        </p>
      </div>
      <div className="col-span-4 bg-[#FFDD00] p-4">{pinata?.title}</div>
      <div className="col-span-4 bg-[#CE3F8F] p-4">{pinata?.title}</div>
      <div className="col-span-8 bg-[#6D3AC6] p-4">{pinata?.title}</div>
    </div>
  );
}
