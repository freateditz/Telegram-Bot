import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUserActivity() {
  return useQuery({
    queryKey: ["userActivity"],
    queryFn: async () => {
      const { data } = await api.get("/api/analytics/users/activity");
      return data;
    },
  });
}

export function useTopDownloaders() {
  return useQuery({
    queryKey: ["topDownloaders"],
    queryFn: async () => {
      const { data } = await api.get("/api/analytics/users/top-downloaders");
      return data;
    },
  });
}

export function useSearchUser(telegramId: string) {
  return useQuery({
    queryKey: ["searchUser", telegramId],
    queryFn: async () => {
      const { data } = await api.get(`/api/analytics/users/search/${telegramId}`);
      return data;
    },
    enabled: !!telegramId,
  });
}
