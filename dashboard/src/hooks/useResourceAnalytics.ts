import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useResourceAnalytics(resourceId: number) {
  return useQuery({
    queryKey: ["resourceAnalytics", resourceId],
    queryFn: async () => {
      const { data } = await api.get(`/api/analytics/resources/${resourceId}`);
      return data;
    },
    enabled: !!resourceId,
  });
}

export function useTopDownloadedResources() {
  return useQuery({
    queryKey: ["topDownloadedResources"],
    queryFn: async () => {
      const { data } = await api.get("/api/analytics/resources/top-downloaded");
      return data;
    },
  });
}
