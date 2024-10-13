"use client";

import { Pinata } from "@/types";
import { getColorScheme } from "@/utils/colors";
import { truncateString } from "@/utils/common";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { doesPinataAcceptContributions } from "@/utils/pinatas";

export default function PinataCard({
  pinata,
  index,
}: {
  pinata: Pinata;
  index: number;
}) {
  console.log({ pinata });
  return (
    <Link
      href={`/app/pinatas/${pinata.$id}`}
      key={pinata.$id}
      className={`p-4 rounded-md border border-border hover:opacity-90 space-y-2 min-h-40 ${getColorScheme(
        index
      )}`}
    >
      <header className="flex flex-col gap-1">
        <h3 className="text-sm font-bold tracking-tight">
          {truncateString(pinata.title, 30)}
        </h3>
        <div className="flex gap-2">
          <Badge variant="destructive" className={cn()}>
            Opened
          </Badge>
          <Badge variant="default" className={cn()}>
            Contributions{" "}
            {doesPinataAcceptContributions(pinata) ? "Open" : "Closed"}
          </Badge>
        </div>
      </header>
      <p className="text-sm">
        {pinata.description
          ? truncateString(pinata.description, 200)
          : "No description."}
      </p>
    </Link>
  );
}
