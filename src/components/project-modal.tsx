"use client";

import { useEffect } from 'react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    title: string;
    period: string;
    description: string;
    techStack: string[];
    achievements: string;
    detail?: string;
  };
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
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
        className="bg-card-background border border-card-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-2xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">{project.period}</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">프로젝트 개요</h3>
            <p className="text-muted leading-relaxed">{project.description}</p>
          </div>

          {project.detail && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">상세 설명</h3>
              <p className="text-muted leading-relaxed whitespace-pre-line">{project.detail}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">기술 스택</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 bg-accent/5 text-accent rounded border border-accent/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">주요 성과</h3>
            <p className="text-muted leading-relaxed">{project.achievements}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

