'use client';

/**
 * Segment-level error boundary for the dashboard. Catches render-time throws
 * (e.g. an unexpected API response shape) so a broken page shows a recoverable
 * message instead of a blank screen or the raw Next.js error overlay.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        This page couldn&apos;t be displayed. You can try again, and if it keeps
        happening the server may be unavailable.
      </p>
      <button
        onClick={() => reset()}
        className="mt-5 inline-flex items-center gap-2 h-[38px] px-4 rounded-[9px] border border-[#ECE6DC] bg-white text-[12.5px] font-semibold text-[#6B6055] hover:bg-background"
      >
        Try again
      </button>
    </div>
  );
}
