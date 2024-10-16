import { ApiResponse, RemoteData, RemoteDataWithSetter } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { formatDistanceToNow } from "date-fns";

export function createErrorResponse(message: string): Response {
  const res: ApiResponse<null> = {
    data: null,
    success: false,
    message: message,
    note: message,
  };

  return Response.json(res);
}

export function createSuccessResponse<T>(
  data: T,
  message: string = ""
): Response {
  const res: ApiResponse<T> = {
    data,
    success: true,
    message,
    note: message,
  };

  return Response.json(res);
}

export function getDefaultRemoteData<T>(data: T): RemoteData<T> {
  return {
    isLoading: false,
    data,
  };
}

export function getRemoteDataWithSetter<T>(
  remoteData: RemoteData<T>,
  setter: Dispatch<SetStateAction<RemoteData<T>>>
): RemoteDataWithSetter<T> {
  return { ...remoteData, setData: setter };
}

export function setRemoteDataLoading<T>(
  setter: Dispatch<SetStateAction<RemoteData<T>>>,
  value: boolean
) {
  setter((prev) => ({ ...prev, isLoading: value }));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function timeSince(now: string): string {
  const nowDate = new Date(now);

  return formatDistanceToNow(nowDate, { addSuffix: true });
}

export function checkFileType(
  file: File,
  allowedFileTypes: string[] = ["png", "jpeg", "jpeg"]
) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (fileType && allowedFileTypes.includes(fileType)) return true;
  }
  return false;
}
export function truncateString(str: string, maxLength: number = 25): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
}

export function hasDatePassed(dateString: string): boolean {
  const dateToTest = new Date(dateString);
  const today = new Date();

  return today > dateToTest;
}

export const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};
