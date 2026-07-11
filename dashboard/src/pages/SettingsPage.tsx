import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/layout/PageHeader";

import { settingsFormSchema, type SettingsFormValues } from "@/lib/settingsSchema";
import {
  useCreateSetting,
  useSettings,
  useUpdateSetting,
} from "@/hooks/useSettings";
import type { Setting } from "@/types";

const STORAGE_KEYS = [
  "botName",
  "youtubeLink",
  "channelLink",
  "supportLink",
  "adminNotes",
] as const;

type StorageKey = (typeof STORAGE_KEYS)[number];

const DEFAULTS: SettingsFormValues = {
  botName: "",
  youtubeLink: "",
  channelLink: "",
  supportLink: "",
  adminNotes: "",
};

const FIELD_LABELS: Record<StorageKey, { label: string; helper: string; placeholder: string; multiline?: boolean }> = {
  botName: {
    label: "Bot Name",
    helper: "Public display name of your Telegram bot.",
    placeholder: "FreatEditz Bot",
  },
  youtubeLink: {
    label: "YouTube Channel",
    helper: "Public link to your YouTube channel.",
    placeholder: "https://youtube.com/@your_channel",
  },
  channelLink: {
    label: "Telegram Channel",
    helper: "Channel the bot points users toward.",
    placeholder: "@your_channel or https://t.me/your_channel",
  },
  supportLink: {
    label: "Support Link",
    helper: "Where users can ask for help.",
    placeholder: "https://t.me/your_support",
  },
  adminNotes: {
    label: "Admin Notes",
    helper: "Internal notes for the team. Not shown to Telegram users.",
    placeholder: "Anything you want to remember about this bot's setup...",
    multiline: true,
  },
};

export function SettingsPage() {
  const settingsQuery = useSettings();
  const create = useCreateSetting();
  const update = useUpdateSetting();

  const [saveError, setSaveError] = useState<string | null>(null);

  // Build a `key → row` map once settings are loaded.
  const settingsByKey = useMemo(() => {
    const map = new Map<StorageKey, Setting>();
    (settingsQuery.data ?? []).forEach((s) => {
      if ((STORAGE_KEYS as readonly string[]).includes(s.key)) {
        map.set(s.key as StorageKey, s);
      }
    });
    return map;
  }, [settingsQuery.data]);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  // Re-seed the form whenever fresh data arrives (and we aren't mid-edit).
  useEffect(() => {
    if (!settingsQuery.data) return;
    reset({
      botName: settingsByKey.get("botName")?.value ?? "",
      youtubeLink: settingsByKey.get("youtubeLink")?.value ?? "",
      channelLink: settingsByKey.get("channelLink")?.value ?? "",
      supportLink: settingsByKey.get("supportLink")?.value ?? "",
      adminNotes: settingsByKey.get("adminNotes")?.value ?? "",
    });
  }, [settingsByKey, settingsQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    let updated = 0;
    let created = 0;
    try {
      // For each known key, PATCH the existing row or POST a new one.
      // Sequential to surface per-key errors clearly.
      for (const key of STORAGE_KEYS) {
        const value = (values[key] ?? "").trim();
        const existing = settingsByKey.get(key);

        if (existing) {
          if (existing.value !== value) {
            await update.mutateAsync({ id: existing.id, input: { value } });
            updated += 1;
          }
        } else if (value) {
          await create.mutateAsync({ key, value });
          created += 1;
        }
      }
      if (updated + created > 0) {
        toast.success(
          `Settings saved (${updated} updated, ${created} created)`
        );
      } else {
        toast.success("Settings saved");
      }
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    }
  });

  if (settingsQuery.isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Bot name, channels, and support links shown to your users."
      />

      <form
        onSubmit={onSubmit}
        className="space-y-6"
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>Public settings</CardTitle>
            <CardDescription>
              These values are persisted via{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                /api/settings
              </code>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {STORAGE_KEYS.map((key) => {
              const meta = FIELD_LABELS[key];
              return (
                <Field
                  key={key}
                  label={meta.label}
                  id={key}
                  hint={meta.helper}
                  error={errors[key]?.message}
                >
                  {meta.multiline ? (
                    <Textarea
                      id={key}
                      placeholder={meta.placeholder}
                      rows={4}
                      {...register(key)}
                    />
                  ) : (
                    <Input
                      id={key}
                      placeholder={meta.placeholder}
                      autoComplete="off"
                      {...register(key)}
                    />
                  )}
                </Field>
              );
            })}
          </CardContent>
        </Card>

        {saveError ? (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset(DEFAULTS)}
            disabled={isSubmitting || !isDirty}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
