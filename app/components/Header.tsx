"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  target?: string;
  children?: { label: string; href: string }[];
};


export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: "الرئيسة", href: "/", active: pathname === "/" },
    { label: "نبذه عنا", href: "/about-us", active: pathname === "/about-us" },
    {
      label: "قطاعاتنا",
      href: "#sectors",
      icon: <ChevronDown className="w-4 h-4" />,
      children: [
        { label: "روائس للاستثمار", href: "/investment" },
        { label: "روائس للضيافة", href: "/rawaeshotels" },
        { label: "روائس لاستقدام", href: "https://rec.rawaes.com" },
        { label: "روائس لتأجير السيارات", href: "https://rent.rawaes.com" },
        { label: "روائس للتقسيط", href: "/installments" },
      ],
    },
    {
      label: "استثمر معنا",
      href: "/invest",
      icon: <ChevronDown className="w-4 h-4" />,
      active: pathname === "/invest",
      children: [
        { label: "صندوق روائس للضيافة", href: "/investment?fund=hospitality" },
        { label: "صندوق روائس لتأجير السيارات", href: "/investment?fund=cars" },
        { label: "صندوق روائس للاستقدام", href: "/investment?fund=recruitment" },
        { label: "تسجيل دخول المستثمرين", href: "/login" },
      ],
    },
    { label: "تواصل معنا", href: "/#contact", active: pathname === "/#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${scrolled
        ? "backdrop-blur-xl shadow-[0_1px_24px_rgba(0,42,58,0.08)]"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center h-20">
        {/* Logo */}
        <Link href="/" className="group relative flex items-center">
          <motion.div
            whileHover={{ scale: 1.06, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-14 h-14 relative"
          >
            <img
              src="/logo.png"
              alt="Rawaes Group Logo"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </motion.div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-gradient-to-l from-[#ecc383]/90 to-[#d4af79]/80 backdrop-blur-md border border-[#d4af79]/30 rounded-full px-1.5 py-1.5 shadow-[0_2px_16px_rgba(212,175,121,0.2)]">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                className={`relative px-6 py-2 text-[0.92rem] font-semibold rounded-full transition-all duration-300 flex items-center gap-1 ${item.active
                  ? "bg-[#003749] text-white shadow-lg shadow-[#003749]/25"
                  : "text-[#003749]/85 hover:text-[#003749] hover:bg-white/50"
                  }`}
              >
                {item.active && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 bg-[#003749] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {item.label}
                {item.icon && (
                  <motion.span
                    className="opacity-60"
                    animate={{ rotate: item.children && hoveredItem === item.label ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.icon}
                  </motion.span>
                )}
              </Link>

              {/* Desktop Dropdown */}
              <AnimatePresence>
                {item.children && hoveredItem === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#d4af79] rounded-2xl shadow-xl border border-[#d4af79]/20 overflow-hidden z-50 py-2"
                  >
                    {item.children.map((child, idx) => (
                      <Link
                        key={idx}
                        href={child.href}
                        className="block px-4 py-2.5 text-[0.9rem] text-[#003749]/85 hover:bg-[#d4af79]/10 hover:text-[#003749]/50 transition-colors font-medium text-right"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#d4af79]/20 text-[#003749] dark:text-white"
          aria-label="القائمة"
        >
          <span className="text-2xl flex items-center justify-center">
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </span>
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#003B4D] text-white z-[70] shadow-2xl flex flex-col font-display"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <span className="text-lg font-bold">الرئيسية</span>
                <button
                  aria-label="Close Menu"
                  onClick={() => setMobileOpen(false)}
                  className="bg-white hover:bg-gray-200 text-[#003B4D] w-10 h-10 flex items-center justify-center transition-colors duration-200 rounded-lg"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <ul className="flex flex-col">
                  <li>
                    <a className="block py-5 px-6 border-b border-white/10 hover:bg-white/5 transition-colors text-right" href="https://rec.rawaes.com">
                      روائس للاستقدام
                    </a>
                  </li>
                  <li>
                    <a className="block py-5 px-6 border-b border-white/10 hover:bg-white/5 transition-colors text-right" href="https://rent.rawaes.com">
                      روائس لتأجير السيارات
                    </a>
                  </li>
                  <li>
                    <a className="block py-5 px-6 border-b border-white/10 hover:bg-white/5 transition-colors text-right" href="/rawaeshotels">
                      روائس للضيافة
                    </a>
                  </li>
                  <li>
                    <a className="block py-5 px-6 border-b border-white/10 hover:bg-white/5 transition-colors text-right" href="/installments">
                      روائس للتقسيط
                    </a>
                  </li>
                  <li>
                    <div className="group">
                      <button
                        onClick={() => setExpandedMobileItem(expandedMobileItem === "invest" ? null : "invest")}
                        className="w-full flex justify-between items-center py-5 px-6 border-b border-white/10 bg-[#003B4D] hover:bg-white/5 transition-colors text-right"
                      >
                        <span className={`transition-transform duration-300 text-[#E0C086] ${expandedMobileItem === "invest" ? "rotate-0" : "rotate-180"}`}>
                          <ChevronDown className="w-5 h-5" />
                        </span>
                        <span className="flex-1 mr-4">استثمر معنا</span>
                      </button>
                      <AnimatePresence>
                        {expandedMobileItem === "invest" && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-[#002a3a] overflow-hidden"
                          >
                            <li>
                              <Link className="block py-5 px-6 bg-[#E0C086] text-[#003B4D] font-bold text-center transition-colors shadow-inner" href="/investment" onClick={() => setMobileOpen(false)}>
                                روائس للاستثمار
                              </Link>
                            </li>
                            <li>
                              <Link href="/investment#funds" className="block py-4 px-6 text-white/90 hover:text-white border-b border-white/5 text-right" onClick={() => setMobileOpen(false)}>صناديق روائس للاستثمار</Link>
                            </li>
                            <li>
                              <Link href="/login" className="block py-4 px-6 text-white/90 hover:text-white border-b border-white/5 text-right" onClick={() => setMobileOpen(false)}>تسجيل دخول المستثمرين</Link>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                  <li>
                    <Link className="block py-5 px-6 border-b border-white/10 hover:bg-white/5 transition-colors text-right" href="/about-us" onClick={() => setMobileOpen(false)}>
                      نبذه عنا
                    </Link>
                  </li>
                  <li>
                    <Link className="block py-5 px-6 border-b border-white/10 hover:bg-white/5 transition-colors text-right" href="/#contact" onClick={() => setMobileOpen(false)}>
                      اتصل بنا
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="p-4 text-center text-xs text-white/30 border-t border-white/10">
                © 2024 مجموعة روائس
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
