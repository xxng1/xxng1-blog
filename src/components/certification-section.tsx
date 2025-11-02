"use client";

import { useState } from 'react';
import CertificationImageModal from './certification-image-modal';

export default function CertificationSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="mb-12">
        <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Certification</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-card-border">
              <div className="text-sm font-medium text-muted-foreground">2025.07</div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">Certified Kubernetes Administrator (CKA)</div>
                <div className="text-sm text-muted-foreground mt-1">CNCF (Cloud Native Computing Foundation)</div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm bg-accent/10 text-accent rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors font-medium"
              >
                자격증 확인
              </button>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b border-card-border">
              <div className="text-sm font-medium text-muted-foreground">2025.05</div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">SnowPro Associate: Platform Certification</div>
                <div className="text-sm text-muted-foreground mt-1">Snowflake</div>
              </div>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b border-card-border">
              <div className="text-sm font-medium text-muted-foreground">2024.09</div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">AWS Certified Developer - Associate</div>
                <div className="text-sm text-muted-foreground mt-1">Amazon Web Services (AWS)</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground">2024.03</div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">AWS Certified Solutions Architect - Associate</div>
                <div className="text-sm text-muted-foreground mt-1">Amazon Web Services (AWS)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CertificationImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

