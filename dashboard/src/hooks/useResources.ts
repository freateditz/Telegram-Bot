import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { resourceService } from "@/services/resourceService";
import type {
  Resource,
  ResourceInput,
  ResourceUpdateInput,
} from "@/types";

/* ------------------------------------------------------------------ */
/* Query                                                              */
/* ------------------------------------------------------------------ */

export function useResources() {
  return useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => resourceService.list(),
  });
}

/* ------------------------------------------------------------------ */
/* Mutations                                                          */
/* ------------------------------------------------------------------ */

/**
 * React Query's `onSuccess` callback takes four arguments in v5:
 * `(data, variables, onMutateResult, context)`. We pass them through
 * so user-supplied callbacks still receive everything the library
 * promises — but most of the time callers only need `onSuccess(data)`.
 */

function invalidateResources(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
}

function useCreateResource(
  opts?: UseMutationOptions<Resource, Error, ResourceInput>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<Resource, Error, ResourceInput>({
    mutationFn: (input) => resourceService.create(input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateResources(queryClient);
      toast.success(`Resource "${data.name}" created`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create resource");
    },
  });
}

function useUpdateResource(
  opts?: UseMutationOptions<
    Resource,
    Error,
    { id: number; input: ResourceUpdateInput }
  >
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<
    Resource,
    Error,
    { id: number; input: ResourceUpdateInput }
  >({
    mutationFn: ({ id, input }) => resourceService.update(id, input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateResources(queryClient);
      toast.success(`Resource "${data.name}" updated`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update resource");
    },
  });
}

function useDeleteResource(
  opts?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<void, Error, number>({
    mutationFn: (id) => resourceService.remove(id),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateResources(queryClient);
      toast.success("Resource deleted");
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete resource");
    },
  });
}

function useToggleResourceVisible() {
  const queryClient = useQueryClient();
  return useMutation<
    Resource,
    Error,
    { id: number; isVisible: boolean; previous?: Resource },
    { previous?: Resource }
  >({
    mutationFn: ({ id, isVisible }) =>
      resourceService.update(id, { isVisible }),
    onMutate: async (variables) => {
      // Optimistically flip the row so the toggle feels instant.
      await queryClient.cancelQueries({
        queryKey: queryKeys.resources.list(),
      });
      const previous =
        queryClient
          .getQueryData<Resource[]>(queryKeys.resources.list())
          ?.find((r) => r.id === variables.id) ?? variables.previous;
      queryClient.setQueryData<Resource[]>(
        queryKeys.resources.list(),
        (old) =>
          old?.map((r) =>
            r.id === variables.id
              ? { ...r, isVisible: variables.isVisible }
              : r
          )
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Resource[]>(
          queryKeys.resources.list(),
          (old) =>
            old?.map((r) =>
              r.id === context.previous!.id ? context.previous! : r
            )
        );
      }
      toast.error(error.message || "Failed to update visibility");
    },
    onSettled: () => {
      // Always refetch in the background to converge with the server.
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
    },
  });
}

export {
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useToggleResourceVisible,
};
