"use client";

interface LiveIndicatorProps {
  lastUpdated: Date | null;
}

export function LiveIndicator({ lastUpdated }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DC653] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DC653]" />
      </span>
      Live
      {lastUpdated && (
        <span className="text-[#94A3B8]">
          · updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
