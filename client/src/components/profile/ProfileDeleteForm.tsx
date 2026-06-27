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
import { PasswordInput } from "@/components/ui/password-input";
import { useDeleteAccount } from "@/pages/auth/api/profile-hooks";
import { cn } from "@/lib/utils";

const deleteSchema = z
  .object({
    password: z.string().min(1, "Password is required"),
    confirmText: z.string().trim().min(1, 'Type "DELETE" to confirm'),
  })
  .refine((data) => data.confirmText === "DELETE", {
    message: 'Type "DELETE" to confirm',
    path: ["confirmText"],
  });

type DeleteValues = z.infer<typeof deleteSchema>;

export const ProfileDeleteForm = () => {
  const removeAccount = useDeleteAccount();

  const form = useForm<DeleteValues>({
    resolver: zodResolver(deleteSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmText: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => removeAccount.mutate(values.password))}
        className="space-y-3"
        noValidate
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={form.formState.errors.password ? "border-destructive" : undefined}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type DELETE to confirm</FormLabel>
              <FormControl>
                <Input
                  placeholder="DELETE"
                  className={cn("rounded-xl", form.formState.errors.confirmText && "border-destructive")}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" variant="destructive" className="rounded-xl" disabled={removeAccount.isPending}>
          Delete account
        </Button>
      </form>
    </Form>
  );
}
