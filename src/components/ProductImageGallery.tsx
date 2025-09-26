"use client";

import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, RotateCw, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ProductImage } from '@/data/products';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  const selectedImage = images[selectedImageIndex] || images[0];
  const thumbnails = images.slice(0, 4); // Show max 4 thumbnails

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!isZoomed || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isZoomed]);

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const toggle360Mode = () => {
    setIs360Mode(!is360Mode);
    setIsZoomed(false);
    setRotation(0);
  };

  const handle360Drag = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!is360Mode) return;

    const sensitivity = 2;
    const deltaX = e.movementX;
    setRotation(prev => prev + deltaX * sensitivity);
  }, [is360Mode]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden aspect-square">
        <img
          ref={imageRef}
          src={selectedImage.url}
          alt={selectedImage.alt}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          } ${is360Mode ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{
            transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
            transform: is360Mode ? `rotate(${rotation}deg)` : undefined,
          }}
          onMouseMove={handleMouseMove}
          onClick={handleImageClick}
          onMouseDown={is360Mode ? handle360Drag : undefined}
          draggable={false}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white"
            onClick={toggle360Mode}
            title="360° View"
          >
            <RotateCw className={`h-4 w-4 ${is360Mode ? 'text-pink-600' : ''}`} />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/80 hover:bg-white"
                title="Full Screen"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full h-[80vh]">
              <div className="relative w-full h-full">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="w-full h-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Zoom Indicator */}
        {isZoomed && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            <ZoomIn className="h-3 w-3 inline mr-1" />
            Zoomed
          </div>
        )}

        {/* 360 Mode Indicator */}
        {is360Mode && (
          <div className="absolute bottom-2 left-2 bg-pink-600 text-white px-2 py-1 rounded text-xs">
            <RotateCw className="h-3 w-3 inline mr-1" />
            360° Mode - Drag to rotate
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {thumbnails.map((image, index) => (
            <button
              key={index}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImageIndex === index
                  ? 'border-pink-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}

          {images.length > 4 && (
            <div className="w-16 h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50 text-gray-500 text-xs">
              +{images.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Image Counter */}
      <div className="text-center text-sm text-gray-500">
        {selectedImageIndex + 1} of {images.length}
      </div>
    </div>
  );
}
