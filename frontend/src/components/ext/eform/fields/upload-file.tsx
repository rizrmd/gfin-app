import { useCallback, useState, useEffect, type FC } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import {
  UploadCloud,
  FileText,
  FileImage,
  File,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useSnapshot } from "valtio";

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
};

type FileStatus = "pending" | "uploading" | "completed" | "error";

type FileWithPreview = File & {
  preview?: string;
  uploadProgress?: number;
  status?: FileStatus;
  error?: string;
};

type Props<
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
> = {
  name: K;
  multiple?: boolean;
  displayMode?: "text" | "thumbnail" | "list";
  mimeType?: Record<string, string[]>;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  onFilesChange?: (files: FileWithPreview[]) => void;
  // onUpload?: (files: FileWithPreview[]) => Promise<void>;
  onError?: (error: string, file: File) => void;
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  required?: boolean;
  uploadText?: string;
  uploadHint?: string;
  showPreviews?: boolean;
  showFileSize?: boolean;
  showClearButton?: boolean;
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/"))
    return <FileImage className="w-10 h-10 text-blue-500" />;
  if (type === "application/pdf")
    return <FileText className="w-10 h-10 text-red-500" />;
  if (type.includes("word"))
    return <FileText className="w-10 h-10 text-blue-700" />;
  if (type === "text/plain")
    return <FileText className="w-10 h-10 text-gray-600" />;
  return <File className="w-10 h-10 text-gray-500" />;
};

export const UploadFile = function <
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    multiple = false,
    displayMode = "text",
    mimeType = DEFAULT_ACCEPTED_TYPES,
    maxSize = DEFAULT_MAX_SIZE_MB,
    maxFiles,
    disabled = false,
    onFilesChange,
    onError,
    containerClassName,
    labelClassName,
    label,
    required,
    uploadText = "Click to select or drag & drop files",
    uploadHint = "Supports JPG, PNG, PDF, DOC, DOCX, PPT, PPTX",
    showPreviews = true,
    showFileSize = true,
    showClearButton = true,
  }: Props<K, V>
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  const files = (read as any)[name] || [];
  const setFiles = (newFiles: FileWithPreview[]) => {
    write[name] = newFiles;
    onFilesChange?.(newFiles);
  };

  // const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const maxSizeBytes = maxSize * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setDragActive(false);

      if (fileRejections.length > 0) {
        fileRejections.forEach(({ file, errors }) => {
          onError?.(errors.map((e) => e.message).join(", "), file);
        });
      }

      if (acceptedFiles.length > 0) {
        const filesWithPreview: FileWithPreview[] = acceptedFiles.map(
          (file) => {
            const fileWithPreview: FileWithPreview = Object.assign(file, {
              preview: file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : undefined,
              status: "pending" as FileStatus,
              uploadProgress: 0,
            });
            return fileWithPreview;
          }
        );

        const updatedFiles = multiple
          ? [...files, ...filesWithPreview].slice(0, maxFiles || Infinity)
          : filesWithPreview;

        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
      }
    },
    [files, multiple, maxFiles, onFilesChange, onError]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: mimeType,
    maxSize: maxSizeBytes,
    multiple,
    disabled: disabled,
    maxFiles,
  });

  const handleRemoveFile = (fileIndex: number) => {
    const newFiles = [...files];
    const [removedFile] = newFiles.splice(fileIndex, 1);

    if (removedFile.preview) {
      URL.revokeObjectURL(removedFile.preview);
    }

    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const handleClearAll = () => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    onFilesChange?.([]);
  };

  const handleOpenPreview = (file: FileWithPreview) => {
    if (file.preview) {
      window.open(file.preview, "_blank");
    }
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <UploadCloud
              className={`w-8 h-8 ${
                dragActive ? "text-blue-600" : "text-gray-500"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                dragActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {uploadText}
            </p>
            <p className="text-xs text-muted-foreground">
              {uploadHint} — max {maxSize}MB
            </p>
            {multiple && maxFiles && (
              <p className="text-xs text-muted-foreground">
                Max {maxFiles} file{maxFiles > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {showPreviews && files.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-700">
                Selected {multiple ? "files" : "file"} ({files.length})
              </h4>
              {showClearButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-800"
                >
                  Clear all
                </Button>
              )}
            </div>

            {displayMode === "text" || displayMode === "list" ? (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className={`
                        flex items-center justify-between p-2 rounded-md
                        ${file.status === "error" ? "bg-red-50" : "bg-gray-50"}
                      `}
                  >
                    <div className="flex items-center gap-3">
                      {displayMode === "list" && getFileIcon(file.type)}
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(file)}
                          className={`text-left text-sm font-medium ${
                            file.status === "error"
                              ? "text-red-600"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                        >
                          {file.name}
                        </button>
                        {showFileSize && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                            {file.status === "error" && file.error && (
                              <span className="text-red-500 ml-2">
                                {" "}
                                - {file.error}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === "uploading" &&
                        file.uploadProgress !== undefined && (
                          <Progress
                            value={file.uploadProgress}
                            className="w-24 h-2"
                          />
                        )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                        className="w-6 h-6 text-gray-500 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className={`
                        relative rounded-md border overflow-hidden
                        ${
                          file.status === "error"
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200"
                        }
                      `}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(file)}
                      className="w-full h-full flex flex-col items-center text-sm group"
                    >
                      {file.type.startsWith("image/") && file.preview ? (
                        <div className="relative w-full aspect-square">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {file.status === "uploading" && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
                          {getFileIcon(file.type)}
                          {file.status === "uploading" && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-2 w-full text-center truncate">
                        <p
                          className={`truncate ${
                            file.status === "error"
                              ? "text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          {file.name}
                        </p>
                        {showFileSize && (
                          <p className="text-xs text-muted-foreground truncate">
                            {formatFileSize(file.size)}
                          </p>
                        )}
                        {file.status === "error" && file.error && (
                          <p className="text-xs text-red-500 truncate">
                            {file.error}
                          </p>
                        )}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-white/80 hover:bg-white text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {file.status === "uploading" &&
                      file.uploadProgress !== undefined && (
                        <Progress
                          value={file.uploadProgress}
                          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-md"
                        />
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// // Example usage:
// <UploadFile
//   multiple
//   maxFiles={5}
//   maxSize={10}
//   displayMode="thumbnail"
//   onFilesChange={(files) => console.log("Files changed:", files)}
//   onUpload={async (files) => {
//     // Implement your actual upload logic here
//     console.log("Uploading files:", files);
//     // await new Promise((resolve) => setTimeout(resolve, 2000));
//   }}
//   onError={(error, file) =>
//     console.error(`Error with file ${file.name}:`, error)
//   }
//   uploadText="Drag & drop your project files here"
//   uploadHint="Supports JPG, PNG, PDF, DOC, DOCX, PPT, PPTX"
//   className="max-w-3xl"
//   accept={{
//     "image/jpeg": [".jpg", ".jpeg"],
//   }}
// />;

// const handleUpload = async (files) => {
//   console.log('Uploading images:', files);
//   // Your actual upload logic here
//   // Example using fetch:
//   try {
//     const formData = new FormData();
//     files.forEach(file => {
//       formData.append('images', file);
//     });

//     const response = await fetch('/api/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     if (!response.ok) throw new Error('Upload failed');

//     const result = await response.json();
//     console.log('Upload successful:', result);
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error; // This will trigger the onError handler
//   }
// };
