"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface Image {
  id: string;
  url: string;
  altText?: string | null;
}

interface ImageGalleryProps {
  images: Image[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
        <span className="text-6xl text-gray-300">📦</span>
      </div>
    );
  }

  const selected = images[selectedIndex];

  function prev() {
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        <div className="flex aspect-square items-center justify-center">
          <img
            src={selected.url}
            alt={selected.altText ?? `Image ${selectedIndex + 1}`}
            className="h-full w-full object-contain p-4"
          />
        </div>
        <button className="absolute left-2 top-2 rounded-lg bg-white/80 p-1.5 text-gray-700 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === selectedIndex
                  ? "border-[#ff9900]"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center bg-gray-50 sm:h-20 sm:w-20">
                <img
                  src={image.url}
                  alt={image.altText ?? `Miniature ${index + 1}`}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
