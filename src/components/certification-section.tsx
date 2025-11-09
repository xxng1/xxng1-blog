"use client";

import { useState } from 'react';
import CertificationImageModal from './certification-image-modal';

type CertificationItem = {
  date: string;
  title: string;
  issuer: string;
  imageSrc?: string;
  imageAlt?: string;
};

const certifications: CertificationItem[] = [
  {
    date: '2025.07',
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'CNCF (Cloud Native Computing Foundation)',
    imageSrc: '/CKA_IMAGE.png',
    imageAlt: 'Certified Kubernetes Administrator (CKA) Certificate',
  },
  {
    date: '2025.05',
    title: 'SnowPro Associate: Platform',
    issuer: 'Snowflake',
    imageSrc: '/snowflake.png',
    imageAlt: 'SnowPro Associate Platform Certification',
  },
  {
    date: '2024.09',
    title: 'AWS Certified Developer - Associate',
    issuer: 'Amazon Web Services (AWS)',
    imageSrc: '/AWS Certified Developer - Associate certificate.png',
    imageAlt: 'AWS Certified Developer - Associate Certificate',
  },
  {
    date: '2024.03',
    title: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services (AWS)',
    imageSrc: '/AWS Certified Solutions Architect - Associate certificate.png',
    imageAlt: 'AWS Certified Solutions Architect - Associate Certificate',
  },
];

export default function CertificationSection() {
  const [selectedCertification, setSelectedCertification] = useState<CertificationItem | null>(null);

  return (
    <>
      <section className="mb-12">
        <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Certification</h2>
          <div className="space-y-4">
            {certifications.map((certification, index) => {
              const isLast = index === certifications.length - 1;

              return (
                <div
                  key={`${certification.title}-${certification.date}`}
                  className={`flex flex-wrap items-center gap-4 ${!isLast ? 'pb-4 border-b border-card-border' : ''}`}
                >
                  <div className="text-sm font-medium text-muted-foreground min-w-[4.5rem]">
                    {certification.date}
                  </div>
                  <div className="flex-1 min-w-[12rem]">
                    <div className="font-semibold text-foreground">{certification.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{certification.issuer}</div>
                  </div>
                  {certification.imageSrc && (
                    <button
                      onClick={() => setSelectedCertification(certification)}
                      className="px-4 py-2 text-sm bg-accent/10 text-accent rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors font-medium"
                    >
                      자격증 확인
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CertificationImageModal
        isOpen={Boolean(selectedCertification)}
        certification={selectedCertification}
        onClose={() => setSelectedCertification(null)}
      />
    </>
  );
}

