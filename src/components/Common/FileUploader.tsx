import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaTimes, FaFilePdf, FaImage } from "react-icons/fa";
import { MAX_FILES_PER_BILL, MAX_FILE_SIZE_BYTES } from "@/utils/constants";
import { formatBytes } from "@/utils/formatters";
import { Button } from "@/components/ui/button";

export interface PendingFile {
  id: string;
  file: File;
  previewUrl?: string;
}

interface Props {
  files: PendingFile[];
  onChange: (files: PendingFile[]) => void;
  disabled?: boolean;
}

export function FileUploader({ files, onChange, disabled }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".heic", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: MAX_FILES_PER_BILL - files.length,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled,
    onDrop: (accepted) => {
      const next = accepted.slice(0, MAX_FILES_PER_BILL - files.length).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }));
      onChange([...files, ...next]);
    },
  });

  function remove(id: string) {
    onChange(files.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps({
          className: `flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/50"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`,
        })}
      >
        <input {...getInputProps()} />
        <FaCloudUploadAlt className="mb-2 text-3xl text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {isDragActive ? "Drop files here" : "Drag & drop bills, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, HEIC, PDF · up to {MAX_FILES_PER_BILL} files · 10MB each
        </p>
      </div>

      {files.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f) => (
            <li
              key={f.id}
              className="group relative flex flex-col rounded-lg border border-border bg-card p-2"
            >
              <div className="flex h-24 items-center justify-center overflow-hidden rounded bg-muted">
                {f.previewUrl ? (
                  <img
                    src={f.previewUrl}
                    alt={f.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaFilePdf className="text-3xl text-destructive" />
                )}
              </div>
              <div className="mt-2 flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{f.file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatBytes(f.file.size)}</p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => remove(f.id)}
                  aria-label={`Remove ${f.file.name}`}
                >
                  <FaTimes />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AttachmentThumb({
  thumb,
  mime,
  fileName,
}: {
  thumb?: string;
  mime: string;
  fileName: string;
}) {
  if (thumb) {
    return (
      <img
        src={thumb}
        alt={fileName}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      {mime.includes("pdf") ? <FaFilePdf className="text-3xl" /> : <FaImage className="text-3xl" />}
    </div>
  );
}