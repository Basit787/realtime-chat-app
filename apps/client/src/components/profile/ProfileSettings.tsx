import { KeyRound, ShieldAlert, User as UserIcon } from "lucide-react";
import { ProfileDeleteForm } from "@/components/profile/ProfileDeleteForm";
import { ProfileEmailForm } from "@/components/profile/ProfileEmailForm";
import { ProfileNameForm } from "@/components/profile/ProfileNameForm";
import { ProfilePasswordForm } from "@/components/profile/ProfilePasswordForm";

export const ProfileSettings = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">Account details</p>
        </div>
        <ProfileNameForm />
        <ProfileEmailForm />
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">Password</p>
        </div>
        <ProfilePasswordForm />
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <p className="text-xs font-medium text-destructive">Danger zone</p>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <ProfileDeleteForm />
      </div>
    </div>
  );
}
