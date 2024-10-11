"use client";

import { Pinata } from "@/types";
import { getColorScheme } from "@/utils/colors";
import { truncateString } from "@/utils/common";
import Link from "next/link";
import React from "react";

export default function PinataCard({
  pinata,
  index,
}: {
  pinata: Pinata;
  index: number;
}) {
  return (
    <Link
      href={`/app/pinatas/${pinata.$id}`}
      key={pinata.$id}
      className={`p-4 rounded-md border border-border hover:opacity-90 space-y-2 ${getColorScheme(
        index
      )}`}
    >
      <h3 className="text-sm font-bold tracking-tight">{pinata.title}</h3>
      <p className="text-sm">
        {pinata.description
          ? truncateString(pinata.description, 200)
          : "No description."}
      </p>
    </Link>
  );
}
