"use client";

import { useState } from 'react';
import CertificationImageModal from './certification-image-modal';
import { FiEye, FiExternalLink } from "react-icons/fi";

type CertificationItem = {
  date: string;
  title: string;
  issuer: string;
  imageSrc?: string;
  imageAlt?: string;
  credlyUrl?: string;
  snowflakeUrl?: string;
};

type CertificationWithImage = CertificationItem & { imageSrc: string };

const certifications: CertificationItem[] = [
  {
    date: '2026.01',
    title: 'Certified Kubernetes Application Developer (CKAD)',
    issuer: 'Cloud Native Computing Foundation (CNCF)',
    imageSrc: '/CKAD_IMAGE.png',
    imageAlt: 'Certified Kubernetes Application Developer (CKAD) Certificate',
    credlyUrl: 'https://www.credly.com/badges/e8c4c4d2-b29a-45c9-9f8f-bed3244dd9a4',
  },
  {
    date: '2025.12',
    title: 'Kubernetes and Cloud Native Associate (KCNA)',
    issuer: 'Cloud Native Computing Foundation (CNCF)',
    imageSrc: '/kcna.png',
    imageAlt: 'Kubernetes and Cloud Native Associate (KCNA) Certificate',
    credlyUrl: 'https://www.credly.com/badges/f9ec9460-6072-4427-8f36-1fdbf25ff468',
  },

  {
    date: '2025.07',
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation (CNCF)',
    imageSrc: '/CKA_IMAGE.png',
    imageAlt: 'Certified Kubernetes Administrator (CKA) Certificate',
    credlyUrl: 'https://www.credly.com/badges/f7bb8e11-c6c9-493e-bb43-a4a5fe95d45a',
  },
  {
    date: '2025.05',
    title: 'SnowPro Associate: Platform',
    issuer: 'Snowflake',
    imageSrc: '/snowflake.png',
    imageAlt: 'SnowPro Associate Platform Certification',
    snowflakeUrl: 'https://achieve.snowflake.com/54f9c9d9-a363-4d71-862f-5204d500d7e7#acc.txBJYfsd',
  },
  {
    date: '2024.09',
    title: 'AWS Certified Developer - Associate',
    issuer: 'Amazon Web Services (AWS)',
    imageSrc: '/AWS Certified Developer - Associate certificate.png',
    imageAlt: 'AWS Certified Developer - Associate Certificate',
    credlyUrl: 'https://www.credly.com/badges/2747935d-9415-4e07-bb92-e55b318f1822',
  },
  {
    date: '2024.03',
    title: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services (AWS)',
    imageSrc: '/AWS Certified Solutions Architect - Associate certificate.png',
    imageAlt: 'AWS Certified Solutions Architect - Associate Certificate',
    credlyUrl: 'https://www.credly.com/badges/f3d037e2-a9f8-4b7a-ad05-bc174144d196',
  },
];

export default function CertificationSection() {
  const [selectedCertification, setSelectedCertification] = useState<CertificationWithImage | null>(null);

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
                  className={`flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 ${!isLast ? 'pb-4 border-b border-card-border' : ''}`}
                >
                  <div className="text-sm font-medium text-muted-foreground min-w-[4.5rem]">
                    {certification.date}
                  </div>
                  <div className="flex-1 min-w-[12rem]">
                    <div className="font-semibold text-foreground">{certification.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{certification.issuer}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {certification.credlyUrl && (
                      <a
                        href={certification.credlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative px-4 py-2 text-sm bg-accent/10 text-accent rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors font-medium flex items-center justify-center"
                        aria-label="Credly 배지 보기"
                      >
                        <FiExternalLink />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-background text-foreground rounded-lg border border-card-border shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                          View Credential ↗
                        </span>
                      </a>
                    )}
                    {certification.snowflakeUrl && (
                      <a
                        href={certification.snowflakeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative px-4 py-2 text-sm bg-accent/10 text-accent rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors font-medium flex items-center justify-center"
                        aria-label="Snowflake 배지 보기"
                      >
                        <FiExternalLink />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-background text-foreground rounded-lg border border-card-border shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                          View Credential ↗
                        </span>
                      </a>
                    )}
                    {certification.imageSrc && (
                      <button
                        onClick={() =>
                          setSelectedCertification({
                            ...certification,
                            imageSrc: certification.imageSrc!,
                          })
                        }
                        className="group relative px-4 py-2 text-sm bg-accent/10 text-accent rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors font-medium flex items-center justify-center"
                        aria-label="인증서 이미지 보기"
                      >
                        <FiEye />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-background text-foreground rounded-lg border border-card-border shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                          Preview Certificate
                        </span>
                      </button>
                    )}
                  </div>
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

