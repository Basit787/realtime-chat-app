import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateProfileName } from "@/pages/auth/api/profile-hooks";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { cn } from "@/lib/utils";

const nameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(32, "Display name must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, underscores, and hyphens only"),
});

type NameValues = z.infer<typeof nameSchema>;

export const ProfileNameForm = () => {
  const username = useAuthStore((s) => s.username);
  const updateName = useUpdateProfileName();

  const form = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    mode: "onTouched",
    defaultValues: { name: username },
    values: { name: username },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateName.mutate(values.name))} className="space-y-3" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input
                  className={cn("rounded-xl", form.formState.errors.name && "border-destructive")}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" className="rounded-xl" disabled={updateName.isPending}>
          Save name
        </Button>
      </form>
    </Form>
  );
}
