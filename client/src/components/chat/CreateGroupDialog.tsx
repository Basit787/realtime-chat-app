import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useCreateGroup } from "@/pages/chat/api/hooks";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { cn } from "@/lib/utils";

const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(64, "Group name must be at most 64 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional().default(""),
  members: z.array(z.string()).min(1, "Select at least one member"),
});

type CreateGroupValues = z.infer<typeof createGroupSchema>;

type CreateGroupDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const CreateGroupDialog = ({ open, onClose }: CreateGroupDialogProps) => {
  const username = useAuthStore((s) => s.username);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const knownContacts = useChatStore((s) => s.knownContacts);
  const createGroup = useCreateGroup();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    mode: "onTouched",
    defaultValues: { name: "", description: "", members: [] },
  });

  const candidates = useMemo(() => {
    const merged = new Set([...knownContacts, ...onlineUsers.filter((u) => u !== username)]);
    return [...merged].filter((u) => u !== username).sort((a, b) => a.localeCompare(b));
  }, [knownContacts, onlineUsers, username]);

  useEffect(() => {
    if (!open) return;
    form.reset({ name: "", description: "", members: [] });
  }, [open, form]);

  const handleClose = () => {
    if (createGroup.isPending) return;
    form.reset();
    onClose();
  };

  const onSubmit = (values: CreateGroupValues) => {
    createGroup.mutate(
      {
        name: values.name,
        members: values.members,
        description: values.description ?? "",
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      },
    );
  };

  const selectedMembers = form.watch("members");

  const toggleMember = (member: string) => {
    const current = form.getValues("members");
    const next = current.includes(member) ? current.filter((m) => m !== member) : [...current, member];
    form.setValue("members", next, { shouldValidate: true, shouldTouch: true });
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Create group" className="max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Project team"
                    maxLength={64}
                    className={cn("rounded-xl", form.formState.errors.name && "border-destructive")}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What is this group about?"
                    maxLength={500}
                    rows={2}
                    className="resize-none rounded-xl bg-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="members"
            render={() => (
              <FormItem>
                <FormLabel>Add members</FormLabel>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
                  {candidates.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No contacts available</p>
                  ) : (
                    candidates.map((member) => {
                      const isSelected = selectedMembers.includes(member);
                      const online = onlineUsers.includes(member);
                      return (
                        <Button
                          key={member}
                          type="button"
                          variant="ghost"
                          onClick={() => toggleMember(member)}
                          className={cn(
                            "h-auto w-full justify-start gap-3 rounded-none px-3 py-2.5 font-normal",
                            isSelected && "bg-accent/70 hover:bg-accent/70",
                          )}
                        >
                          <UserAvatar name={member} showOnline online={online} className="h-9 w-9" />
                          <div className="min-w-0">
                            <span className="text-sm font-medium">{member}</span>
                            <p className={cn("text-xs", online ? "text-online" : "text-muted-foreground")}>
                              {online ? "Online" : "Offline"}
                            </p>
                          </div>
                        </Button>
                      );
                    })
                  )}
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full rounded-xl" disabled={createGroup.isPending}>
            {createGroup.isPending ? "Creating…" : "Create group"}
          </Button>
        </form>
      </Form>
    </Dialog>
  );
}
