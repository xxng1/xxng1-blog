"use client";

import { useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const galleryItems = [
  {
    src: "/thespehers.JPG",
    alt: "Amazon The Spheres in Seattle",
    caption: "The Spheres - Amazon",
    href: "https://www.google.com/maps/place/The+Spheres/@47.615728,-122.3420854,17z/data=!3m1!4b1!4m6!3m5!1s0x5490154bca117fb1:0x7f39ceca621d130c!8m2!3d47.615728!4d-122.3395105!16s%2Fg%2F11f3xqwt6t?hl=en&entry=ttu&g_ep=EgoyMDI1MDcyMy4wIKXMDSoASAFQAw%3D%3D",
  },
];

export default function AboutGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const currentItem = galleryItems[currentIndex];

  const navigate = (direction: "prev" | "next") => {
    if (isFading) return;
    setIsFading(true);

    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (direction === "prev") {
          return prev === 0 ? galleryItems.length - 1 : prev - 1;
        }
        return prev === galleryItems.length - 1 ? 0 : prev + 1;
      });

      setTimeout(() => {
        setIsFading(false);
      }, 30);
    }, 200);
  };
//   <h2 className="text-3xl font-bold mb-6 text-foreground">Activity</h2>

  return (
    <section className="mb-12">
      <div className="bg-card-background border border-card-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Gallery</h2>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {galleryItems.length}
          </span>
        </div>

        <figure className="flex flex-col items-center">
          <div className="relative w-full h-[22rem] sm:h-[26rem] rounded-2xl overflow-hidden shadow-xl border border-card-border bg-card-background">
            <div
              className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              <Image
                key={currentItem.src}
                src={currentItem.src}
                alt={currentItem.alt}
                fill
                className="object-cover"
                priority
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("prev")}
              aria-label="이전 이미지"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur-sm border border-card-border text-foreground p-2 hover:bg-background hover:border-accent transition"
            >
              <FiChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={() => navigate("next")}
              aria-label="다음 이미지"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur-sm border border-card-border text-foreground p-2 hover:bg-background hover:border-accent transition"
            >
              <FiChevronRight size={22} />
            </button>
          </div>

          <figcaption className="mt-4 text-sm text-muted-foreground text-center max-w-2xl">
            {currentItem.href ? (
              <a
                href={currentItem.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-accent transition-colors"
              >
                {currentItem.caption}
              </a>
            ) : (
              currentItem.caption
            )}
          </figcaption>
        </figure>

        <div className="flex justify-center gap-2 mt-6">
          {galleryItems.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                currentIndex === index ? "bg-accent" : "bg-muted/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
