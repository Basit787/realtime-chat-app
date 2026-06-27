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
import { useUpdateEmail } from "@/pages/auth/api/profile-hooks";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { cn } from "@/lib/utils";

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

type EmailValues = z.infer<typeof emailSchema>;

export const ProfileEmailForm = () => {
  const email = useAuthStore((s) => s.email);
  const updateEmail = useUpdateEmail();

  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    mode: "onTouched",
    defaultValues: { email },
    values: { email },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => updateEmail.mutate(values.email))}
        className="mt-4 space-y-3 border-t border-border pt-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn("rounded-xl", form.formState.errors.email && "border-destructive")}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" className="rounded-xl" disabled={updateEmail.isPending}>
          Save email
        </Button>
      </form>
    </Form>
  );
}
