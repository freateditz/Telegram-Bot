import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  disabled?: boolean;
}

/**
 * Standard "Cancel / Save" pair used at the bottom of every form in
 * the dashboard. Wired for both RHF (`isSubmitting`) and disabled
 * states.
 */
export function SubmitActions({
  isSubmitting,
  submitLabel,
  submittingLabel = "Saving...",
  onCancel,
  cancelLabel = "Cancel",
  disabled = false,
}: SubmitActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
      {onCancel ? (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      ) : null}
      <Button type="submit" disabled={isSubmitting || disabled}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {submittingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
