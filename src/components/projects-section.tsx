"use client";

import { useState } from 'react';
import ProjectModal from './project-modal';

const projects = [
  {
    title: 'Chuno - 미디어 스트리밍 서비스',
    period: '2024.09 - 2024.10 | NIPA-AWS Developer Bootcamp',
    description: 'AWS 서비스를 활용한 미디어 스트리밍 프로젝트. HLS 변환 및 실시간 스트리밍 기능 구현.',
    techStack: ['AWS', 'Kubernetes', 'React', 'FastAPI', 'Terraform', 'CloudFront', 'S3', 'ArgoCD'],
    achievements: 'ALB 구성으로 CORS 이슈 해결, HPA 적용으로 응답시간 2초 → 500ms 개선',
    badge: '1등 수상',
    detail: `AWS Well-Architected Framework 원칙을 적용한 미디어 스트리밍 서비스입니다.
    
• 인프라 구성: Terraform을 활용한 IaC로 멀티 리전 인프라 자동화 구성
• 컨테이너 오케스트레이션: EKS 클러스터를 통한 Kubernetes 환경 구성 및 HPA(Horizontal Pod Autoscaler) 적용
• CI/CD 파이프라인: ArgoCD를 활용한 GitOps 기반 자동 배포 구현
• CDN 및 스토리지: CloudFront와 S3를 활용한 전역 미디어 배포 시스템 구축
• 성능 최적화: ALB 구성으로 CORS 이슈 해결 및 응답시간 2초 → 500ms로 개선`
  },
  {
    title: 'DmarkeT - 쇼핑몰 플랫폼',
    period: '2024.01 - 2024.02 | 카카오엔터프라이즈 SW아카데미',
    description: 'KakaoCloud 기반 하이브리드 클라우드 환경 구축 및 쇼핑몰 시스템 개발. 총 109개 요구사항 분석 및 최적화.',
    techStack: ['KakaoCloud', 'SpringBoot', 'Nginx', 'Jenkins', 'SSE', 'Elasticsearch'],
    achievements: 'SSE 실시간 알림 구현, Elasticsearch 검색 성능 개선',
    badge: '기업 연계',
    detail: `기업 연계 프로젝트로 진행된 하이브리드 클라우드 기반 쇼핑몰 플랫폼입니다.
    
• 하이브리드 클라우드: KakaoCloud 기반 인프라 구성 및 관리
• 마이크로서비스 아키텍처: SpringBoot 기반 모듈화된 서비스 구성
• CI/CD 파이프라인: Jenkins를 활용한 Blue/Green 배포 자동화
• 실시간 통신: Server-Sent Events(SSE)를 활용한 실시간 알림 시스템 구현
• 검색 기능: Elasticsearch를 활용한 검색 성능 최적화
• 리버스 프록시: Nginx를 통한 로드 밸런싱 및 SSL/TLS 처리`
  },
  {
    title: 'ODO - AI TTS 블로그',
    period: '2023.09 - 2023.12 | 카카오엔터프라이즈 SW아카데미',
    description: 'TTS AI 및 ko-GPT를 활용한 블로그 서비스. Spring Cloud Eureka 기반 MSA 아키텍처 구성.',
    techStack: ['SpringBoot', 'MSA', 'FastAPI', 'Kafka', 'MongoDB', 'MySQL', 'Redis'],
    achievements: 'Redis 캐싱으로 처리량 163/sec → 978/sec (6배 증가)',
    badge: 'MSA 구성',
    detail: `TTS AI와 ko-GPT를 활용한 블로그 서비스로 MSA 아키텍처를 적용했습니다.
    
• 마이크로서비스 아키텍처: Spring Cloud Eureka를 활용한 서비스 디스커버리 및 MSA 구성
• 메시지 큐: Kafka를 활용한 비동기 메시징 및 이벤트 기반 아키텍처 구현
• 데이터베이스: MongoDB와 MySQL을 활용한 다중 데이터베이스 전략
• 캐싱 전략: Redis를 활용한 캐싱으로 처리량 163/sec → 978/sec로 6배 성능 개선
• AI 서비스 통합: FastAPI 기반 TTS AI 서비스 및 ko-GPT 통합
• 성능 모니터링: 각 서비스별 성능 메트릭 수집 및 분석`
  }
];

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  return (
    <>
      <section className="mb-12">
        <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Projects</h2>
            <span className="text-xs text-muted-foreground italic">* 클릭하면 상세보기할 수 있습니다</span>
          </div>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div
                key={index}
                onClick={() => setSelectedProject(index)}
                className="border border-card-border rounded-xl p-6 hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors flex-1">
                    {project.title}
                  </h3>
                  <span className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full">
                    {project.badge}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-3">{project.period}</div>
                <p className="text-muted leading-relaxed mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 bg-accent/5 text-accent rounded border border-accent/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">주요 성과:</span>
                    <span className="text-muted">{project.achievements}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedProject !== null && (
        <ProjectModal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          project={projects[selectedProject]}
        />
      )}
    </>
  );
}

