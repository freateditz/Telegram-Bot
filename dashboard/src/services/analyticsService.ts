import { api } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";

export const analyticsService = {
  getOverview: async () => {
    const { data } = await api.get(API_ROUTES.analytics.overview);
    return data;
  },
  getDaily: async () => {
    const { data } = await api.get(API_ROUTES.analytics.daily);
    return data;
  },
  getProjects: async () => {
    const { data } = await api.get(API_ROUTES.analytics.projects);
    return data;
  },
  getTopProjects: async () => {
    const { data } = await api.get(API_ROUTES.analytics.topProjects);
    return data;
  },
  getRecentEvents: async () => {
    const { data } = await api.get(API_ROUTES.analytics.recentEvents);
    return data;
  },
};
