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

    // Skip layout for login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const menuItems = [
        { label: "لوحة التحكم", icon: "dashboard", href: "/admin" },
        { label: "صناديق الاستثمار", icon: "account_balance", href: "/admin/funds" },
        // { label: "تأجير سيارات", icon: "directions_car", href: "/admin/funds/cars" },
        // { label: "استقدام", icon: "group_add", href: "/admin/funds/recruitment" },
        // { label: "ضيافة", icon: "hotel", href: "/admin/funds/hospitality" },
        { label: "اتصل بنا", icon: "contact_page", href: "/admin/contact" },
        { label: "رسائل تواصل", icon: "mail", href: "/admin/contact/messages" },
        { label: "سجل اهتمامك ", icon: "how_to_reg", href: "/admin/investment-register" },
        { label: "طلبات سجل الاهتمام", icon: "assignment", href: "/admin/investment-register/submissions" },
        { label: "استخراج تقارير من Excel", icon: "table_chart", href: "/admin/extract-reports" },
    ];

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
                <nav className="flex-1 py-6 px-3 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
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
