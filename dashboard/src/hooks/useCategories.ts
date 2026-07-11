import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { categoryService } from "@/services/categoryService";
import type { Category, CategoryInput } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoryService.list(),
  });
}

function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
}

function useCreateCategory(
  opts?: UseMutationOptions<Category, Error, CategoryInput>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<Category, Error, CategoryInput>({
    mutationFn: (input) => categoryService.create(input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateCategories(queryClient);
      toast.success(`Category "${data.name}" created`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

function useUpdateCategory(
  opts?: UseMutationOptions<
    Category,
    Error,
    { id: number; input: Partial<CategoryInput> }
  >
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<
    Category,
    Error,
    { id: number; input: Partial<CategoryInput> }
  >({
    mutationFn: ({ id, input }) => categoryService.update(id, input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateCategories(queryClient);
      toast.success(`Category "${data.name}" updated`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

function useDeleteCategory(
  opts?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<void, Error, number, { previous?: Category[] }>({
    mutationFn: (id) => categoryService.remove(id),
    ...opts,
    onMutate: async (id) => {
      // Optimistically remove the row so the UI feels instant.
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.list(),
      });
      const previous = queryClient.getQueryData<Category[]>(
        queryKeys.categories.list()
      );
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.list(),
        (old) => old?.filter((c) => c.id !== id)
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      // Roll back the optimistic removal.
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.categories.list(),
          context.previous
        );
      }
      // Most common failure: category is referenced by resources
      // (Prisma's onDelete: Restrict). Surface the server's message.
      toast.error(error.message || "Failed to delete category");
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateCategories(queryClient);
      toast.success("Category deleted");
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export { useCreateCategory, useUpdateCategory, useDeleteCategory };
