"use client";

import { useState, useRef, useCallback } from "react";
import { useUpload } from "@/lib/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileImage, FileVideo, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete?: (result: {
    public_id: string;
    secure_url: string;
    url: string;
  }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function FileUpload({
  folder = "uploads",
  accept = "image/*,video/*,.pdf",
  maxSize = 10,
  onUploadComplete,
  onError,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress, error, reset } = useUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      onError?.(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setFileName(file.name);
    setFileType(file.type);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    // Upload file
    const result = await upload(file, folder);
    if (result) {
      onUploadComplete?.(result);
    } else if (error) {
      onError?.(error);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [folder]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setFileType(null);
    reset();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (!fileType) return <File className="h-8 w-8" />;
    if (fileType.startsWith("image/")) return <FileImage className="h-8 w-8" />;
    if (fileType.startsWith("video/")) return <FileVideo className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? handleClick : undefined}
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          isUploading && "cursor-not-allowed opacity-60"
        )}
      >
        {preview ? (
          <div className="relative w-full h-full min-h-[200px] p-4">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-[180px] rounded-lg object-contain"
            />
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-2 p-4">
            {getFileIcon()}
            <span className="text-sm text-muted-foreground">{fileName}</span>
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Drag & drop file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
