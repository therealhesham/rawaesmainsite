"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PrivateHeader() {
  const pathname = usePathname();
  const isPrivatePage = pathname?.startsWith("/privatepage");
  const navLinkClass =
    "px-6 py-2 text-md font-medium text-[#003749] hover:bg-[#003749] hover:text-white rounded-full transition-colors";

  return (
    <header className="bg-white dark:bg-card-dark shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Rawaes Group Logo"
              className="w-14 h-14 md:w-16 md:h-16 object-contain"
            />
          </Link>
        </div>
        <nav className="hidden lg:flex items-center bg-[#ecc383] border border-[#003749]/20 rounded-full px-1 py-1">
          <Link className={navLinkClass} href="#contact">
            تواصل معنا
          </Link>
          <a
            className={`${navLinkClass} flex items-center gap-1`}
            href="#"
          >
            استثمر معنا{" "}
            <span className="material-icons text-md">expand_more</span>
          </a>
          <a
            className={`${navLinkClass} flex items-center gap-1`}
            href="#sectors"
          >
            قطاعاتنا <span className="material-icons text-md">expand_more</span>
          </a>
          <Link className={navLinkClass} href="#about">
            نبذه عنا
          </Link>
          <Link
            className={`px-8 py-2 rounded-full text-md font-bold transition-all shadow-md ${
              isPrivatePage
                ? "bg-[#ecc383] text-[#003749]"
                : "bg-transparent text-[#003749] hover:bg-[#003749] hover:text-white"
            }`}
            href="/"
          >
            الرئيسة
          </Link>
        </nav>
        <button
          type="button"
          className="lg:hidden text-secondary dark:text-white"
          aria-label="القائمة"
        >
          <span className="material-icons text-3xl">menu</span>
        </button>
      </div>
    </header>
  );
}
