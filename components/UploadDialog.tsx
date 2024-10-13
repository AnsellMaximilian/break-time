"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface UploadDialogProps {
  maxProgress: number;
  currentProgress: number;
  className?: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  message?: string;
  title?: string;
  description?: string;
}

export default function UploadDialog({
  maxProgress,
  title,
  description,
  currentProgress,
  className,
  onOpenChange,
  message,
  open,
}: UploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ? title : "Uploading Files"}</DialogTitle>
          <DialogDescription>
            {description
              ? description
              : "Uploading your contributions. Please be patient."}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Progress value={(currentProgress / maxProgress) * 100} />
          <p className="text-center mt-2">{message ?? "Uploading..."}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
