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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-background/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card-background border border-card-border rounded-2xl p-4 sm:p-5 max-w-3xl w-full max-h-[85vh] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">{certification.title}</h2>
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
        <div className="relative w-full flex-1 min-h-[300px] max-h-[70vh] rounded-xl overflow-hidden border border-card-border bg-background">
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

