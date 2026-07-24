import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProjectAnalytics(projectId: number) {
  return useQuery({
    queryKey: ["projectAnalytics", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/api/analytics/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
}
