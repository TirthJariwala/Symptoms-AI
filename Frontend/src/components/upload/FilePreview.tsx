"use client";

import { X, ZoomIn } from "lucide-react";

interface FilePreviewProps {
  src: string;
  name: string;
  onRemove?: () => void;
}

export function FilePreview({ src, name, onRemove }: FilePreviewProps) {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-[#E2E8F0] bg-black aspect-square">
      <img src={src} alt={name} className="w-full h-full object-contain" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2">
        <p className="text-white text-[11px] truncate">{name}</p>
      </div>
    </div>
  );
}   