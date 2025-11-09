import Image from 'next/image';
import Link from 'next/link';
import TechStackGroup from '@/components/tech-stack-hover';
import ProjectsSection from '@/components/projects-section';
import CertificationSection from '@/components/certification-section';

import { VscAzure } from "react-icons/vsc";


import {
  SiAmazon,
  SiLinux,
  SiApple,
  SiKubernetes,
  SiDocker,
  SiGithubactions,
  SiArgo,
  SiJenkins,
  SiHashicorp,
  SiPrometheus,
  SiGrafana,
  SiElastic,
  SiPython,
  SiGnubash
} from 'react-icons/si';

export const metadata = {
    title: "About - xxng1",
    description: "Learn more about xxng1 (Sangwoong)",
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                    About Sangwoong
                </h1>
                <p className="text-lg text-gray-300">
                    Cloud Engineer & Continuous Improver
                </p>
            </div> */}

            <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                <div className="relative w-48 h-48 flex-shrink-0">
                    <Image
                        src="/mypicture.jpeg"
                        alt="Sangwoong Park"
                        fill
                        className="rounded-full object-cover border-4 border-card-border shadow-lg"
                    />
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-2 text-foreground">@xxng1</h2>
                    <p className="text-muted text-lg mb-4">
                        박상웅 | Sangwoong Park
                    </p>
                    <div className="flex flex-col gap-2 text-sm">
                        <a href="mailto:woongaa1@naver.com" className="text-muted hover:text-accent transition-colors">
                            📧 woongaa1@naver.com
                        </a>
                        <a href="tel:010-5648-8262" className="text-muted hover:text-accent transition-colors">
                            📞 010-5648-8262
                        </a>
                        <div className="flex gap-4 mt-2">
                            <a href="https://github.com/xxng1" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">
                                GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/sangwoong-park/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <section className="mb-12">
                <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
                    <h2 className="text-3xl font-bold mb-6 text-foreground">
                        About Me
                    </h2>
                    <div className="space-y-6 text-muted leading-relaxed">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">1. Well-Architected Framework에 대한 이해</h3>
                            <p>
                                전공, 소프트웨어 아카데미, AWS 부트캠프를 통해 IT 인프라와 시스템 아키텍처에 대한 지식을 쌓아왔습니다.
                                <br></br>
                                운영 우수성(Operational Excellence), 보안(Security), 안정성(Reliability), 성능 효율성(Performance Efficiency), 
                                비용 최적화(Cost Optimization), 지속가능성(Sustainability) 관점에서 서비스를 제공하기 위해 노력합니다.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">2. CloudOps 엔지니어링에 대한 마음가짐</h3>
                            <p>
                                빠르게 상황을 대응하고 서비스를 운영할 수 있는 마음가짐과 책임감 있는 자세를 준비하고 있습니다.
                                <br></br>
                                반복되는 작업의 자동화와 비효율적인 프로세스의 개선을 통해 더 나은 운영 환경을 만들어 나갑니다.
                            </p>
                        </div>
                        <div className="pt-4 border-t border-card-border">
                            <p>
                                On-Prem/Cloud 인프라 경험을 통해 솔루션 최적화, 인프라 자동화, 애플리케이션 개발 역량을 갖추며, 
                                <span className="font-semibold text-foreground">구체적인 성과를 만들어내는 엔지니어</span>로 성장하고자 합니다.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Link
                            href="https://github.com/xxng1/xxng1-blog"
                            className="inline-flex items-center text-accent hover:text-accent-hover underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            블로그 소스코드 Github →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Certification */}
            <CertificationSection />

            {/* Tech Stack */}
            <section className="mb-12">
                <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-foreground">Tech Stack</h2>
                        <span className="text-xs text-muted-foreground italic">* 기술에 마우스를 올리면 수준 설명을 확인할 수 있습니다</span>
                    </div>
                    <div className="space-y-6">
                        <TechStackGroup 
                            title="Cloud Platform"
                            items={[
                                { name: 'AWS CLI', description: 'AWS CLI를 통해 리소스 관리, 배포 자동화, 스크립트 기반 인프라 운영을 할 수 있습니다', icon: <SiAmazon /> },
                                { name: 'AWS EC2/EKS', description: 'EC2 인스턴스 구성 및 EKS 클러스터를 통해 컨테이너 오케스트레이션을 운영할 수 있습니다', icon: <SiAmazon /> },
                                { name: 'AWS Lambda', description: '서버리스 아키텍처 구축 및 이벤트 기반 애플리케이션 개발을 할 수 있습니다', icon: <SiAmazon /> },
                                { name: 'Azure VM/AKS', description: 'Azure VM 구성 및 AKS를 활용한 Kubernetes 환경 구축과 운영을 할 수 있습니다', icon: <VscAzure /> }
                            ]}
                        />
                        <TechStackGroup 
                            title="Operating System"
                            items={[
                                { name: 'Linux', description: 'Linux 환경에서 서버 구성, 시스템 관리, 쉘 스크립팅을 할 수 있습니다', icon: <SiLinux /> },
                                { name: 'Mac', description: 'macOS 환경에서 개발 및 DevOps 작업을 효율적으로 수행할 수 있습니다', icon: <SiApple /> },
                            ]}
                        />
                        <TechStackGroup 
                            title="Container & Orchestration"
                            items={[
                                { name: 'Kubernetes', description: 'Kubernetes 클러스터 구성, Pod 배포, HPA 설정, Service/Ingress 관리를 할 수 있습니다', icon: <SiKubernetes /> },
                                { name: 'Docker', description: 'Docker 이미지 빌드, 컨테이너 관리, Docker Compose를 활용한 멀티 컨테이너 환경 구축을 할 수 있습니다', icon: <SiDocker /> }
                            ]}
                        />
                        <TechStackGroup 
                            title="CI/CD & IaC"
                            items={[
                                { name: 'Github Actions', description: 'GitHub Actions를 통해 CI/CD 파이프라인 구축 및 자동화를 할 수 있습니다', icon: <SiGithubactions /> },
                                { name: 'ArgoCD', description: 'ArgoCD를 활용한 GitOps 워크플로우 구성 및 자동 배포를 할 수 있습니다', icon: <SiArgo /> },
                                { name: 'Jenkins', description: 'Jenkins를 통한 CI/CD 파이프라인 구축 및 Blue/Green 배포 자동화를 할 수 있습니다', icon: <SiJenkins /> },
                                { name: 'Terraform', description: 'Terraform을 통해 멀티클라우드 인프라 코드 작성 및 IaC 환경 구축을 할 수 있습니다', icon: <SiHashicorp /> }
                            ]}
                        />
                        <TechStackGroup 
                            title="Observability"
                            items={[
                                { name: 'Prometheus', description: 'Prometheus를 활용한 메트릭 수집 및 모니터링 시스템 구축을 할 수 있습니다', icon: <SiPrometheus /> },
                                { name: 'Grafana', description: 'Grafana 대시보드를 통한 모니터링 시각화 및 알림 설정을 할 수 있습니다', icon: <SiGrafana /> },
                                { name: 'Elastic Stack', description: 'Elasticsearch, Logstash, Kibana를 활용한 로그 수집 및 분석 시스템 구축을 할 수 있습니다', icon: <SiElastic /> }
                            ]}
                        />
                        <TechStackGroup 
                            title="Language"
                            items={[
                                { name: 'Python', description: 'Python을 통해 데이터 마이그레이션, 자동화 스크립트 작성, AWS boto3 활용을 할 수 있습니다', icon: <SiPython /> },
                                { name: 'Shell', description: 'Shell 스크립팅을 통해 시스템 자동화 및 배포 스크립트 작성을 할 수 있습니다', icon: <SiGnubash /> }
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Projects */}
            <ProjectsSection />

            {/* Experience */}
            <section className="mb-12">
                <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
                    <h2 className="text-3xl font-bold mb-6 text-foreground">Experience</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">NIPA-AWS Developer Bootcamp 2기</h3>
                            <div className="text-sm text-muted-foreground mb-3">2024.08 - 2024.10</div>
                            <p className="text-muted leading-relaxed mb-3">
                                AWS 공인강사 기술 교육을 기반으로 클라우드 컴퓨팅을 학습했습니다. 미디어 스트리밍 프로젝트를 수행하여 5개 팀 중 1등을 수상했으며, 
                                19명 중 최우수 수강생으로 선정되어 미국 시애틀 연수 여행을 다녀왔습니다. Amazon, Microsoft, Google 본사 방문 및 강의를 수강했습니다.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">가천 카카오엔터프라이즈 SW아카데미 3기</h3>
                            <div className="text-sm text-muted-foreground mb-3">2023.09 - 2024.02</div>
                            <p className="text-muted leading-relaxed">
                                개발 역량 강화와 엔지니어로 성장하기 위한 소프트웨어 아카데미에 참여했습니다. MSA(Microservices Architecture), Kubernetes, CSP(Cloud Service Provider), 
                                Terraform 등 최신 기술을 학습하고 프로젝트 경험을 쌓았습니다. PBL(Project-Based Learning) 교육과 기업 연계 프로젝트를 통해 다양한 기술 역량과 협업 능력을 향상시켰습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Activity */}
            <section className="mb-12">
                <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
                    <h2 className="text-3xl font-bold mb-6 text-foreground">Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.09</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">AWS JAM (DevOps Engineering)</div>
                                <div className="text-sm text-muted">참여</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.09</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Developing Serverless Solutions on AWS</div>
                                <div className="text-sm text-muted">특강 이수 (AWS Lambda를 활용한 서버리스 애플리케이션 구축)</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.09</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Running Containers on Amazon EKS</div>
                                <div className="text-sm text-muted">특강 이수 (Kubernetes 컨테이너 관리 및 오케스트레이션)</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.08</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Security Engineering on AWS</div>
                                <div className="text-sm text-muted">특강 이수 (자동화, 모니터링, 로깅, 보안 사고 대응)</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.08</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Developing on AWS</div>
                                <div className="text-sm text-muted">특강 이수 (AWS SDK, AWS CLI, IDE를 활용한 애플리케이션 개발)</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2023.12</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Multi Cloud Orchestration (Terraform)</div>
                                <div className="text-sm text-muted">특강 이수 · 실습 강의 진행 (Terraform을 활용한 멀티클라우드 환경 오케스트레이션, AWS/Azure 배포)</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2023.11</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Monitoring and Testing in DevOps Environment</div>
                                <div className="text-sm text-muted">특강 이수 (ElasticSearch 기반 Observability 솔루션)</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2023.11</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">AWS JAM (Solution Engineering)</div>
                                <div className="text-sm text-muted">참여</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <figure className="mb-12">
                <div className="relative w-full h-64 md:h-110 rounded-xl overflow-hidden shadow-xl">
                    <Image
                        src="/thespehers.JPG"
                        alt="Amazon The Spheres in Seattle"
                        fill
                        className="object-cover"
                    />
                </div>
                <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                    <a
                        href="https://www.google.com/maps/place/The+Spheres/@47.615728,-122.3420854,17z/data=!3m1!4b1!4m6!3m5!1s0x5490154bca117fb1:0x7f39ceca621d130c!8m2!3d47.615728!4d-122.3395105!16s%2Fg%2F11f3xqwt6t?hl=en&entry=ttu&g_ep=EgoyMDI1MDcyMy4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-accent transition-colors"
                    >
                        The Spheres - Amazon
                    </a>
                </figcaption>
            </figure>

            {/* 블로그 글 보러가기 */}
            <section className="mb-12">
                <Link href="/" className="block">
                    <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm hover:border-accent/30 hover:shadow-md transition-all cursor-pointer">
                        <h2 className="text-3xl font-bold mb-6 text-foreground">블로그 글 보러가기</h2>
                        <p className="text-muted leading-relaxed">
                            Cloud Infrastructure & DevOps 관련 기술과 경험을 기록하고 있습니다.
                        </p>
                    </div>
                </Link>
            </section>
        </div>
    );
}