import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { analyticsService } from "@/services/analyticsService";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: () => analyticsService.getOverview(),
  });
}

export function useAnalyticsDaily() {
  return useQuery({
    queryKey: queryKeys.analytics.daily(),
    queryFn: () => analyticsService.getDaily(),
  });
}

export function useAnalyticsProjects() {
  return useQuery({
    queryKey: queryKeys.analytics.projects(),
    queryFn: () => analyticsService.getProjects(),
  });
}

export function useAnalyticsTopProjects() {
  return useQuery({
    queryKey: queryKeys.analytics.topProjects(),
    queryFn: () => analyticsService.getTopProjects(),
  });
}

export function useAnalyticsRecentEvents() {
  return useQuery({
    queryKey: queryKeys.analytics.recentEvents(),
    queryFn: () => analyticsService.getRecentEvents(),
  });
}
