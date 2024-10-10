import { IconType } from "react-icons";
import {
  FaFilePdf,
  FaFileImage,
  FaFileAudio,
  FaFileVideo,
  FaFileAlt,
  FaFileWord,
  FaFileExcel,
  FaFileArchive,
  FaFileCode,
  FaFile,
} from "react-icons/fa";
export const fileTypeIcons: Record<string, IconType> = {
  "application/pdf": FaFilePdf, // PDF files
  "image/jpeg": FaFileImage, // JPEG images
  "image/png": FaFileImage, // PNG images
  "image/gif": FaFileImage, // GIF images
  "image/webp": FaFileImage, // WebP images
  "audio/mpeg": FaFileAudio, // MP3 audio files
  "audio/wav": FaFileAudio, // WAV audio files
  "audio/ogg": FaFileAudio, // OGG audio files
  "video/mp4": FaFileVideo, // MP4 video files
  "video/webm": FaFileVideo, // WebM video files
  "text/plain": FaFileAlt, // Plain text files
  "text/html": FaFileCode, // HTML files
  "text/css": FaFileCode, // CSS files
  "application/json": FaFileCode, // JSON files
  "application/vnd.ms-excel": FaFileExcel, // Excel files (xls)
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    FaFileExcel, // Excel files (xlsx)
  "application/msword": FaFileWord, // Word files (doc)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    FaFileWord, // Word files (docx)
  "application/zip": FaFileArchive, // ZIP files
  "application/x-rar-compressed": FaFileArchive, // RAR files
  "application/octet-stream": FaFileAlt, // Binary or unknown file type
};
export const UnknownFileIcon = FaFile;
