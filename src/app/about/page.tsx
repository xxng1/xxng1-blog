import Image from 'next/image';
import Link from 'next/link';
import TechStackGroup from '@/components/tech-stack-hover';
import ProjectsSection from '@/components/projects-section';
import CertificationSection from '@/components/certification-section';
import AboutGallery from '@/components/about/gallery';

import { VscAzure } from "react-icons/vsc";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { IoIosCall } from "react-icons/io";


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
                        <a href="mailto:woongaa1@naver.com" className="text-muted hover:text-accent transition-colors flex items-center gap-2">
                            <IoMdMail size={18} />
                            woongaa1@naver.com
                        </a>
                        <a href="tel:010-5648-8262" className="text-muted hover:text-accent transition-colors flex items-center gap-2">
                            <IoIosCall size={18} />
                            010-5648-8262
                        </a>
                        <div className="flex gap-4 mt-2">
                            <a href="https://github.com/xxng1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted hover:text-accent transition-colors">
                                <FaGithub size={18} />
                                GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/sangwoong-park/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted hover:text-accent transition-colors">
                                <FaLinkedin size={18} />
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
                                전공, 소프트웨어 아카데미, Cloud 부트캠프를 거쳐서 <span className="font-semibold text-foreground">IT Infra</span> 및 <span className="font-semibold text-foreground">System Architecture</span>에 대한 지식을 키워왔습니다.
                                <br></br>
                                운영 우수성, 보안, 신뢰성, 성능 효율성, 비용 최적화, 지속 가능성에 대한 관점으로 서비스를 제공하기 위해 노력합니다.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">2. DevOps 엔지니어링에 대한 마음가짐</h3>
                            <p>
                                언제든지 상황에 <span className="font-semibold text-foreground">신속히 대응</span>하여 서비스를 운영하기 위한 준비된 마음가짐과 책임감 있는 자세를 갖추고 있습니다.
                                <br></br>
                                반복되는 일을 <span className="font-semibold text-foreground">자동화</span>하고 비효율적인 <span className="font-semibold text-foreground">프로세스를 개선</span>하는 것을 통해 더 나은 운영 환경을 만들고자 합니다.
                            </p>
                        </div>
                        <div className="pt-4 border-t border-card-border">
                            <p>
                                On-Prem/Cloud 인프라 환경에서의 경험으로 솔루션 최적화, 인프라 자동화, 요구사항 개발 등에 대한 역량을 갖추었으며, 
                                <br></br>
                                이를 통해 구체적인 성과를 내는 엔지니어로 성장하고자 합니다.
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
                        <span className="text-xs text-muted-foreground italic">* 기술에 마우스를 올리면 설명을 확인할 수 있습니다</span>
                    </div>
                    <div className="space-y-6">
                        <TechStackGroup 
                            title="Cloud Platform"
                            items={[
                                { name: 'AWS CLI', description: 'AWS CLI를 통해 리소스 관리, 스크립트 기반 인프라 운영을 할 수 있습니다', icon: <SiAmazon /> },
                                { name: 'AWS EC2/EKS', description: 'EC2 인스턴스 구성 및 EKS 클러스터를 통해 컨테이너 오케스트레이션을 운영할 수 있습니다', icon: <SiAmazon /> },
                                { name: 'AWS Services', description: 'MSK, VPC, IVS, MediaConvert, CloudFront, S3, Lambda 등 AWS의 다양한 서비스에 대한 전반적인 이해 수준을 갖추고 있습니다', icon: <SiAmazon /> },
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
                                { name: 'Kubernetes', description: 'Kubernetes의 동작 원리와 리소스 오브젝트 전반에 대한 이해를 갖추고 있습니다', icon: <SiKubernetes /> },
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
                            <h3 className="text-xl font-semibold text-foreground mb-2">현대오토에버 모빌리티 SW 스쿨 2기</h3>
                            <div className="text-sm text-muted-foreground mb-3">2025.04 - 2025.11</div>
                            <p className="text-muted leading-relaxed mb-2">
                                클라우드 과정에 참여하여, 시스템 아키텍처와 운영 전반에 대한 이해를 심화했습니다.<br />
                                Kubernetes와 IaC(Terraform, Ansible) 등 오픈소스 기반 인프라 기술을 다루며 실무 역량을 키웠습니다.<br />
                                차량 데이터 파이프라인 프로젝트를 진행해서, 스트리밍과 배치를 아우르는 데이터 처리 환경을 구축했습니다.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">NIPA-AWS Developer Bootcamp 2기</h3>
                            <div className="text-sm text-muted-foreground mb-3">2024.08 - 2024.10</div>
                            <p className="text-muted leading-relaxed mb-2">
                                AWS 공인 강사 테크 수업에 기반한 클라우드 컴퓨팅 학습을 진행했습니다.<br />
                                미디어 스트리밍 프로젝트를 진행해서, 총 5팀 중 1위로 프로젝트 대상을 수상하였습니다.<br />
                                전체 수료생 19명 중 최우수 수료생으로 선정되었습니다.
                            </p>
                            {/* <p className="text-sm text-muted-foreground">(Amazon, Microsoft, Google 본사 방문 및 강연 참석)</p> */}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">가천 카카오엔터프라이즈 SW아카데미 3기</h3>
                            <div className="text-sm text-muted-foreground mb-3">2023.09 - 2024.02</div>
                            <p className="text-muted leading-relaxed">
                                개발 역량 강화와 엔지니어로서의 성장을 위한 소프트웨어 아카데미에 참여했습니다.<br />
                                MSA, Kubernetes, CSP, Terraform 등 최신 기술을 학습하며 프로젝트 경험을 쌓았습니다.<br />
                                PBL 교육, 기업 주도 프로젝트를 거쳐 다양한 기술을 학습하고 협업 능력을 향상시켰습니다.
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
                                <div className="font-semibold text-foreground mb-1">AWS JAM(2024)</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    DevOps Engineering을 주제로 한 AWS JAM 이벤트에 참여했습니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.09</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Developing Serverless Solutions on AWS</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    AWS Lambda를 사용하여 서버리스 애플리케이션을 구축하는 주제의 특강을 수료했습니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.09</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Running Containers on Amazon Elastic Kubernetes Service (Amazon EKS)</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    Kubernetes의 컨테이너를 관리하고 오케스트레이션하는 방법에 대한 특강을 수료했습니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.08</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Security Engineering on AWS</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    자동화, 모니터링 및 로깅, 보안 인시던트 대응에 필요한 기술에 대한 특강을 수료했습니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2024.08</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Developing on AWS</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    AWS SDK, AWS CLI 및 IDE를 사용하여 애플리케이션을 개발하는 주제의 특강을 수료했습니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2023.12</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Multi Cloud Orchestration (Terraform)</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    멀티클라우드 환경의 오케스트레이션 실전구현 특강을 수료했습니다.<br />
                                    Terraform을 활용해 멀티클라우드(AWS, Azure) 배포 강의 및 실습을 진행했습니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b border-card-border">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2023.11</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">Monitoring and Testing Implementation in a DevOps Environment</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    ElasticSearch 기반의 Observability 솔루션 실습 특강을 수료했습니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">2023.11</div>
                            <div>
                                <div className="font-semibold text-foreground mb-1">AWS JAM (2023)</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    Solution Engineering을 주제로 한 AWS JAM 이벤트에 참여했습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <AboutGallery />

            {/* 블로그 글 보러가기 */}
            {/* <section className="mb-12">
                <div className="flex justify-end">
                    <Link href="/" className="group">
                        <div className="w-full sm:w-[22rem] p-[1px] rounded-3xl bg-gradient-to-r from-accent via-indigo-500 to-purple-500 shadow-[0_18px_40px_-20px_rgba(59,130,246,0.7)] transition-transform group-hover:-translate-y-1">
                            <div className="bg-card-background rounded-[calc(1.5rem-1px)] p-7 flex flex-col gap-4 items-start">
                                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent/80">
                                    Blog
                                </span>
                                <h2 className="text-2xl font-bold text-foreground leading-tight">
                                    최신 글 보러가기
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Cloud Infrastructure & DevOps 이야기와 실제 경험을 정리해두었어요.
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors group-hover:text-accent-hover">
                                    블로그 홈으로 이동하기
                                    <span className="text-base">→</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </section> */}
        </div>
    );
}