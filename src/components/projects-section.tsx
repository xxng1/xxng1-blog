"use client";

const projects = [
  {
    title: 'Alcha - 데이터 파이프라인 자동화 프로젝트',
    period: '2025.08 - 2025.11',
    description: '실시간 차량 상태 감지부터 데이터 분석·리포트까지 자동화된 통합 파이프라인 구현.',
    techStack: ['AWS', 'Kubernetes', 'IoT Core', 'Kafka', 'Terraform', 'ArgoCD', 'GitLab'],
  },
  {
    title: 'Chuno - 미디어 스트리밍 서비스',
    period: '2024.09 - 2024.10 | NIPA-AWS Developer Bootcamp',
    description: 'AWS 서비스를 활용한 미디어 스트리밍 프로젝트. HLS 변환 및 실시간 스트리밍 기능 구현.',
    techStack: ['AWS', 'Kubernetes', 'React', 'FastAPI', 'Terraform', 'CloudFront', 'S3', 'ArgoCD'],
  },
  {
    title: 'DmarkeT - 쇼핑몰 플랫폼',
    period: '2024.01 - 2024.02 | 카카오엔터프라이즈 SW아카데미',
    description: 'KakaoCloud 기반 하이브리드 클라우드 환경 구축 및 쇼핑몰 시스템 개발. 총 109개 요구사항 분석 및 최적화.',
    techStack: ['KakaoCloud', 'SpringBoot', 'Nginx', 'Jenkins', 'SSE', 'Elasticsearch'],
  },
  {
    title: 'ODO - AI TTS 블로그',
    period: '2023.09 - 2023.12 | 카카오엔터프라이즈 SW아카데미',
    description: 'TTS AI 및 ko-GPT를 활용한 블로그 서비스. Spring Cloud Eureka 기반 MSA 아키텍처 구성.',
    techStack: ['SpringBoot', 'MSA', 'FastAPI', 'Kafka', 'MongoDB', 'MySQL', 'Redis'],
  }
];

export default function ProjectsSection() {
  return (
    <section className="mb-12">
      <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-foreground mb-6">Projects</h2>
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

