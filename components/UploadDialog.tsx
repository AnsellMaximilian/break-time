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
}

export default function UploadDialog({
  maxProgress,
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
          <DialogTitle>Uploading Files</DialogTitle>
          <DialogDescription>
            Uploading your contributions. Please be patient.
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
