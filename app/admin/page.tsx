"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { getInvestors, getStats, createInvestor } from "./actions";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalInvestors: 0, totalReports: 0, recentReports: [] });
    const [investors, setInvestors] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const [statsData, investorsData] = await Promise.all([
                getStats(),
                getInvestors(search)
            ]);
            setStats(statsData as any);
            setInvestors(investorsData);
            setIsLoading(false);
        }
        fetchData();
    }, [search]); // Re-run when search changes

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-white">نظرة عامة</h1>
                    <p className="text-gray-500 mt-1">مرحباً بك في لوحة تحكم روائس</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <span className="material-icons text-sm">add</span>
                        <span>إضافة مستثمر</span>
                    </button>
                    <span className="text-sm text-gray-500">آخر تحديث: {new Date().toLocaleTimeString()}</span>
                    <button onClick={() => window.location.reload()} className="p-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-primary transition-colors">
                        <span className="material-icons text-xl">refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="إجمالي المستثمرين"
                    value={stats.totalInvestors}
                    icon="groups"
                    color="bg-blue-500"
                />
                <StatsCard
                    title="إجمالي التقارير"
                    value={stats.totalReports}
                    icon="description"
                    color="bg-primary"
                />
                <StatsCard
                    title="الإشعارات المرسلة"
                    value="48"
                    icon="notifications_active"
                    color="bg-purple-500"
                />
            </div>

            {/* Investors Table Section */}
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <span className="material-icons text-primary">list_alt</span>
                        قائمة المستثمرين
                    </h2>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="بحث بالاسم، الجوال، أو الهوية..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
                            <tr>
                                <th className="px-6 py-4 text-right font-medium">المستثمر</th>
                                <th className="px-6 py-4 text-right font-medium">رقم الجوال</th>
                                <th className="px-6 py-4 text-right font-medium">رقم الهوية</th>
                                <th className="px-6 py-4 text-center font-medium">التقارير</th>
                                <th className="px-6 py-4 text-center font-medium">تاريخ الانضمام</th>
                                <th className="px-6 py-4 text-center font-medium">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : investors.length > 0 ? (
                                investors.map((investor) => (
                                    <tr key={investor.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                                    {investor.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-secondary dark:text-white">{investor.name}</div>
                                                    <div className="text-xs text-gray-400">ID: {investor.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 dir-ltr text-right font-mono text-sm">
                                            {investor.phoneNumber}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">
                                            {investor.nationalId || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {investor._count.reports}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                                            {new Date(investor.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/admin/investors/${investor.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary transition-all shadow-sm"
                                            >
                                                <span>التفاصيل</span>
                                                <span className="material-icons text-sm">arrow_back</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <span className="material-icons text-4xl mb-2 opacity-20">search_off</span>
                                        <p>لم يتم العثور على مستثمرين</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Visual only for now) */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
                    <span>عرض {investors.length} مستثمر</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">السابق</button>
                        <button disabled className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">التالي</button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <AddInvestorModal onClose={() => setIsModalOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatsCard({ title, value, icon, color }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
        >
            <div className="relative z-10">
                <div className="text-gray-500 font-medium mb-1">{title}</div>
                <div className="text-3xl font-bold text-secondary dark:text-white">{value}</div>
            </div>
            <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center text-${color.replace('bg-', '')}`}>
                <span className="material-icons text-2xl">{icon}</span>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${color} opacity-5 group-hover:scale-110 transition-transform duration-500`} />
        </motion.div>
    )
}

function AddInvestorModal({ onClose }: { onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = await createInvestor(formData);

        if (result.success) {
            onClose();
            // Optional: trigger refresh
            window.location.reload();
        } else {
            alert(result.error);
        }
        setIsLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-secondary dark:text-white">إضافة مستثمر جديد</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل <span className="text-red-500">*</span></label>
                        <input name="name" required type="text" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الجوال <span className="text-red-500">*</span></label>
                            <input name="phoneNumber" required type="tel" dir="ltr" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهوية</label>
                            <input name="nationalId" type="text" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور <span className="text-red-500">*</span></label>
                        <input name="password" required type="password" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'جاري الإضافة...' : 'إضافة المستثمر'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
