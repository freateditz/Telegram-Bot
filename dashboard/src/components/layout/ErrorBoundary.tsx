import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional section title shown when this boundary sits inside a page. */
  title?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Render-time error boundary. Catches uncaught exceptions in the
 * subtree, swaps in a recoverable error card, and re-throws nothing
 * — keeps the rest of the dashboard alive.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>
                {this.props.title ?? "Something went wrong"}
              </CardTitle>
              <CardDescription>
                An unexpected error occurred while rendering this section.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {this.state.error?.message ? (
              <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={this.handleReset}
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
