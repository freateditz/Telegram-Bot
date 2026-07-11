import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold leading-tight md:text-lg">
            {env.appName}
          </h1>
          <p className="hidden text-xs text-muted-foreground md:block">
            Manage your Telegram download resources
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-muted-foreground"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase text-secondary-foreground md:flex">
          AD
        </div>
      </div>
    </header>
  );
}
