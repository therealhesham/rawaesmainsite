"use client";

import React from "react";

export interface BannerHeroSectionProps {
  /** Full-width banner image URL (e.g. wallpaper) */
  bannerSrc: string;
  bannerAlt?: string;
  /** Logo image shown in the hero block */
  logoSrc: string;
  logoAlt: string;
  /** Main title (e.g. روائس للاستثمار) */
  title: string;
  /** Description paragraph */
  description: string;
  /** Optional id for the hero section */
  id?: string;
  /** Optional content below description (e.g. buttons) */
  children?: React.ReactNode;
}

export function BannerHeroSection({
  bannerSrc,
  bannerAlt = "Banner",
  logoSrc,
  logoAlt,
  title,
  description,
  id = "hero",
  children,
}: BannerHeroSectionProps) {
  return (
    <>
      <section className="w-full h-[50vh] relative">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </section>

      <section className="py-20 px-6" id={id}>
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center justify-center bg-transparent">
            <img
              alt={logoAlt}
              className="w-64 h-64 object-contain"
              src={logoSrc}
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-primary leading-tight">
              {title}
            </h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {description}
            </p>
            {children ? <div className="flex gap-4 pt-4">{children}</div> : null}
          </div>
        </div>
      </section>
    </>
  );
}
