import Image from 'next/image';
import Link from 'next/link';

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
                    

                    {/* <div className="flex justify-center md:justify-start gap-4">
                        <a href="#" className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                            Contact Me
                        </a>
                    </div> */}
                </div>
            </div>

            <section className="mb-12">
                <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm">
                    <h2 className="text-3xl font-bold mb-6 text-foreground">
                        About Me
                    </h2>
                    <div className="space-y-6 text-muted leading-relaxed">
                        <p>
                            <span className="font-semibold text-foreground">No Silver Bullet</span> 이라는 말을 좋아합니다. 
                            <span className="font-semibold text-foreground"> Silver Bullet</span> 이란 만능 해결책이라는 의미로, <br></br>
                            <span className="font-bold text-foreground">한 번에 완벽하게 문제를 해결할 수 있는 솔루션은 없다</span>라는 말입니다. <br></br>
                        </p>
                        <p>
                            이러한 자세로 <i className="text-accent">Well-Architected Framework</i> 의 관점에서 지속적으로 개선을 고민합니다. <br></br>
                            서비스의 장점을 발견하고 더 나은 해결 방안을 찾아내며, 동료들과 함께 성장합니다.
                        </p>
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


{/* <br></br>
<p>👋 Hi, I’m Brilly!</p>
<p>🏫 I'm majoring in Digital Media(Design & Programming)</p>
<p>👀 I’m interested in server and infra, especially cloud!</p>
<p>🌫️ I study Kubernetes and AWS services intensively!</p>
<p>🗣️ I'm very outgoing and love presenting my experiences or knowledge!</p>
<p>🌉 I'm the bridge that connects people.</p> */}

<br></br>



                
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

            {/* <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-white">
                    Career Highlights
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 bg-gray-800 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold mb-3">Cloud Engineering</h3>
                        <p className="text-gray-300">
                            AWS 기반 아키텍처 설계 및 최적화 경험
                        </p>
                    </div>
                    <div className="p-6 bg-gray-800 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold mb-3">Collaboration</h3>
                        <p className="text-gray-300">
                            Cross-functional 팀과의 협업을 통한 문제 해결
                        </p>
                    </div>
                </div>
            </section> */}

            {/* <figure className="mb-12">
                <div className="relative w-full h-64 md:h-110 rounded-2xl overflow-hidden shadow-xl">
                    <Image
                        src="/thespheres.jpeg"
                        alt="Amazon The Spheres in Seattle"
                        fill
                        className="object-cover"
                    />
                </div>
                <figcaption className="mt-2 text-sm text-gray-400 text-center">
                    아마존 The Spheres in Seattle (맨 오른쪽)
                </figcaption>
            </figure> */}

            


            {/* <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-white">
                    Technical Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-blue-900 text-blue-300 rounded-full">
                        AWS
                    </span>
                    <span className="px-4 py-2 bg-purple-900 text-purple-300 rounded-full">
                        Cloud Architecture
                    </span>
                    <span className="px-4 py-2 bg-green-900 text-green-300 rounded-full">
                        DevOps
                    </span>
                    <span className="px-4 py-2 bg-yellow-900 text-yellow-300 rounded-full">
                        CI/CD
                    </span>
                </div>
            </section> */}
        </div>
    );
}