import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { platformService } from "@/services/platformService";
import type { Platform, PlatformInput } from "@/types";

export function usePlatforms() {
  return useQuery({
    queryKey: queryKeys.platforms.list(),
    queryFn: () => platformService.list(),
  });
}

function invalidatePlatforms(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all });
}

function useCreatePlatform(
  opts?: UseMutationOptions<Platform, Error, PlatformInput>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<Platform, Error, PlatformInput>({
    mutationFn: (input) => platformService.create(input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidatePlatforms(queryClient);
      toast.success(`Platform "${data.name}" created`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create platform");
    },
  });
}

function useUpdatePlatform(
  opts?: UseMutationOptions<
    Platform,
    Error,
    { id: number; input: Partial<PlatformInput> }
  >
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<
    Platform,
    Error,
    { id: number; input: Partial<PlatformInput> }
  >({
    mutationFn: ({ id, input }) => platformService.update(id, input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidatePlatforms(queryClient);
      toast.success(`Platform "${data.name}" updated`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update platform");
    },
  });
}

function useDeletePlatform(
  opts?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<void, Error, number, { previous?: Platform[] }>({
    mutationFn: (id) => platformService.remove(id),
    ...opts,
    onMutate: async (id) => {
      // Optimistically remove the row so the UI feels instant.
      await queryClient.cancelQueries({
        queryKey: queryKeys.platforms.list(),
      });
      const previous = queryClient.getQueryData<Platform[]>(
        queryKeys.platforms.list()
      );
      queryClient.setQueryData<Platform[]>(
        queryKeys.platforms.list(),
        (old) => old?.filter((p) => p.id !== id)
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      // Roll back the optimistic removal.
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.platforms.list(),
          context.previous
        );
      }
      // Most common failure: platform is referenced by resources
      // (Prisma's onDelete: Restrict). Surface the server's message.
      toast.error(error.message || "Failed to delete platform");
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidatePlatforms(queryClient);
      toast.success("Platform deleted");
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export { useCreatePlatform, useUpdatePlatform, useDeletePlatform };
