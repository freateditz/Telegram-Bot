import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { channelService } from "@/services/channelService";
import type {
  Channel,
  ChannelInput,
  ChannelUpdateInput,
} from "@/types";

export function useChannels() {
  return useQuery({
    queryKey: queryKeys.channels.list(),
    queryFn: () => channelService.list(),
  });
}

function invalidateChannels(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.channels.all });
  // Projects expose channel data inline; any channel mutation can
  // change the displayed name/status of those projects.
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
}

function useCreateChannel(
  opts?: UseMutationOptions<Channel, Error, ChannelInput>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<Channel, Error, ChannelInput>({
    mutationFn: (input) => channelService.create(input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateChannels(queryClient);
      toast.success(`Channel "${data.name}" created`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create channel");
    },
  });
}

function useUpdateChannel(
  opts?: UseMutationOptions<
    Channel,
    Error,
    { id: number; input: ChannelUpdateInput }
  >
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<
    Channel,
    Error,
    { id: number; input: ChannelUpdateInput }
  >({
    mutationFn: ({ id, input }) => channelService.update(id, input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateChannels(queryClient);
      toast.success(`Channel "${data.name}" updated`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update channel");
    },
  });
}

function useDeleteChannel(
  opts?: UseMutationOptions<void, Error, number, { previous?: Channel[] }>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<void, Error, number, { previous?: Channel[] }>({
    mutationFn: (id) => channelService.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.channels.list(),
      });
      const previous = queryClient.getQueryData<Channel[]>(
        queryKeys.channels.list()
      );
      queryClient.setQueryData<Channel[]>(
        queryKeys.channels.list(),
        (old) => old?.filter((c) => c.id !== id)
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.channels.list(),
          context.previous
        );
      }
      // Most common failure: channel is referenced by projects.
      toast.error(error.message || "Failed to delete channel");
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateChannels(queryClient);
      toast.success("Channel deleted");
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export { useCreateChannel, useUpdateChannel, useDeleteChannel };
