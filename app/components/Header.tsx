"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const navLinkClass =
    "px-6 py-2 text-sm font-medium text-[#003749] hover:bg-[#003749] hover:text-white rounded-full transition-colors";

  return (
    <header className="bg-white dark:bg-card-dark shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center ">
            <div className="relative w-14 h-14">
          
          <img
              src="/logo.png"
              alt="Rawaes Group Logo"
              className="w-full h-full object-contain relative z-10"
            />  
              {/* <div className="absolute inset-0 bg-secondary rounded-full opacity-20" />
              <div className="absolute top-0 left-0 w-6 h-6 bg-secondary rounded-tl-full" />
              <div className="absolute top-0 right-0 w-6 h-6 bg-secondary rounded-tr-full" />
              <div className="absolute bottom-0 left-0 w-6 h-6 bg-secondary rounded-bl-full" />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-br-full" /> */}
            </div>
          </div>
        </div>
        <nav className="hidden lg:flex items-center bg-[#ecc383] border border-[#003749]/20 rounded-full px-1 py-1 ">
          <Link className={`${navLinkClass}`} href="#contact">
            تواصل معنا
          </Link>
          <a className={`${navLinkClass} flex items-center gap-1`} href="#">
            استثمر معنا{" "}
            <span className="material-icons text-sm">expand_more</span>
          </a>
          <a className={`${navLinkClass} flex items-center gap-1`} href="#sectors">
            قطاعاتنا <span className="material-icons text-sm">expand_more</span>
          </a>
          <Link className={navLinkClass} href="#about">
            نبذه عنا
          </Link>
          <Link
            className={`px-8 py-2 rounded-full text-sm font-bold transition-all shadow-md ${
              pathname === "/" ? "bg-[#003749] text-white" : "bg-[#003749] text-white hover:bg-[#003749]/90"
            }`}
            href="/"
          >
            الرئيسة
          </Link>
        </nav>
        <button type="button" className="lg:hidden text-secondary dark:text-white" aria-label="القائمة">
          <span className="material-icons text-3xl">menu</span>
        </button>
      </div>
    </header>
  );
}
