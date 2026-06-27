import { useState } from "react";
import { Download, FileText, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/format";
import { getFileCategory, type FileCategory } from "@/lib/files";
import { downloadFileAsAttachment, useFileBlob } from "@/lib/useFileBlob";
import { VoiceNotePlayer } from "@/components/chat/VoiceNotePlayer";
import type { MessageFile } from "@/pages/chat/api/api";
import { cn } from "@/lib/utils";

type FilePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  room: string;
  file: MessageFile;
};

const PreviewContent = ({
  category,
  blobUrl,
  filename,
  loading,
  error,
}: {
  category: FileCategory;
  blobUrl: string | null;
  filename: string;
  loading: boolean;
  error: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <FileText className="h-10 w-10" />
        <p className="text-sm">Could not load preview</p>
      </div>
    );
  }

  if (category === "image") {
    return (
      <div className="flex max-h-[70vh] items-center justify-center overflow-auto bg-black/20 p-4">
        <img src={blobUrl} alt={filename} className="max-h-[65vh] max-w-full rounded-lg object-contain" />
      </div>
    );
  }

  if (category === "video") {
    return (
      <div className="bg-black p-4">
        <video src={blobUrl} controls autoPlay className="max-h-[65vh] w-full rounded-lg" />
      </div>
    );
  }

  if (category === "pdf") {
    return (
      <iframe
        src={blobUrl}
        title={filename}
        className="h-[70vh] w-full border-0 bg-background"
      />
    );
  }

  if (category === "audio") {
    return (
      <div className="flex min-h-[120px] items-center justify-center p-6">
        <audio src={blobUrl} controls className="w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
    </div>
  );
}

export const FilePreviewModal = ({ open, onClose, room, file }: FilePreviewModalProps) => {
  const category = getFileCategory(file.mimeType);
  const { blobUrl, loading, error } = useFileBlob(room, file.id, open);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadFileAsAttachment(room, file.id, file.name);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={file.name} className="max-w-4xl">
      <PreviewContent
        category={category}
        blobUrl={blobUrl}
        filename={file.name}
        loading={loading}
        error={error}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleDownload()}
          disabled={downloading}
          className="gap-2"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download
        </Button>
      </div>
    </Dialog>
  );
}

type FileAttachmentProps = {
  room: string;
  file: MessageFile;
  caption?: string;
  isOwn?: boolean;
};

export const FileAttachment = ({ room, file, caption, isOwn }: FileAttachmentProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const category = getFileCategory(file.mimeType);
  const isMedia = category === "image" || category === "video" || category === "pdf";
  const isAudio = category === "audio";
  const isDocument = category === "document" || category === "other";
  const { blobUrl, loading } = useFileBlob(room, file.id, true);

  const handleClick = () => {
    if (isMedia) {
      setPreviewOpen(true);
      return;
    }
    if (blobUrl) {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isAudio) {
    return (
      <div className="relative px-1">
        <VoiceNotePlayer room={room} file={file} isOwn={isOwn} />
        {caption && caption !== file.name && <p className="mt-1 px-0.5 text-sm">{caption}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          disabled={isDocument && !blobUrl && loading}
          className={cn(
            "group h-auto w-full max-w-[220px] justify-start overflow-hidden rounded-xl p-0 text-left font-normal hover:opacity-90 disabled:opacity-60",
            isOwn ? "text-primary-foreground hover:bg-transparent" : "text-foreground hover:bg-transparent",
          )}
        >
        {category === "image" && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/20">
            {loading || !blobUrl ? (
              <div className="flex h-full min-h-[100px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin opacity-60" />
              </div>
            ) : (
              <img src={blobUrl} alt={file.name} className="h-full w-full object-cover" />
            )}
          </div>
        )}

        {category === "video" && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/30">
            {blobUrl && (
              <video src={blobUrl} muted preload="metadata" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
                <Play className="h-5 w-5 fill-white text-white" />
              </span>
            </div>
          </div>
        )}

        {(category === "pdf" || category === "document" || category === "other") && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-3",
              isOwn ? "bg-primary-foreground/10" : "bg-background/60",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isOwn ? "bg-primary-foreground/15" : "bg-muted",
              )}
            >
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs opacity-70">{formatFileSize(file.size)}</p>
            </div>
          </div>
        )}

        {caption && caption !== file.name && (
          <p className="mt-1.5 px-0.5 text-sm">{caption}</p>
        )}

        {isMedia && (
          <p className="mt-1 truncate px-0.5 text-xs opacity-70">{file.name}</p>
        )}
        </Button>
      </div>

      {isMedia && (
        <FilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} room={room} file={file} />
      )}
    </>
  );
}
