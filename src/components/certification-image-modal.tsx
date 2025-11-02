"use client";

import { useEffect } from 'react';
import Image from 'next/image';

interface CertificationImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CertificationImageModal({ isOpen, onClose }: CertificationImageModalProps) {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card-background border border-card-border rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Certified Kubernetes Administrator (CKA)</h2>
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
            src="/CKA_IMAGE.png"
            alt="Certified Kubernetes Administrator Certificate"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

