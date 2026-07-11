import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarContent } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen w-full bg-background text-foreground">
      <Sidebar />

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex animate-in slide-in-from-left duration-200">
            <div className="relative">
              <SidebarContent />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
