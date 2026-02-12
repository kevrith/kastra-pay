'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We're sorry for the inconvenience. Please try again.
        </p>
        <Button onClick={reset} size="lg">
          Try again
        </Button>
      </div>
    </div>
  );
}
