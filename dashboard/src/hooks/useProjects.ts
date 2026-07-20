import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { projectService } from "@/services/projectService";
import type { Project, ProjectInput } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => projectService.list(),
  });
}

function invalidateProjects(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
}

function useCreateProject(
  opts?: UseMutationOptions<Project, Error, ProjectInput>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<Project, Error, ProjectInput>({
    mutationFn: (input) => projectService.create(input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjects(queryClient);
      toast.success(`Project "${data.title}" created`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

function useUpdateProject(
  opts?: UseMutationOptions<
    Project,
    Error,
    { id: number; input: Partial<ProjectInput> }
  >
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<
    Project,
    Error,
    { id: number; input: Partial<ProjectInput> }
  >({
    mutationFn: ({ id, input }) => projectService.update(id, input),
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjects(queryClient);
      toast.success(`Project "${data.title}" updated`);
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

function useDeleteProject(
  opts?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const userOnSuccess = opts?.onSuccess;
  return useMutation<void, Error, number, { previous?: Project[] }>({
    mutationFn: (id) => projectService.remove(id),
    ...opts,
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.list(),
      });
      const previous = queryClient.getQueryData<Project[]>(
        queryKeys.projects.list()
      );
      queryClient.setQueryData<Project[]>(
        queryKeys.projects.list(),
        (old) => old?.filter((p) => p.id !== id)
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.projects.list(),
          context.previous
        );
      }
      toast.error(error.message || "Failed to delete project");
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjects(queryClient);
      toast.success("Project deleted");
      userOnSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export { useCreateProject, useUpdateProject, useDeleteProject };
