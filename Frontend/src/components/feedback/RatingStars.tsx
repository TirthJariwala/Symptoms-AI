"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  onChange: (v: number) => void;
}

export function RatingStars({ value, onChange }: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className="w-7 h-7 transition-all"
            fill={(hovered || value) >= n ? "#F4A261" : "none"}
            stroke={(hovered || value) >= n ? "#F4A261" : "#CBD5E1"}
            strokeWidth={1.5}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-[13px] text-[#64748B]">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}