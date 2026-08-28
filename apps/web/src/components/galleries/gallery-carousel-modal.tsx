"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface GalleryCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: any | null;
  onOpenUpload?: (gallery: any) => void;
}

type Photo = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  filename: string;
  category: string;
};

export function GalleryCarouselModal({
  isOpen,
  onClose,
  gallery,
}: GalleryCarouselModalProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch photos when modal opens
  const fetchPhotos = useCallback(async () => {
    if (!gallery?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/galleries/${gallery.id}/photos`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPhotos(data);
          setCurrentIndex(0);
          return;
        }
      }
      // If no photos in DB but gallery has a coverPhoto, display coverPhoto
      if (gallery.coverPhoto) {
        setPhotos([
          {
            id: "cover",
            url: gallery.coverPhoto,
            filename: gallery.title || "Cover Photo",
            category: "Cover",
          },
        ]);
        setCurrentIndex(0);
        return;
      }
      setPhotos([]);
    } catch (err) {
      console.error("Error loading gallery photos:", err);
      toast.error("Failed to load photo");
    } finally {
      setLoading(false);
    }
  }, [gallery?.id, gallery?.coverPhoto, gallery?.title]);

  useEffect(() => {
    if (isOpen && gallery) {
      fetchPhotos();
    }
  }, [isOpen, gallery, fetchPhotos]);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (photos.length === 0) return;

      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    },
    [isOpen, onClose, photos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !gallery) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 select-none animate-in fade-in duration-150"
    >
      {/* Top Floating Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition backdrop-blur-md"
        title="Close (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Floating Counter Badge (Top Left) */}
      {photos.length > 1 && (
        <div className="absolute top-5 left-5 z-50 text-xs font-mono text-white/70 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] max-w-[92vw] flex items-center justify-center"
      >
        {loading ? (
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
        ) : currentPhoto ? (
          <>
            {/* Previous Arrow Button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                }}
                className="absolute -left-3 sm:-left-12 z-40 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition border border-white/10 backdrop-blur-md hover:scale-110"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* The Pure Clean Image */}
            <img
              key={currentPhoto.id}
              src={currentPhoto.url}
              alt={currentPhoto.filename}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            />

            {/* Next Arrow Button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute -right-3 sm:-right-12 z-40 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition border border-white/10 backdrop-blur-md hover:scale-110"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-white/60">No image available</p>
        )}
      </div>
    </div>
  );
}
