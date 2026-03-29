"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive mb-4">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={() => unstable_retry()} size="lg">
          Try again
        </Button>
      </div>
    </div>
  );
}
