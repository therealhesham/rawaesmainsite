"use client";

import { Toaster } from "sonner";
import "sonner/dist/styles.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Circle,
  X
} from "lucide-react";
import { logoutAdmin } from "./login/action";

const MULTI_SEGMENT_KEYS: Record<string, string> = {
  "contact/messages": "contact-messages",
  "investment-register/submissions": "investment-register-submissions",
  investors: "investor-page",
  "bulk-attachments": "extract-reports",
  "add-contract": "investor-upload",
};

function pathToPageKey(pathname: string): string {
  if (!pathname.startsWith("/admin")) return "";
  const rest = pathname.slice("/admin".length).replace(/^\//, "");
  for (const [path, key] of Object.entries(MULTI_SEGMENT_KEYS)) {
    if (rest === path || rest.startsWith(path + "/")) return key;
  }
  const first = rest.split("/")[0];
  return first || "";
}

export type MenuItemChild = { label: string; icon: React.ReactNode; href: string; exact?: boolean; pageKey: string };
export type MenuItem =
  | { label: string; icon: React.ReactNode; href: string; pageKey: string }
  | { label: string; icon: React.ReactNode; id: string; children: MenuItemChild[]; pageKey?: string };

export default function AdminLayoutClient({
  menuItems,
  allowedPageKeys,
  children,
}: {
  menuItems: MenuItem[];
  allowedPageKeys: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ content: false, mails: false });

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const key = pathToPageKey(pathname);
    if (key !== "" && !allowedPageKeys.includes(key)) {
      router.replace("/admin");
    }
  }, [pathname, allowedPageKeys, router]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const renderLink = (item: { href: string; label: string; icon: React.ReactNode }, isActive: boolean) => (
    <Link
      href={item.href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-300 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span className={isActive ? "" : "group-hover:text-primary transition-colors [&>svg]:w-[22px] [&>svg]:h-[22px]"}>
        {item.icon}
      </span>
      <span className="font-medium whitespace-nowrap">{item.label}</span>
    </Link>
  );

  const renderChildLink = (child: MenuItemChild, isActive: boolean) => (
    <Link
      key={child.href}
      href={child.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
    >
      <span className="flex items-center justify-center w-[18px]">
        {isActive ? <CircleDot size={18} /> : <Circle size={18} />}
      </span>
      <span className="font-medium text-sm whitespace-nowrap">{child.label}</span>
    </Link>
  );

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex" dir="rtl">
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-secondary text-white hidden md:flex flex-col shadow-xl z-20 sticky top-0 h-screen shrink-0"
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Rawaes" className="w-10 h-10 object-contain brightness-0 invert" />
              <span className="font-bold text-xl">إدارة روائس</span>
            </div>
          ) : (
            <img src="/logo.png" alt="Rawaes" className="w-8 h-8 mx-auto object-contain brightness-0 invert" />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white/70 hover:text-white transition-colors flex items-center justify-center p-1"
          >
            {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            if ("children" in item && item.children) {
              const isOpen = openMenus[item.id];
              const isChildActive = item.children.some((child) =>
                child.exact ? pathname === child.href : pathname === child.href || pathname.startsWith(child.href + "/")
              );
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isChildActive && !isOpen ? "bg-primary/20 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`${isChildActive ? "text-primary" : "group-hover:text-primary transition-colors"} [&>svg]:w-[22px] [&>svg]:h-[22px]`}>
                        {item.icon}
                      </span>
                      {isSidebarOpen && (
                        <span className={`font-medium whitespace-nowrap ${isChildActive ? "text-white" : ""}`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <span className="flex items-center justify-center text-gray-400">
                        {isOpen ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
                      </span>
                    )}
                  </button>
                  {isOpen && isSidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden flex flex-col gap-1 pr-10 pl-2 border-r-2 border-white/10 ml-2 mr-6 my-2"
                    >
                      {item.children.map((child) => {
                        const isActive = child.exact
                          ? pathname === child.href
                          : pathname === child.href || pathname.startsWith(child.href + "/");
                        return renderChildLink(child, isActive);
                      })}
                    </motion.div>
                  )}
                </div>
              );
            }
            const href = "href" in item ? item.href : "#";
            const isActive = pathname === href;
            return (
              <div key={href}>
                {renderLink({ href, label: item.label, icon: item.icon }, isActive)}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutAdmin} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all font-medium"
            >
              <LogOut size={22} />
              {isSidebarOpen && <span>تسجيل الخروج</span>}
            </button>
          </form>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-y-0 right-0 w-[85%] max-w-xs bg-secondary text-white shadow-2xl flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Rawaes" className="w-8 h-8 object-contain brightness-0 invert" />
                <span className="font-bold text-lg">إدارة روائس</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                if ("children" in item && item.children) {
                  const isOpen = openMenus[item.id];
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white"
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="flex items-center justify-center">
                          {isOpen ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="flex flex-col gap-1 pr-8 pl-2 border-r-2 border-white/10 ml-2 mr-4 my-2">
                          {item.children.map((child) => {
                            const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className={isActive ? "bg-primary text-white px-3 py-2.5 rounded-lg" : "text-gray-400 hover:bg-white/10 px-3 py-2.5 rounded-lg"}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                const href = "href" in item ? item.href : "#";
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl ${pathname === href ? "bg-primary text-white" : "text-gray-300 hover:bg-white/5"}`}
                  >
                    <span className="flex items-center justify-center [&>svg]:w-[22px] [&>svg]:h-[22px]">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 font-medium"
                >
                  <LogOut size={22} />
                  <span>تسجيل الخروج</span>
                </button>
              </form>
            </div>
          </motion.aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-card-dark shadow-sm border-b border-gray-100 dark:border-gray-800 p-4 md:hidden flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Rawaes" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-secondary dark:text-white">إدارة روائس</span>
          </div>
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
    <Toaster position="top-center" dir="rtl" richColors closeButton />
    </>
  );
}
