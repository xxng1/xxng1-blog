"use client";

import { useEffect } from 'react';
import Image from 'next/image';

interface CertificationImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: {
    title: string;
    issuer: string;
    imageSrc: string;
    imageAlt?: string;
  } | null;
}

export default function CertificationImageModal({ isOpen, onClose, certification }: CertificationImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !certification) return null;

  const encodedSrc = encodeURI(certification.imageSrc);
  const altText = certification.imageAlt ?? `${certification.title} Certificate`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card-background border border-card-border rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{certification.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{certification.issuer}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-2xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-card-border">
          <Image
            src={encodedSrc}
            alt={altText}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

