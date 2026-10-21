import { Button, MyUiAvatar, useAppForm } from "my-ui";
import { Camera, KeyRound, Trash2, User as UserIcon, type LucideIcon } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { LegalLinks } from "../../legal/legal-links";
import { DeleteAccountPage } from "./delete-account-page";
import { useAuth } from "./use-auth";

type AccountSettingsProps = {
  onSuccess?: (message: string) => void;
  onError?: (error: unknown, fallback: string) => void;
  // The page's own cards (status, theme, sign out…): shown before "Delete account", hidden on the delete screen
  children?: ReactNode;
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

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

// Photo, name, email, password and a link to account deletion, saved to the auth service for every app
export const AccountSettings = ({ onSuccess, onError, children }: AccountSettingsProps) => {
  const { user, client } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const avatar = client.avatarUrl(user?.image);

  const runTask = async (task: () => Promise<void>, success: string, fallback: string) => {
    setBusy(true);
    try {
      await task();
      onSuccess?.(success);
      return true;
    } catch (error) {
      onError?.(error, fallback);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const nameForm = useAppForm({
    defaultValues: { name: user?.name ?? "" },
    onSubmit: async ({ value, formApi }) => {
      const name = value.name.trim();
      if (await runTask(() => client.updateName(name), "Profile updated", "Could not update profile")) {
        formApi.reset({ name });
      }
    },
  });

  const emailForm = useAppForm({
    defaultValues: { email: user?.email ?? "" },
    onSubmit: async ({ value, formApi }) => {
      const email = value.email.trim();
      if (await runTask(() => client.changeEmail(email), "Email updated", "Could not update email")) {
        formApi.reset({ email });
      }
    },
  });

  const passwordForm = useAppForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validators: {
      onChange: ({ value }) => ({
        fields: {
          currentPassword: value.currentPassword ? undefined : "Enter your current password",
          newPassword: value.newPassword.length >= 8 ? undefined : "Password must be at least 8 characters",
          confirmPassword: value.confirmPassword === value.newPassword ? undefined : "Passwords do not match",
        },
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      const changed = await runTask(
        () => client.changePassword(value.currentPassword, value.newPassword),
        "Password changed",
        "Could not change password",
      );
      if (changed) formApi.reset();
    },
  });

  const uploadPhoto = (file: File | undefined) => {
    if (photoInput.current) photoInput.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError?.(null, "Please choose an image file");
    if (file.size > MAX_PHOTO_BYTES) return onError?.(null, "Image must be 5 MB or smaller");
    const form = new FormData();
    form.append("photo", file);
    void runTask(() => client.uploadAvatar(form), "Profile photo updated", "Could not upload photo");
  };

  if (deleting) return <DeleteAccountPage onBack={() => setDeleting(false)} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <MyUiAvatar name={user?.name ?? ""} src={avatar} className="size-24 text-2xl" />
          <Button
            type="button"
            size="icon"
            className="absolute right-0 bottom-0 size-8 rounded-full shadow-md"
            disabled={busy}
            onClick={() => photoInput.current?.click()}
            aria-label={avatar ? "Change profile photo" : "Upload profile photo"}
          >
            <Camera />
          </Button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadPhoto(e.target.files?.[0])}
          />
        </div>
        {avatar && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={busy}
            onClick={() => void runTask(client.removeAvatar, "Profile photo removed", "Could not remove photo")}
          >
            <Trash2 />
            Remove photo
          </Button>
        )}
      </div>

      <Section icon={UserIcon} title="Account details">
        <nameForm.AppForm>
          <nameForm.Form className="flex items-start gap-2">
            <nameForm.AppField
              name="name"
              validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Enter a display name") }}
            >
              {(field) => <field.TextField label="Display name" className="flex-1 [&_input]:rounded-xl" />}
            </nameForm.AppField>
            <nameForm.Subscribe selector={(state) => state.values.name.trim() === user?.name}>
              {(unchanged) => (
                <nameForm.SubmitButton size="sm" className="mt-[1.375rem] h-9 rounded-xl" disabled={unchanged || busy}>
                  Save
                </nameForm.SubmitButton>
              )}
            </nameForm.Subscribe>
          </nameForm.Form>
        </nameForm.AppForm>
        <emailForm.AppForm>
          <emailForm.Form className="mt-3 flex items-start gap-2">
            <emailForm.AppField
              name="email"
              validators={{
                onChange: ({ value }) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? undefined : "Enter a valid email"),
              }}
            >
              {(field) => <field.TextField label="Email" type="email" className="flex-1 [&_input]:rounded-xl" />}
            </emailForm.AppField>
            <emailForm.Subscribe selector={(state) => state.values.email.trim() === user?.email}>
              {(unchanged) => (
                <emailForm.SubmitButton size="sm" className="mt-[1.375rem] h-9 rounded-xl" disabled={unchanged || busy}>
                  Save
                </emailForm.SubmitButton>
              )}
            </emailForm.Subscribe>
          </emailForm.Form>
        </emailForm.AppForm>
      </Section>

      <Section icon={KeyRound} title="Password">
        <passwordForm.AppForm>
          <passwordForm.Form className="space-y-3">
            <passwordForm.AppField name="currentPassword">
              {(field) => <field.PasswordField placeholder="Current password" autoComplete="current-password" />}
            </passwordForm.AppField>
            <passwordForm.AppField name="newPassword">
              {(field) => (
                <field.PasswordField placeholder="New password (8+ characters)" autoComplete="new-password" />
              )}
            </passwordForm.AppField>
            <passwordForm.AppField name="confirmPassword">
              {(field) => <field.PasswordField placeholder="Confirm new password" autoComplete="new-password" />}
            </passwordForm.AppField>
            <passwordForm.SubmitButton size="sm" className="rounded-xl" disabled={busy}>
              Change password
            </passwordForm.SubmitButton>
          </passwordForm.Form>
        </passwordForm.AppForm>
      </Section>

      {children}

      <Button type="button" variant="destructive" className="w-full gap-2" onClick={() => setDeleting(true)}>
        <Trash2 className="h-4 w-4" />
        Delete account
      </Button>

      <LegalLinks />
    </div>
  );
};
