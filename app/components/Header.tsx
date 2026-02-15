"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  icon?: string;
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
      icon: "expand_more",
      children: [
        { label: "روائس للاستثمار", href: "/investment" },
        { label: "روائس للضيافة", href: "/rawaeshotels" },
        { label: "روائس لاستقدام", href: "https://rec.rawaes.com" },
        { label: "روائس لتأجير السيارات", href: "https://rent.rawaes.com" },
        { label: "روائس للتقسيط", href: "/installments" },
      ],
    },
    { label: "استثمر معنا", href: "/invest", active: pathname === "/invest" },
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
                    className="material-icons text-[1rem] opacity-60"
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
          <span className="material-icons text-2xl">
            {mobileOpen ? "close" : "menu"}
          </span>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden overflow-hidden bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-[#d4af79]/20"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <div className="flex flex-col">
                    <div
                      onClick={() => {
                        if (item.children) {
                          setExpandedMobileItem(expandedMobileItem === item.label ? null : item.label);
                        } else {
                          setMobileOpen(false);
                        }
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-[0.95rem] font-semibold transition-all duration-200 cursor-pointer ${item.active
                        ? "bg-[#003749] text-white"
                        : "text-[#003749] hover:bg-[#d4af79]/15"
                        }`}
                    >
                      {!item.children ? (
                        <Link href={item.href} className="flex-1 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                          <span>{item.label}</span>
                          {item.icon && (
                            <span className="material-icons text-base opacity-50">
                              {item.icon}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div className="flex-1 flex items-center justify-between">
                          <span>{item.label}</span>
                          {item.icon && (
                            <span className={`material-icons text-base opacity-50 transition-transform duration-300 ${expandedMobileItem === item.label ? "rotate-180" : ""}`}>
                              {item.icon}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mobile Dropdown */}
                    <AnimatePresence>
                      {item.children && expandedMobileItem === item.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden bg-[#d4af79]/5 rounded-xl mt-1 mx-2"
                        >
                          {item.children.map((child, idx) => (
                            <Link
                              key={idx}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block px-4 py-2.5 text-[0.9rem] text-[#003749]/90 hover:text-[#003749] border-b border-[#d4af79]/10 last:border-0"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
