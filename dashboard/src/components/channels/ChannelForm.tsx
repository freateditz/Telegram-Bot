import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SubmitActions } from "@/components/ui/submit-actions";
import { Switch } from "@/components/ui/switch";

import {
  channelFormSchema,
  type ChannelFormValues,
} from "@/lib/channelSchema";
import type { Channel } from "@/types";

interface ChannelFormProps {
  defaultValues?: Channel;
  onSubmit: (values: ChannelFormValues) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
}

const EMPTY_DEFAULTS: ChannelFormValues = {
  name: "",
  channelId: "",
  username: "",
  isActive: true,
};

export function ChannelForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  onCancel,
}: ChannelFormProps) {
  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: defaultValues ? mapChannelToForm(defaultValues) : EMPTY_DEFAULTS,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Reflect the `isActive` boolean in the Switch. RHF doesn't auto-sync
  // non-registered controlled inputs, so we mirror the field value here.
  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Field
        label="Channel Name"
        id="name"
        error={errors.name?.message}
        hint="Display name shown across the dashboard."
      >
        <Input
          id="name"
          placeholder="AE Resources"
          autoComplete="off"
          {...register("name")}
        />
      </Field>

      <Field
        label="Channel ID"
        id="channelId"
        error={errors.channelId?.message}
        hint="Numeric chat id of the Telegram channel. Starts with -100 (e.g. -1002948573940)."
      >
        <Input
          id="channelId"
          placeholder="-1002948573940"
          autoComplete="off"
          inputMode="numeric"
          {...register("channelId")}
        />
      </Field>

      <Field
        label="Username (optional)"
        id="username"
        error={errors.username?.message}
        hint="Public @username of the channel, without the @."
      >
        <Input
          id="username"
          placeholder="FreatEditzResources"
          autoComplete="off"
          {...register("username")}
        />
      </Field>

      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={Boolean(isActive)}
          onCheckedChange={(value) =>
            setValue("isActive", value, { shouldDirty: true })
          }
        />
        <label className="text-sm font-medium" htmlFor="isActive">
          Active
        </label>
        <span className="text-xs text-muted-foreground">
          Inactive channels are excluded from new projects.
        </span>
      </div>

      <SubmitActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </form>
  );
}

function mapChannelToForm(channel: Channel): ChannelFormValues {
  return {
    name: channel.name,
    channelId: channel.channelId,
    username: (channel.username || "").replace(/^@/, ""),
    isActive: channel.isActive,
  };
}
