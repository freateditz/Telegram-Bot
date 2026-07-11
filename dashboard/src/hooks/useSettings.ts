import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { settingService } from "@/services/settingService";
import type { Setting, SettingInput } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.list(),
    queryFn: () => settingService.list(),
  });
}

function invalidateSettings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
}

function useCreateSetting(
  opts?: UseMutationOptions<Setting, Error, SettingInput>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<Setting, Error, SettingInput>({
    mutationFn: (input) => settingService.create(input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateSettings(queryClient);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create setting");
    },
  });
}

function useUpdateSetting(
  opts?: UseMutationOptions<
    Setting,
    Error,
    { id: number; input: Partial<SettingInput> }
  >
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<
    Setting,
    Error,
    { id: number; input: Partial<SettingInput> }
  >({
    mutationFn: ({ id, input }) => settingService.update(id, input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateSettings(queryClient);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update setting");
    },
  });
}

export { useCreateSetting, useUpdateSetting };
