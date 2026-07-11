import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Code-split every page so the initial bundle stays small. Each
 * page lives in its own chunk and loads on demand.
 */
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const ResourcesPage = lazy(() =>
  import("@/pages/ResourcesPage").then((m) => ({ default: m.ResourcesPage }))
);
const CategoriesPage = lazy(() =>
  import("@/pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage }))
);
const PlatformsPage = lazy(() =>
  import("@/pages/PlatformsPage").then((m) => ({ default: m.PlatformsPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function PageFallback() {
  return (
    <div className="space-y-4 p-2">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: "resources", element: withSuspense(<ResourcesPage />) },
      { path: "categories", element: withSuspense(<CategoriesPage />) },
      { path: "platforms", element: withSuspense(<PlatformsPage />) },
      { path: "settings", element: withSuspense(<SettingsPage />) },
      { path: "404", element: withSuspense(<NotFoundPage />) },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);
