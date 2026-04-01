"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, Users, FileText, List, Search, ArrowLeft, SearchX, X, ChevronDown, ChevronUp, ExternalLink, ShieldAlert, Send, BadgeCheck, Briefcase, Loader2, Pencil, Check, ArrowUpDown, Filter } from "lucide-react";
import { getInvestorsPaged, getStats, createInvestor, updateInvestor, checkAdminPermission, getInvestorReportsForAdmin, getInvestmentSectors, createInvestmentSector, updateInvestmentSector } from "./actions";
import { reportTypeLabelAr } from "@/lib/reportTypeAr";
import { AlertModal } from "@/app/components/AlertModal";

const INVESTORS_PAGE_SIZE = 40;

type InvestorListItem = {
    id: number;
    name: string;
    nationalId: string | null;
    password: string;
    phoneNumber: string;
    createdAt: Date;
    _count: { reports: number };
    investmentSectors?: { sector: { id: number; key: string; nameAr: string | null } }[];
};

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalInvestors: 0,
        totalReports: 0,
        unapprovedReports: 0,
        pendingPublishReports: 0,
        publishedReports: 0,
        recentReports: [] as unknown[],
    });
    const [investors, setInvestors] = useState<any[]>([]);
    const [investorsTotal, setInvestorsTotal] = useState(0);
    const [hasMoreInvestors, setHasMoreInvestors] = useState(true);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMoreInvestors, setIsLoadingMoreInvestors] = useState(false);
    const nextInvestorsSkipRef = useRef(0);
    const loadingMoreInvestorsRef = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvestor, setEditingInvestor] = useState<InvestorListItem | null>(null);
    const [canManageInvestors, setCanManageInvestors] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    const [sectors, setSectors] = useState<{ id: number; key: string; nameAr: string | null }[]>([]);
    const [newSectorKey, setNewSectorKey] = useState("");
    const [newSectorName, setNewSectorName] = useState("");
    const [sectorAdding, setSectorAdding] = useState(false);
    const [editingSectorId, setEditingSectorId] = useState<number | null>(null);
    const [editingSectorName, setEditingSectorName] = useState("");
    const [sectorSaving, setSectorSaving] = useState(false);
    const [sectorError, setSectorError] = useState("");
    const [sectorsModalOpen, setSectorsModalOpen] = useState(false);

    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [colFilters, setColFilters] = useState({ name: "", nationalId: "", phoneNumber: "", reports: "", createdAt: "" });
    const [sectorFilterIds, setSectorFilterIds] = useState<number[]>([]);
    const [sectorFilterOpen, setSectorFilterOpen] = useState(false);
    const [activeFilterCol, setActiveFilterCol] = useState<keyof typeof colFilters | null>(null);
    const [filterModalValue, setFilterModalValue] = useState("");

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString("ar-EG"));
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function fetchStatsAndPermission() {
            const [statsData, hasPermission] = await Promise.all([
                getStats(),
                checkAdminPermission("investors-manage", "edit"),
            ]);
            if (cancelled) return;
            setStats(statsData as any);
            setCanManageInvestors(hasPermission);
            getInvestmentSectors().then(setSectors);
        }
        fetchStatsAndPermission();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function fetchFirstInvestorsPage() {
            setIsLoading(true);
            setInvestors([]);
            nextInvestorsSkipRef.current = 0;
            const { investors: page, total, hasMore } = await getInvestorsPaged(
                search,
                0,
                INVESTORS_PAGE_SIZE
            );
            if (cancelled) return;
            setInvestors(page);
            nextInvestorsSkipRef.current = page.length;
            setInvestorsTotal(total);
            setHasMoreInvestors(hasMore);
            setIsLoading(false);
        }
        fetchFirstInvestorsPage();
        return () => {
            cancelled = true;
        };
    }, [search]);

    const loadMoreInvestors = useCallback(async () => {
        if (loadingMoreInvestorsRef.current || !hasMoreInvestors) return;
        loadingMoreInvestorsRef.current = true;
        setIsLoadingMoreInvestors(true);
        try {
            const { investors: page, hasMore } = await getInvestorsPaged(
                search,
                nextInvestorsSkipRef.current,
                INVESTORS_PAGE_SIZE
            );
            setInvestors((prev) => [...prev, ...page]);
            nextInvestorsSkipRef.current += page.length;
            setHasMoreInvestors(hasMore);
        } finally {
            loadingMoreInvestorsRef.current = false;
            setIsLoadingMoreInvestors(false);
        }
    }, [search, hasMoreInvestors]);

    const handleAddSector = async () => {
        if (!newSectorKey.trim()) return;
        setSectorAdding(true);
        setSectorError("");
        const res = await createInvestmentSector(newSectorKey, newSectorName);
        if (res.error) {
            setSectorError(res.error);
        } else {
            setNewSectorKey("");
            setNewSectorName("");
            getInvestmentSectors().then(setSectors);
        }
        setSectorAdding(false);
    };

    const handleSaveSectorName = async (id: number) => {
        if (!editingSectorName.trim()) return;
        setSectorSaving(true);
        setSectorError("");
        const res = await updateInvestmentSector(id, editingSectorName);
        if (res.error) {
            setSectorError(res.error);
        } else {
            setSectors((prev) => prev.map((s) => s.id === id ? { ...s, nameAr: editingSectorName.trim() } : s));
            setEditingSectorId(null);
        }
        setSectorSaving(false);
    };

    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    }, [sortField]);

    const hasActiveFilters = !!(colFilters.name || colFilters.nationalId || colFilters.phoneNumber || colFilters.reports || colFilters.createdAt || sectorFilterIds.length > 0);

    const clearAllFilters = useCallback(() => {
        setColFilters({ name: "", nationalId: "", phoneNumber: "", reports: "", createdAt: "" });
        setSectorFilterIds([]);
        setSortField(null);
    }, []);

    const openFilterModal = useCallback((col: keyof typeof colFilters) => {
        setActiveFilterCol(col);
        setFilterModalValue(colFilters[col] || "");
    }, [colFilters]);

    const applyFilterModal = useCallback(() => {
        if (!activeFilterCol) return;
        setColFilters((prev) => ({ ...prev, [activeFilterCol]: filterModalValue }));
        setActiveFilterCol(null);
    }, [activeFilterCol, filterModalValue]);

    const clearFilterModal = useCallback(() => {
        if (!activeFilterCol) return;
        setColFilters((prev) => ({ ...prev, [activeFilterCol]: "" }));
        setActiveFilterCol(null);
    }, [activeFilterCol]);

    const filterColLabels: Record<string, string> = { name: "المستثمر", nationalId: "رقم الهوية", phoneNumber: "رقم الجوال", reports: "التقارير", createdAt: "تاريخ الانضمام" };

    const filteredInvestors = useMemo(() => {
        let result = [...investors] as InvestorListItem[];

        if (colFilters.name) result = result.filter((inv) => inv.name.toLowerCase().includes(colFilters.name.toLowerCase()));
        if (colFilters.nationalId) result = result.filter((inv) => (inv.password ?? "").includes(colFilters.nationalId));
        if (colFilters.phoneNumber) result = result.filter((inv) => (inv.phoneNumber ?? "").includes(colFilters.phoneNumber));
        if (colFilters.reports) {
            const n = parseInt(colFilters.reports);
            if (!isNaN(n)) result = result.filter((inv) => inv._count.reports === n);
        }
        if (colFilters.createdAt) result = result.filter((inv) => new Date(inv.createdAt).toLocaleDateString("ar-EG").includes(colFilters.createdAt));
        if (sectorFilterIds.length > 0) {
            result = result.filter((inv) => {
                const ids = inv.investmentSectors?.map((s) => s.sector.id) ?? [];
                return sectorFilterIds.some((id) => ids.includes(id));
            });
        }

        if (sortField) {
            result.sort((a, b) => {
                let valA: string | number, valB: string | number;
                switch (sortField) {
                    case "name": valA = a.name; valB = b.name; break;
                    case "nationalId": valA = a.password ?? ""; valB = b.password ?? ""; break;
                    case "phoneNumber": valA = a.phoneNumber ?? ""; valB = b.phoneNumber ?? ""; break;
                    case "reports": valA = a._count.reports; valB = b._count.reports; break;
                    case "createdAt": valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); break;
                    default: return 0;
                }
                if (valA < valB) return sortDir === "asc" ? -1 : 1;
                if (valA > valB) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [investors, colFilters, sectorFilterIds, sortField, sortDir]);

    const investorsScrollSentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = investorsScrollSentinelRef.current;
        if (!node || isLoading || !hasMoreInvestors) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const hit = entries.some((e) => e.isIntersecting);
                if (hit) void loadMoreInvestors();
            },
            { root: null, rootMargin: "120px", threshold: 0 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [isLoading, hasMoreInvestors, loadMoreInvestors, investors.length]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-white">نظرة عامة</h1>
                    <p className="text-gray-500 mt-1">مرحباً بك في لوحة تحكم روائس</p>
                </div>
                <div className="flex items-center gap-3">
                    {canManageInvestors && (
                        <>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Plus size={18} />
                                <span>إضافة مستثمر</span>
                            </button>
                            <button
                                onClick={() => { setSectorError(""); setSectorsModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-secondary dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm text-sm"
                            >
                                <Briefcase size={18} className="text-primary" />
                                القطاعات
                                {sectors.length > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                                        {sectors.length}
                                    </span>
                                )}
                            </button>
                        </>
                    )}
                    <span className="text-sm text-gray-500">آخر تحديث: {currentTime}</span>
                    <button onClick={() => window.location.reload()} className="p-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-primary transition-colors">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-secondary dark:text-white mb-4">الإحصائيات</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
                    <StatsCard
                        title=" المستثمرين"
                        value={stats.totalInvestors}
                        icon={<Users size={24} />}
                        color="bg-blue-500"
                        href="#investors-list"
                    />
                    <StatsCard
                        title="إجمالي التقارير"
                        value={stats.totalReports}
                        icon={<FileText size={24} />}
                        color="bg-slate-500"
                        href="/admin/review"
                    />
                    <StatsCard
                        title="تقارير غير معتمدة"
                        value={stats.unapprovedReports}
                        icon={<ShieldAlert size={24} />}
                        color="bg-amber-500"
                        href="/admin/review?filter=unapproved"
                    />
                    <StatsCard
                        title="تقارير في انتظار النشر"
                        // titleHint="(معتمدة وغير منشورة)"
                        value={stats.pendingPublishReports}
                        icon={<Send size={24} />}
                        color="bg-teal-500"
                        href="/admin/review?filter=pending-publish"
                    />
                    <StatsCard
                        title="تقارير منشورة"
                        value={stats.publishedReports}
                        icon={<BadgeCheck size={24} />}
                        color="bg-emerald-500"
                        href="/admin/review?filter=published"
                    />
                </div>
            </div>

            {/* Investors Table Section */}
            <div
                id="investors-list"
                className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden scroll-mt-6"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <List size={22} className="text-primary" />
                        قائمة المستثمرين
                    </h2>

                    <div className="relative w-full md:w-96">
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={20} />
                        </div>
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
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                            <tr>
                                <th className="px-6 py-4 text-center font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("name")}>
                                            <span>المستثمر</span>
                                            {sortField === "name" ? (sortDir === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                        <button type="button" onClick={() => openFilterModal("name")} className={`p-1 rounded-md transition-colors ${colFilters.name ? "text-primary bg-primary/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="تصفية">
                                            <Filter size={14} />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("nationalId")}>
                                            <span>رقم الهوية</span>
                                            {sortField === "nationalId" ? (sortDir === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                        <button type="button" onClick={() => openFilterModal("nationalId")} className={`p-1 rounded-md transition-colors ${colFilters.nationalId ? "text-primary bg-primary/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="تصفية">
                                            <Filter size={14} />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("phoneNumber")}>
                                            <span>رقم الجوال</span>
                                            {sortField === "phoneNumber" ? (sortDir === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                        <button type="button" onClick={() => openFilterModal("phoneNumber")} className={`p-1 rounded-md transition-colors ${colFilters.phoneNumber ? "text-primary bg-primary/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="تصفية">
                                            <Filter size={14} />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <span>قطاعات الاستثمار</span>
                                        <button type="button" onClick={() => setSectorFilterOpen(true)} className={`p-1 rounded-md transition-colors relative ${sectorFilterIds.length > 0 ? "text-primary bg-primary/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="تصفية">
                                            <Filter size={14} />
                                            {sectorFilterIds.length > 0 && <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">{sectorFilterIds.length}</span>}
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("reports")}>
                                            <span>التقارير</span>
                                            {sortField === "reports" ? (sortDir === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                        <button type="button" onClick={() => openFilterModal("reports")} className={`p-1 rounded-md transition-colors ${colFilters.reports ? "text-primary bg-primary/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="تصفية">
                                            <Filter size={14} />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
                                            <span>تاريخ الانضمام</span>
                                            {sortField === "createdAt" ? (sortDir === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                        <button type="button" onClick={() => openFilterModal("createdAt")} className={`p-1 rounded-md transition-colors ${colFilters.createdAt ? "text-primary bg-primary/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="تصفية">
                                            <Filter size={14} />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center font-medium">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredInvestors.length > 0 ? (
                                filteredInvestors.map((investor) => (
                                    <InvestorRowWithReports
                                        key={investor.id}
                                        investor={investor}
                                        canManageInvestors={canManageInvestors}
                                        onEdit={() => setEditingInvestor(investor)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center mb-2 opacity-20"><SearchX size={36} /></div>
                                        <p>لم يتم العثور على مستثمرين</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div
                    ref={investorsScrollSentinelRef}
                    className="h-px w-full shrink-0"
                    aria-hidden
                />
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                    <span>
                        {isLoading
                            ? "…"
                            : hasActiveFilters
                              ? `عرض ${filteredInvestors.length} من ${investors.length} (مُصفّى) — إجمالي ${investorsTotal}`
                              : investorsTotal > investors.length
                                ? `عرض ${investors.length} من ${investorsTotal} مستثمر`
                                : `عرض ${investors.length} مستثمر`}
                    </span>
                    <div className="flex items-center gap-3">
                        {hasActiveFilters && (
                            <button type="button" onClick={clearAllFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                                <X size={12} />
                                مسح التصفية
                            </button>
                        )}
                        {isLoadingMoreInvestors && (
                            <span className="text-primary flex items-center gap-2">
                                <RefreshCw size={14} className="animate-spin" />
                                جاري تحميل المزيد…
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <AddInvestorModal onClose={() => setIsModalOpen(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingInvestor && (
                    <EditInvestorModal investor={editingInvestor} onClose={() => setEditingInvestor(null)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeFilterCol && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setActiveFilterCol(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-xs"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="font-bold text-secondary dark:text-white flex items-center gap-2 text-sm">
                                    <Search size={16} className="text-primary" />
                                    بحث في {filterColLabels[activeFilterCol]}
                                </h3>
                                <button type="button" onClick={() => setActiveFilterCol(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4">
                                <input
                                    type="text"
                                    autoFocus
                                    value={filterModalValue}
                                    onChange={(e) => setFilterModalValue(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") applyFilterModal(); if (e.key === "Escape") setActiveFilterCol(null); }}
                                    placeholder={activeFilterCol === "reports" ? "أدخل العدد..." : "أدخل نص البحث..."}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                />
                                <p className="text-[11px] text-gray-400 mt-2">اضغط Enter للتطبيق</p>
                            </div>
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                                <button type="button" onClick={clearFilterModal} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                                    مسح
                                </button>
                                <button type="button" onClick={applyFilterModal} className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                                    تطبيق
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {sectorFilterOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setSectorFilterOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-sm"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="font-bold text-secondary dark:text-white flex items-center gap-2">
                                    <Filter size={18} className="text-primary" />
                                    تصفية حسب القطاع
                                </h3>
                                <button onClick={() => setSectorFilterOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {sectors.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">لا توجد قطاعات في النظام.</p>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button type="button" onClick={() => setSectorFilterIds(sectors.map((s) => s.id))} className="text-xs text-primary hover:underline">تحديد الكل</button>
                                            <span className="text-gray-300 dark:text-gray-600">|</span>
                                            <button type="button" onClick={() => setSectorFilterIds([])} className="text-xs text-primary hover:underline">إلغاء الكل</button>
                                        </div>
                                        {sectors.map((s) => (
                                            <label key={s.id} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${sectorFilterIds.includes(s.id) ? "bg-primary/5 border-primary/30 dark:bg-primary/10" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30"}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={sectorFilterIds.includes(s.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSectorFilterIds((prev) => [...prev, s.id]);
                                                        else setSectorFilterIds((prev) => prev.filter((id) => id !== s.id));
                                                    }}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium text-secondary dark:text-white">{s.nameAr || s.key}</span>
                                            </label>
                                        ))}
                                    </>
                                )}
                            </div>
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                <button type="button" onClick={() => setSectorFilterOpen(false)} className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                                    تطبيق
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {sectorsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setSectorsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                        >
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-card-dark z-10">
                                <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                                    <Briefcase size={20} className="text-primary" />
                                    قطاعات الاستثمار
                                </h2>
                                <button
                                    onClick={() => setSectorsModalOpen(false)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="space-y-2">
                                    {sectors.length === 0 ? (
                                        <p className="text-sm text-gray-500">لا توجد قطاعات حالياً.</p>
                                    ) : (
                                        sectors.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                            >
                                                <span className="text-[11px] text-gray-400 font-mono shrink-0 min-w-[60px]">{s.key}</span>
                                                {editingSectorId === s.id ? (
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <input
                                                            type="text"
                                                            value={editingSectorName}
                                                            onChange={(e) => setEditingSectorName(e.target.value)}
                                                            className="flex-1 p-1.5 bg-white dark:bg-gray-900 border border-primary/40 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                            autoFocus
                                                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveSectorName(s.id); if (e.key === "Escape") setEditingSectorId(null); }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveSectorName(s.id)}
                                                            disabled={sectorSaving || !editingSectorName.trim()}
                                                            className="p-1.5 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                                            title="حفظ"
                                                        >
                                                            {sectorSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingSectorId(null)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                            title="إلغاء"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="font-medium text-secondary dark:text-white text-sm flex-1 min-w-0">{s.nameAr || s.key}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setEditingSectorId(s.id); setEditingSectorName(s.nameAr || ""); setSectorError(""); }}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                                            title="تعديل الاسم"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {sectorError && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{sectorError}</p>
                                )}

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <p className="text-xs font-medium text-gray-500 mb-3">إضافة قطاع جديد</p>
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div className="flex-1 min-w-[120px]">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">المفتاح (إنجليزي)</label>
                                            <input
                                                type="text"
                                                value={newSectorKey}
                                                onChange={(e) => setNewSectorKey(e.target.value)}
                                                placeholder="مثال: cars"
                                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[140px]">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">الاسم بالعربي</label>
                                            <input
                                                type="text"
                                                value={newSectorName}
                                                onChange={(e) => setNewSectorName(e.target.value)}
                                                placeholder="مثال: تأجير سيارات"
                                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddSector}
                                            disabled={sectorAdding || !newSectorKey.trim()}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                        >
                                            {sectorAdding ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                            إضافة
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

function InvestorRowWithReports({
    investor,
    canManageInvestors,
    onEdit,
}: {
    investor: InvestorListItem;
    canManageInvestors: boolean;
    onEdit: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [reports, setReports] = useState<
        Awaited<ReturnType<typeof getInvestorReportsForAdmin>>
    >([]);
    const [loading, setLoading] = useState(false);
    const count = investor._count.reports;
    const canToggle = count > 0;

    async function toggleReports() {
        if (!canToggle) return;
        if (open) {
            setOpen(false);
            return;
        }
        setOpen(true);
        if (reports.length === 0) {
            setLoading(true);
            try {
                const data = await getInvestorReportsForAdmin(investor.id);
                setReports(data);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
            <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                            {investor.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-secondary dark:text-white">{investor.name}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 dir-ltr text-right font-mono text-sm">
                    {investor.password}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 dir-ltr text-right font-mono text-sm">
                    {investor.phoneNumber}
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px] ms-auto">
                        {investor.investmentSectors && investor.investmentSectors.length > 0 ? (
                            investor.investmentSectors.map((row) => (
                                <span
                                    key={row.sector.id}
                                    className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs"
                                >
                                    {row.sector.nameAr || row.sector.key}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400">—</span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <button
                        type="button"
                        onClick={toggleReports}
                        disabled={!canToggle}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            canToggle
                                ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-default"
                        }`}
                        aria-expanded={open}
                        aria-label={`تقارير ${investor.name}: ${count}`}
                    >
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {count}
                    </button>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {new Date(investor.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {canManageInvestors && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary transition-all shadow-sm"
                                title="تعديل بيانات المستثمر"
                            >
                                <Pencil size={16} />
                                <span>تعديل</span>
                            </button>
                        )}
                        <Link
                            href={`/admin/investors/${investor.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                            <span>التفاصيل</span>
                            <ArrowLeft size={16} />
                        </Link>
                    </div>
                </td>
            </tr>
            {open && (
                <tr className="bg-gray-50/80 dark:bg-gray-900/40">
                    <td colSpan={8} className="px-6 py-0 border-b border-gray-100 dark:border-gray-800">
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18 }}
                            className="py-4 pr-4 pl-4 md:pr-12"
                        >
                            {loading ? (
                                <p className="text-sm text-gray-500 text-center py-2">جاري التحميل...</p>
                            ) : reports.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-2">لا توجد تقارير</p>
                            ) : (
                                <ul className="space-y-2 text-right">
                                    {reports.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark px-4 py-3 text-sm"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-secondary dark:text-white truncate">
                                                    {r.fileName || reportTypeLabelAr(r.type) || `تقرير #${r.id}`}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                                                    <span>{reportTypeLabelAr(r.type)}</span>
                                                    <span>
                                                        الإصدار:{" "}
                                                        {new Date(r.releaseDate).toLocaleDateString("ar-EG")}
                                                    </span>
                                                    {r.isApproved ? (
                                                        <span className="text-emerald-600">معتمد</span>
                                                    ) : (
                                                        <span className="text-amber-600">قيد المراجعة</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/admin/investors/${investor.id}?report=${r.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 shrink-0 text-primary hover:underline"
                                            >
                                                <ExternalLink size={16} />
                                                فتح
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    </td>
                </tr>
            )}
        </>
    );
}

/** ألوان مربع الأيقونة — صيغ نصية ثابتة ليعمل Tailwind JIT */
const STATS_ACCENT: Record<string, { iconBox: string; blob: string }> = {
    "bg-blue-500": {
        iconBox: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        blob: "bg-blue-500",
    },
    "bg-primary": {
        iconBox: "bg-primary/15 text-primary",
        blob: "bg-primary",
    },
    "bg-purple-500": {
        iconBox: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
        blob: "bg-purple-500",
    },
    "bg-slate-500": {
        iconBox: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
        blob: "bg-slate-500",
    },
    "bg-amber-500": {
        iconBox: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        blob: "bg-amber-500",
    },
    "bg-teal-500": {
        iconBox: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
        blob: "bg-teal-500",
    },
    "bg-emerald-500": {
        iconBox: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        blob: "bg-emerald-500",
    },
};

function StatsCard({
    title,
    titleHint,
    value,
    icon,
    color,
    href,
}: {
    title: string;
    titleHint?: string;
    value: number | string;
    icon: ReactNode;
    color: string;
    href?: string;
}) {
    const accent = STATS_ACCENT[color] ?? {
        iconBox: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
        blob: "bg-gray-500",
    };

    const card = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group h-full min-h-0 ${
                href
                    ? "cursor-pointer transition-all hover:border-primary/35 hover:shadow-md dark:hover:border-primary/30"
                    : ""
            }`}
        >
            <div className="relative z-0 pe-14">
                <div
                    className="text-gray-500 font-medium mb-1 flex min-h-[2.75rem] flex-col gap-0.5 leading-snug sm:min-h-[3rem]"
                    title={titleHint ? `${title} ${titleHint}` : title}
                >
                    <span className="line-clamp-2 break-words">{title}</span>
                    {titleHint ? (
                        <span className="line-clamp-1 text-xs font-normal text-gray-400 dark:text-gray-500">
                            {titleHint}
                        </span>
                    ) : null}
                </div>
                <div className="text-3xl font-bold tabular-nums text-secondary dark:text-white">{value}</div>
            </div>
            <div
                className={`absolute top-4 left-4 z-10 w-12 h-12 rounded-xl flex items-center justify-center ${accent.iconBox}`}
            >
                {icon}
            </div>
            <div
                className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none ${accent.blob}`}
            />
        </motion.div>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="block h-full min-h-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
                {card}
            </Link>
        );
    }

    return card;
}

function PhoneInput({ defaultValue, className }: { defaultValue?: string; className: string }) {
    const [value, setValue] = useState(defaultValue ?? "");

    return (
        <input
            name="phoneNumber"
            required
            type="tel"
            dir="ltr"
            inputMode="numeric"
            maxLength={10}
            minLength={8}
            placeholder="5XXXXXXXX"
            value={value}
            onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 0 && v[0] !== "5") v = "";
                setValue(v.slice(0, 10));
            }}
            className={className}
        />
    );
}

function EditInvestorModal({ investor, onClose }: { investor: InvestorListItem; onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [sectors, setSectors] = useState<{ id: number; key: string; nameAr: string | null }[]>([]);

    useEffect(() => {
        getInvestmentSectors().then(setSectors);
    }, []);

    const selectedSectorIds = investor.investmentSectors?.map((x) => x.sector.id) ?? [];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setFormError(null);
        const formData = new FormData(e.currentTarget);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const result = await updateInvestor(formData);
        if (result.success) {
            onClose();
            window.location.reload();
        } else {
            setFormError(result.error ?? "حدث خطأ.");
        }
        setIsLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AlertModal
                open={!!formError}
                onClose={() => setFormError(null)}
                title="خطأ"
                message={formError ?? ""}
                variant="error"
            />
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
                className="relative bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-card-dark z-10">
                    <h3 className="text-xl font-bold text-secondary dark:text-white">تعديل بيانات المستثمر</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form key={investor.id} onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="hidden" name="userId" value={investor.id} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            الاسم الكامل <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            required
                            type="text"
                            defaultValue={investor.name}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                رقم الجوال <span className="text-red-500">*</span>
                            </label>
                            <PhoneInput
                                defaultValue={investor.phoneNumber ?? ""}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                رقم الهوية <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="nationalId"
                                required
                                type="text"
                                autoComplete="off"
                                defaultValue={investor.password ?? ""}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            {/* <p className="text-xs text-gray-500 mt-1">نفس الرقم المستخدم لتسجيل الدخول مع رقم الجوال (يُخزَّن في النظام كما يظهر).</p> */}
                        </div>
                    </div>

                    {sectors.length > 0 && (
                        <div>
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">قطاعات الاستثمار</span>
                            <p className="text-xs text-gray-500 mb-2">يمكن اختيار أكثر من قطاع واحد.</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                {sectors.map((s) => (
                                    <label
                                        key={s.id}
                                        className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <input
                                            type="checkbox"
                                            name="sectorIds"
                                            value={s.id}
                                            defaultChecked={selectedSectorIds.includes(s.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span>{s.nameAr || s.key}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

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
                            {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function AddInvestorModal({ onClose }: { onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [sectors, setSectors] = useState<{ id: number; key: string; nameAr: string | null }[]>([]);

    useEffect(() => {
        getInvestmentSectors().then(setSectors);
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setFormError(null);
        const formData = new FormData(e.currentTarget);

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = await createInvestor(formData);

        if (result.success) {
            onClose();
            window.location.reload();
        } else {
            setFormError(result.error ?? "حدث خطأ.");
        }
        setIsLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AlertModal
                open={!!formError}
                onClose={() => setFormError(null)}
                title="خطأ"
                message={formError ?? ""}
                variant="error"
            />
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
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
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
                            <PhoneInput className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                رقم الهوية <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="nationalId"
                                required
                                type="text"
                                autoComplete="off"
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-xs text-gray-500 mt-1">يُستخدم مع رقم الجوال لتسجيل الدخول.</p>
                        </div>
                    </div>

                    {sectors.length > 0 && (
                        <div>
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                قطاعات الاستثمار
                            </span>
                            <p className="text-xs text-gray-500 mb-2">يمكن اختيار أكثر من قطاع واحد.</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                {sectors.map((s) => (
                                    <label
                                        key={s.id}
                                        className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <input
                                            type="checkbox"
                                            name="sectorIds"
                                            value={s.id}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span>{s.nameAr || s.key}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

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
