import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  FolderKanban,
  Settings,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { env } from "@/config/env";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/resources", label: "Resources", icon: Package },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/platforms", label: "Platforms", icon: Layers },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-sidebar-border md:bg-sidebar md:text-sidebar-foreground">
      <SidebarHeader />
      <SidebarNav />
      <Separator />
      <div className="px-6 py-4 text-xs text-muted-foreground">v1.0.0</div>
    </aside>
  );
}

/**
 * The mobile drawer reuses the same content as the desktop sidebar.
 * The desktop wrapper (`<aside>`) is hidden on small screens; the
 * mobile drawer mounts these pieces directly.
 */
export function SidebarContent() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader />
      <SidebarNav />
      <Separator />
      <div className="px-6 py-4 text-xs text-muted-foreground">v1.0.0</div>
    </div>
  );
}

function SidebarHeader() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">{env.appName}</span>
        <span className="text-xs text-muted-foreground">Telegram Bot</span>
      </div>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
