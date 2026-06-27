import { useRef } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useProfile } from "@/pages/auth/api/profile-hooks";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import type { UserStatus } from "@/pages/chat/store/chat-store";

type ProfilePhotoEditorProps = {
  username: string;
  userStatus: UserStatus;
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const ProfilePhotoEditor = ({ username, userStatus }: ProfilePhotoEditorProps) => {
  const profileImage = useAuthStore((s) => s.profileImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, deleteAvatar } = useProfile();

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastError(null, "Please choose an image file");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toastError(null, "Image must be 5 MB or smaller");
      return;
    }
    uploadAvatar.mutate(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const busy = uploadAvatar.isPending || deleteAvatar.isPending;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <UserAvatar
          name={username}
          imageUrl={profileImage}
          showOnline
          status={userStatus}
          avatarClassName="h-24 w-24 [&_span]:text-2xl"
        />
        <Button
          type="button"
          size="icon"
          className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-md"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          aria-label="Upload profile photo"
        >
          {uploadAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {profileImage && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 gap-2 text-muted-foreground"
          disabled={busy}
          onClick={() => deleteAvatar.mutate()}
        >
          {deleteAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Remove photo
        </Button>
      )}
    </div>
  );
}
