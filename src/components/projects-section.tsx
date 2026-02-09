"use client";

import { FaGithub } from "react-icons/fa";

const projects = [
  {
    title: 'whatmeme - MCP 서버 및 챗봇 개발 프로젝트',
    period: '2026.01 - 진행중 | 개인 프로젝트',
    description: '최신 밈 트렌드를 제공하는 MCP 서버와 이를 활용한 챗봇 개발',
    techStack: ['MCP', 'AWS', 'n8n', 'Cursor', 'Claude', 'ChatGPT', 'Gemini', 'React'],
    githubUrl: 'https://github.com/whatmeme',
  },
  {
    title: 'Alcha - 데이터 파이프라인 자동화 프로젝트',
    period: '2025.08 - 2025.11 | 현대오토에버 모빌리티 SW 스쿨 | 팀 프로젝트',
    description: 'IoT 데이터 파이프라인 구축. 실시간 통신부터 대시보드 ETL 프로세스 및 장애 처리 설계.',
    techStack: ['AWS', 'Kubernetes', 'IoT Core', 'Kafka', 'Terraform', 'ArgoCD', 'GitLab'],
    githubUrl: 'https://github.com/H-Autoever',
  },
  {
    title: 'Chuno - 미디어 스트리밍 서비스',
    period: '2024.09 - 2024.10 | NIPA-AWS Developer Bootcamp | 팀 프로젝트',
    description: 'AWS 서비스를 활용한 미디어 스트리밍 프로젝트. VOD 및 실시간 스트리밍 기능 제공.',
    techStack: ['AWS', 'Kubernetes', 'React', 'FastAPI', 'Terraform', 'CloudFront', 'S3', 'ArgoCD'],
    githubUrl: 'https://github.com/AWS2-Chuno',
  },
  {
    title: 'DmarkeT - 쇼핑몰 플랫폼',
    period: '2024.01 - 2024.02 | 카카오엔터프라이즈 SW아카데미 | 팀 프로젝트',
    description: 'KakaoCloud 기반 하이브리드 클라우드 환경 구축. 총 109개 요구사항 분석 및 최적화.',
    techStack: ['KakaoCloud', 'SpringBoot', 'Nginx', 'Jenkins', 'SSE', 'Elasticsearch'],
    githubUrl: 'https://github.com/DKT-Kwanza/dmarket-back',
  },
  {
    title: 'ODO - AI TTS 블로그',
    period: '2023.09 - 2023.12 | 카카오엔터프라이즈 SW아카데미 | 팀 프로젝트',
    description: 'TTS AI 및 ko-GPT를 활용한 블로그 서비스. Spring Cloud Eureka 기반 폴리글랏 아키텍처 구성.',
    techStack: ['SpringBoot', 'MSA', 'FastAPI', 'Kafka', 'MongoDB', 'MySQL', 'Redis'],
    githubUrl: 'https://github.com/KEA3-KeLog/ODO-Server',
  }
];

export default function ProjectsSection() {
  return (
    <section className="mb-12">
      <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-foreground mb-6">Project</h2>
        <div className="space-y-6">
          {projects.map((project) => (
            <article
              key={project.title}
              className="border border-card-border rounded-xl p-6 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-semibold text-foreground flex-1">
                  {project.title}
                </h3>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-accent transition-colors flex-shrink-0"
                    aria-label={`${project.title} GitHub`}
                  >
                    <FaGithub size={20} />
                  </a>
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-3">{project.period}</div>
              <p className="text-muted leading-relaxed mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={`${project.title}-${tech}`}
                    className="text-xs px-2 py-1 bg-accent/5 text-accent rounded border border-accent/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

