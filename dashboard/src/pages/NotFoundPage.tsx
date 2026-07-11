import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Page not found
        </h2>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/resources">Browse Resources</Link>
        </Button>
      </div>
    </div>
  );
}
