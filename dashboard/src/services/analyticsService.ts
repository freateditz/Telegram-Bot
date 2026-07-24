import { api } from "@/lib/api";

export const analyticsService = {
  getOverview: async () => {
    const { data } = await api.get("/api/analytics/overview");
    return data;
  },
  getDaily: async () => {
    const { data } = await api.get("/api/analytics/daily");
    return data;
  },
  getProjects: async () => {
    const { data } = await api.get("/api/analytics/projects");
    return data;
  },
  getTopProjects: async () => {
    const { data } = await api.get("/api/analytics/top-projects");
    return data;
  },
  getRecentEvents: async () => {
    const { data } = await api.get("/api/analytics/recent-events");
    return data;
  },
};
