import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

/**
 * Search input with a left-aligned magnifier icon. Used in filter bars
 * across the dashboard.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, ...props }, ref) {
    return (
      <div className={cn("relative flex-1 sm:max-w-sm", className)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={ref}
          type="search"
          {...props}
          className="pl-9"
        />
      </div>
    );
  }
);
