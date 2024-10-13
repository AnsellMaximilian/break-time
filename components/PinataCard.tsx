"use client";

import { Pinata } from "@/types";
import { getColorScheme } from "@/utils/colors";
import { truncateString } from "@/utils/common";
import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { doesPinataAcceptContributions } from "@/utils/pinatas";
import { Button } from "./ui/button";
import { FaTrash } from "react-icons/fa";
import ConfirmDialog from "./ConfirmDialog";

export default function PinataCard({
  pinata,
  index,
  setPinataToDelete,
}: {
  pinata: Pinata;
  index: number;
  setPinataToDelete: React.Dispatch<React.SetStateAction<Pinata | null>>;
}) {
  return (
    <>
      <Link
        href={`/app/pinatas/${pinata.$id}`}
        key={pinata.$id}
        className={`p-4 rounded-md border border-border hover:opacity-90 space-y-2 min-h-40 group ${getColorScheme(
          index
        )}`}
      >
        <header className="flex flex-col gap-1 relative">
          <h3 className="text-sm font-bold tracking-tight">
            {truncateString(pinata.title, 30)}
          </h3>
          <Button
            size="icon"
            variant="destructive"
            className="top-0 right-0 absolute group-hover:flex hidden"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setPinataToDelete(pinata);
            }}
          >
            <FaTrash />
          </Button>

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
    </>
  );
}
