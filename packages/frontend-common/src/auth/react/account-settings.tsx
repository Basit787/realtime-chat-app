import { Button, Input, Label, PasswordInput } from "pui";
import { KeyRound, ShieldAlert, User as UserIcon, type LucideIcon } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "./use-auth";

type AccountSettingsProps = {
  onSuccess?: (message: string) => void;
  onError?: (error: unknown, fallback: string) => void;
};

type SectionProps = { icon: LucideIcon; title: string; danger?: boolean; children: ReactNode };

const Section = ({ icon: Icon, title, danger, children }: SectionProps) => (
  <div
    className={
      danger
        ? "rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        : "rounded-xl border border-border bg-card/50 p-4"
    }
  >
    <div className="mb-3 flex items-center gap-2">
      <Icon className={danger ? "h-4 w-4 text-destructive" : "h-4 w-4 text-muted-foreground"} />
      <p className={danger ? "text-xs font-medium text-destructive" : "text-xs font-medium text-muted-foreground"}>
        {title}
      </p>
    </div>
    {children}
  </div>
);

// Name, email, password and account deletion, saved to the auth service for every app
export const AccountSettings = ({ onSuccess, onError }: AccountSettingsProps) => {
  const { user, client } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (event: FormEvent, task: () => Promise<void>, success: string, fallback: string) => {
    event.preventDefault();
    setBusy(true);
    try {
      await task();
      onSuccess?.(success);
    } catch (error) {
      onError?.(error, fallback);
    } finally {
      setBusy(false);
    }
  };

  const passwordError =
    newPassword && newPassword.length < 8
      ? "Password must be at least 8 characters"
      : confirmPassword && newPassword !== confirmPassword
        ? "Passwords do not match"
        : "";

  return (
    <div className="space-y-4">
      <Section icon={UserIcon} title="Account details">
        <form
          className="space-y-2"
          onSubmit={(e) =>
            void run(e, () => client.updateName(name.trim()), "Profile updated", "Could not update profile")
          }
        >
          <Label htmlFor="account-name">Display name</Label>
          <div className="flex gap-2">
            <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            <Button
              type="submit"
              size="sm"
              className="h-9 rounded-xl"
              disabled={!name.trim() || name.trim() === user?.name || busy}
            >
              Save
            </Button>
          </div>
        </form>
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) =>
            void run(e, () => client.changeEmail(email.trim()), "Email updated", "Could not update email")
          }
        >
          <Label htmlFor="account-email">Email</Label>
          <div className="flex gap-2">
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 rounded-xl"
              disabled={!email.trim() || email.trim() === user?.email || busy}
            >
              Save
            </Button>
          </div>
        </form>
      </Section>

      <Section icon={KeyRound} title="Password">
        <form
          className="space-y-3"
          onSubmit={(e) =>
            void run(
              e,
              async () => {
                await client.changePassword(currentPassword, newPassword);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              },
              "Password changed",
              "Could not change password",
            )
          }
        >
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            autoComplete="current-password"
          />
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            autoComplete="new-password"
          />
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
          <Button
            type="submit"
            size="sm"
            className="rounded-xl"
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || !!passwordError || busy}
          >
            Change password
          </Button>
        </form>
      </Section>

      <Section icon={ShieldAlert} title="Danger zone" danger>
        <p className="mb-3 text-xs text-muted-foreground">
          Permanently delete your account in every app. This cannot be undone.
        </p>
        <form
          className="space-y-3"
          onSubmit={(e) =>
            void run(e, () => client.deleteAccount(deletePassword), "Account deleted", "Could not delete account")
          }
        >
          <PasswordInput
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter your password to confirm"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            size="sm"
            variant="destructive"
            className="rounded-xl"
            disabled={!deletePassword || busy}
          >
            Delete account
          </Button>
        </form>
      </Section>
    </div>
  );
};
