"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { logoutAdmin } from "./login/action";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        content: false, // Default closed
    });

    // Skip layout for login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const menuItems = [
        { label: "لوحة التحكم", icon: "dashboard", href: "/admin" },
        {
            label: "إدارة المحتوى",
            icon: "view_list",
            id: "content",
            children: [
                { label: "صناديق الاستثمار", icon: "account_balance", href: "/admin/funds" },
                { label: "اتصل بنا", icon: "contact_page", href: "/admin/contact", exact: true },
                { label: "سجل اهتمامك", icon: "how_to_reg", href: "/admin/investment-register", exact: true },

            ]
        },

        {
            label: "البريد",
            icon: "view_list",
            id: "mails",
            children: [
                { label: "رسائل التواصل", icon: "mail", href: "/admin/contact/messages" },
                { label: "طلبات سجل اهتمامك", icon: "assignment", href: "/admin/investment-register/submissions", exact: true },

            ]
        },

        { label: "استخراج التقارير", icon: "table_chart", href: "/admin/extract-reports" },
        { label: "مراجعة التقارير", icon: "rate_review", href: "/admin/review" },
    ];

    const toggleMenu = (id: string) => {
        setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
        if (!isSidebarOpen) {
            setIsSidebarOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex" dir="rtl">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-secondary text-white hidden md:flex flex-col shadow-xl z-20 sticky top-0 h-screen"
            >
                {/* Logo Area */}
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
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <span className="material-icons text-xl">{isSidebarOpen ? 'chevron_right' : 'chevron_left'}</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden" css-scroll="sidebar">
                    {menuItems.map((item) => {
                        if (item.children) {
                            const isOpen = openMenus[item.id!];
                            const isChildActive = item.children.some(child =>
                                child.exact ? pathname === child.href : (pathname === child.href || pathname.startsWith(child.href + '/'))
                            );
                            return (
                                <div key={item.id} className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.id!)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isChildActive && !isOpen
                                            ? "bg-primary/20 text-white"
                                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`material-icons ${isChildActive ? "text-primary" : "group-hover:text-primary transition-colors"}`}>
                                                {item.icon}
                                            </span>
                                            {isSidebarOpen && (
                                                <span className={`font-medium whitespace-nowrap ${isChildActive ? "text-white" : ""}`}>{item.label}</span>
                                            )}
                                        </div>
                                        {isSidebarOpen && (
                                            <span className={`material-icons text-sm transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-180"}`}>
                                                arrow_back_ios_new
                                            </span>
                                        )}
                                    </button>

                                    {/* Collapsible Children */}
                                    {(isOpen && isSidebarOpen) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden flex flex-col gap-1 pr-10 pl-2 border-r-2 border-white/10 ml-2 mr-6 my-2"
                                        >
                                            {item.children.map((child: any) => {
                                                const isActive = child.exact
                                                    ? pathname === child.href
                                                    : (pathname === child.href || pathname.startsWith(child.href + '/'));

                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${isActive
                                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                                            : "text-gray-400 hover:bg-white/10 hover:text-white"
                                                            }`}
                                                    >
                                                        <span className="material-icons text-[18px]">
                                                            {isActive ? "fiber_manual_record" : "radio_button_unchecked"}
                                                        </span>
                                                        <span className="font-medium text-sm whitespace-nowrap">{child.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </div>
                            );
                        }

                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href!}
                                href={item.href!}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span className={`material-icons ${isActive ? "" : "group-hover:text-primary transition-colors"}`}>
                                    {item.icon}
                                </span>
                                {isSidebarOpen && (
                                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile / Logout */}
                <div className="p-4 border-t border-white/10">
                    <form action={logoutAdmin} className="w-full">
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all"
                        >
                            <span className="material-icons">logout</span>
                            {isSidebarOpen && <span>تسجيل الخروج</span>}
                        </button>
                    </form>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="bg-white dark:bg-card-dark shadow-sm border-b border-gray-100 dark:border-gray-800 p-4 md:hidden flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Rawaes" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-lg text-secondary dark:text-white">إدارة روائس</span>
                    </div>
                    <button className="p-2 text-gray-500">
                        <span className="material-icons">menu</span>
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
