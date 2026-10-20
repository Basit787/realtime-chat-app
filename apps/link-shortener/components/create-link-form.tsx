"use client";

import { Link2 } from "lucide-react";
import { PuiButton, PuiCard, PuiInput } from "pui";
import { useState, type FormEvent } from "react";
import { useCreateLink } from "@/lib/client/hooks/use-create-link";
import { createLinkSchema } from "@/lib/validation/create-link-schema";

type FieldErrors = Partial<Record<"url" | "slug" | "title", string>>;

export function CreateLinkForm() {
  const createLink = useCreateLink();
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = createLinkSchema.safeParse({ url, slug: slug || undefined, title: title || undefined });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({ url: fields.url?.[0], slug: fields.slug?.[0], title: fields.title?.[0] });
      return;
    }
    setErrors({});
    createLink.mutate(parsed.data, {
      onSuccess: () => {
        setUrl("");
        setSlug("");
        setTitle("");
      },
    });
  };

  return (
    <PuiCard title="Shorten a link" description="Paste a long URL; pick a custom short path or get a random one.">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-start" noValidate>
        <PuiInput
          label="Long URL"
          placeholder="https://example.com/a/very/long/path"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={errors.url}
          inputMode="url"
        />
        <PuiInput
          label="Custom path"
          placeholder="optional"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={errors.slug}
        />
        <PuiInput
          label="Title"
          placeholder="optional"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
        <PuiButton type="submit" loading={createLink.isPending} icon={<Link2 />} className="md:mt-[1.375rem]">
          Shorten
        </PuiButton>
      </form>
    </PuiCard>
  );
}
