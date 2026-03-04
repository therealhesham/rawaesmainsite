"use client";

import { useState, useTransition } from "react";
import { ContactMessagesTable } from "./ContactMessagesTable";
import { deleteEmailLog, deleteEmailLogsBulk } from "../../contact-actions";

function ConfirmDeleteModal({
    isOpen,
    isDeleting,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-card-dark w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                    <span className="material-icons text-2xl">warning</span>
                </div>
                <h3 className="text-lg font-bold text-secondary dark:text-white">تأكيد الحذف</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    هل أنت متأكد من رغبتك في حذف هذا السجل نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl disabled:opacity-50 transition-colors"
                    >
                        {isDeleting ? "جاري الحذف..." : "حذف"}
                    </button>
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

type Message = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    message: string | null;
    createdAt: Date | string;
};

type EmailLog = {
    id: number;
    subject: string;
    body: string;
    sentTo: string;
    recipientId: number | null;
    status: string;
    createdAt: Date | string;
    recipient: { id: number; name: string } | null;
};

export function MessagesPageClient({
    messages,
    emailLogs,
}: {
    messages: Message[];
    emailLogs: EmailLog[];
}) {
    const [tab, setTab] = useState<"inbox" | "sent">("inbox");
    const [openLog, setOpenLog] = useState<EmailLog | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    // Bulk delete state for Sent Mail
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const handleDelete = async (id: number) => {
        startTransition(async () => {
            const result = await deleteEmailLog(id);
            if (result?.error) {
                alert(result.error);
            } else {
                setDeleteConfirmId(null);
            }
        });
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsBulkDeleting(true);
        try {
            const result = await deleteEmailLogsBulk(selectedIds);
            if (result?.error) {
                alert(result.error);
            } else {
                setShowBulkConfirm(false);
                setSelectedIds([]);
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === emailLogs.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(emailLogs.map((log) => log.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const tabs = [
        { key: "inbox" as const, label: "الرسائل الواردة", icon: "inbox", count: messages.length },
        { key: "sent" as const, label: "البريد المرسل", icon: "forward_to_inbox", count: emailLogs.length },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <ConfirmDeleteModal
                isOpen={deleteConfirmId !== null}
                isDeleting={isPending}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            />
            <ConfirmDeleteModal
                isOpen={showBulkConfirm}
                isDeleting={isBulkDeleting}
                onClose={() => setShowBulkConfirm(false)}
                onConfirm={handleBulkDelete}
            />
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === t.key
                            ? "border-[#003B46] text-[#003B46] dark:text-white dark:border-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        <span className="material-icons text-[18px]">{t.icon}</span>
                        {t.label}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tab === t.key ? "bg-[#003B46] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}>
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Inbox Tab */}
            {tab === "inbox" && (
                <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary">inbox</span>
                            الرسائل ({messages.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        {messages.length === 0 ? (
                            <div className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                <span className="material-icons text-5xl mb-3 opacity-30 block">inbox</span>
                                <p>لا توجد رسائل حتى الآن</p>
                            </div>
                        ) : (
                            <ContactMessagesTable messages={messages} />
                        )}
                    </div>
                </div>
            )}

            {/* Sent Mail Tab */}
            {tab === "sent" && (
                <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary">forward_to_inbox</span>
                            البريد المرسل ({emailLogs.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        {emailLogs.length === 0 ? (
                            <div className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                <span className="material-icons text-5xl mb-3 opacity-30 block">forward_to_inbox</span>
                                <p>لم يتم إرسال أي رسائل بعد</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedIds.length > 0 && (
                                    <div className="bg-primary/5 border border-primary/20 dark:bg-primary/10 dark:border-primary/30 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 mx-6 mt-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                                                {selectedIds.length}
                                            </span>
                                            <span className="text-secondary dark:text-white font-medium">
                                                عناصر محددة
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowBulkConfirm(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                                        >
                                            <span className="material-icons text-sm">delete_sweep</span>
                                            حذف المحدد
                                        </button>
                                    </div>
                                )}
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
                                        <tr>
                                            <th className="px-6 py-4 text-center font-medium w-16">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary cursor-pointer"
                                                    checked={emailLogs.length > 0 && selectedIds.length === emailLogs.length}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-right font-medium">الموضوع</th>
                                            <th className="px-6 py-4 text-right font-medium">المستلم</th>
                                            <th className="px-6 py-4 text-right font-medium">عدد المستلمين</th>
                                            <th className="px-6 py-4 text-center font-medium">الحالة</th>
                                            <th className="px-6 py-4 text-center font-medium">التاريخ</th>
                                            <th className="px-6 py-4 text-center font-medium">عرض</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {emailLogs.map((log) => {
                                            const addresses: string[] = (() => {
                                                try { return JSON.parse(log.sentTo); } catch { return []; }
                                            })();
                                            return (
                                                <tr key={log.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedIds.includes(log.id) ? "bg-primary/5 dark:bg-primary/10" : ""}`}>
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary cursor-pointer"
                                                            checked={selectedIds.includes(log.id)}
                                                            onChange={() => toggleSelect(log.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium text-secondary dark:text-white text-sm">{log.subject}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {log.recipientId
                                                            ? log.recipient?.name ?? "—"
                                                            : <span className="text-blue-600 dark:text-blue-400 font-medium">جماعي</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {addresses.length} بريد
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${log.status === "sent"
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                            }`}>
                                                            <span className="material-icons text-[12px]">
                                                                {log.status === "sent" ? "check_circle" : "error"}
                                                            </span>
                                                            {log.status === "sent" ? "أُرسل" : "فشل"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                                                        {new Date(log.createdAt).toLocaleString("ar-EG", {
                                                            dateStyle: "short",
                                                            timeStyle: "short",
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setOpenLog(log)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                                                            >
                                                                <span className="material-icons text-sm">visibility</span>
                                                                عرض
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={isPending && deleteConfirmId === log.id}
                                                                onClick={() => setDeleteConfirmId(log.id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                                aria-label="حذف"
                                                            >
                                                                <span className="material-icons text-sm">delete</span>
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Email Log Detail Modal */}
            {openLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenLog(null)} />
                    <div className="relative bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-white/80">forward_to_inbox</span>
                                <h2 className="text-lg font-bold text-white">{openLog.subject}</h2>
                            </div>
                            <button
                                onClick={() => setOpenLog(null)}
                                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="h-1 bg-gradient-to-l from-[#C9A84C] via-[#F0C040] to-[#C9A84C]" />

                        <div className="p-6 space-y-4">
                            {/* Recipients */}
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">المستلمون</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {openLog.recipientId
                                        ? openLog.recipient?.name ?? "—"
                                        : `جماعي — ${(() => { try { return JSON.parse(openLog.sentTo).length; } catch { return "؟"; } })()} مستلم`}
                                </p>
                            </div>

                            {/* Status */}
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">الحالة</span>
                                <span className={`inline-flex items-center gap-1 text-sm px-2.5 py-1 rounded-full font-medium ${openLog.status === "sent"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                    }`}>
                                    {openLog.status === "sent" ? "✓ أُرسل بنجاح" : "✗ فشل الإرسال"}
                                </span>
                            </div>

                            {/* Date */}
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">التاريخ</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(openLog.createdAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                                </p>
                            </div>

                            {/* Body */}
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">نص الرسالة</span>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap min-h-[80px] max-h-60 overflow-y-auto leading-relaxed">
                                    {openLog.body}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setOpenLog(null)}
                                className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
