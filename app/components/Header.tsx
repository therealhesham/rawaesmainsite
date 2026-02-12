import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white dark:bg-card-dark shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center">
            <div className="relative w-12 h-12">
              {/* <div className="absolute inset-0 bg-secondary rounded-full opacity-20" />
              <div className="absolute top-0 left-0 w-6 h-6 bg-secondary rounded-tl-full" />
              <div className="absolute top-0 right-0 w-6 h-6 bg-secondary rounded-tr-full" />
              <div className="absolute bottom-0 left-0 w-6 h-6 bg-secondary rounded-bl-full" />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-br-full" /> */}
            </div>
          </div>
          <div className="hidden md:block mr-3 text-secondary dark:text-white">
            <h1 className="text-xl font-bold leading-none">مجموعة روائس</h1>
            <span className="text-xs text-primary font-semibold tracking-widest">
              Rawaes Group
            </span>
          </div>
        </div>
        <nav className="hidden lg:flex items-center bg-primary/20 dark:bg-card-dark border border-primary/30 rounded-full px-1 py-1">
          <Link
            className="px-6 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors dark:text-gray-200"
            href="#contact"
          >
            تواصل معنا
          </Link>
          <a
            className="px-6 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1 dark:text-gray-200"
            href="#"
          >
            استثمر معنا{" "}
            <span className="material-icons text-sm">expand_more</span>
          </a>
          <a
            className="px-6 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1 dark:text-gray-200"
            href="#sectors"
          >
            قطاعاتنا <span className="material-icons text-sm">expand_more</span>
          </a>
          <Link
            className="px-6 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors dark:text-gray-200"
            href="#about"
          >
            نبذه عنا
          </Link>
          <Link
            className="bg-secondary text-white px-8 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all shadow-md"
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
