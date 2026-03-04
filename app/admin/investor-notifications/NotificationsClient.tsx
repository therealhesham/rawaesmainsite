"use client";

import { useState, useTransition } from "react";
import { createNotification, deleteNotification } from "./actions";
import { BellRing, User, Users, UserSearch, Megaphone, Type, MessageSquare, Link as LinkIcon, AlertCircle, CheckCircle, Send, Bell, Trash } from "lucide-react";

type Investor = { id: number; name: string };
type NotificationRow = {
    id: number;
    title: string | null;
    message: string | null;
    type: string;
    isGlobal: boolean;
    linkUrl: string;
    createdAt: Date;
    user: { id: number; name: string } | null;
};

export function NotificationsClient({
    investors,
    notifications,
}: {
    investors: Investor[];
    notifications: NotificationRow[];
}) {
    const [mode, setMode] = useState<"individual" | "bulk">("individual");
    const [recipientId, setRecipientId] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [linkUrl, setLinkUrl] = useState("#");
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);
        const fd = new FormData();
        fd.set("mode", mode);
        fd.set("title", title);
        fd.set("message", message);
        fd.set("linkUrl", linkUrl);
        if (mode === "individual") fd.set("recipientId", recipientId);
        startTransition(async () => {
            const res = await createNotification(fd);
            setResult(res as any);
            if ((res as any).success) {
                setTitle("");
                setMessage("");
                setLinkUrl("#");
                setRecipientId("");
            }
        });
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        startTransition(async () => {
            await deleteNotification(id);
            setDeletingId(null);
        });
    };

    return (
        <div className="space-y-8">
            {/* Compose Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                            <BellRing size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">إنشاء تنبيه جديد</h1>
                            <p className="text-sm text-white/70 mt-0.5">
                                يظهر التنبيه في صفحة المستثمر تحت قسم "اشعارات مجموعة روائس"
                            </p>
                        </div>
                    </div>
                </div>
                <div className="h-1 bg-gradient-to-l from-[#C9A84C] via-[#F0C040] to-[#C9A84C]" />

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex gap-3">
                        {(["individual", "bulk"] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm ${mode === m
                                    ? "bg-[#003B46] border-[#003B46] text-white shadow-lg shadow-[#003B46]/20"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-[#003B46]/30 hover:text-[#003B46]"
                                    }`}
                            >
                                <div className="flex items-center justify-center w-[18px]">
                                    {m === "individual" ? <User size={18} /> : <Users size={18} />}
                                </div>
                                {m === "individual" ? "لمستثمر محدد" : `للجميع (${investors.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Recipient */}
                    {mode === "individual" && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <span className="flex items-center gap-1.5">
                                    <UserSearch size={16} className="text-[#003B46]" />
                                    المستثمر
                                </span>
                            </label>
                            <select
                                value={recipientId}
                                onChange={(e) => setRecipientId(e.target.value)}
                                required={mode === "individual"}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all"
                            >
                                <option value="">— اختر مستثمراً —</option>
                                {investors.map((inv) => (
                                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {mode === "bulk" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                            <Megaphone className="text-blue-500 shrink-0" size={24} />
                            <p className="text-sm text-blue-800">
                                سيصل هذا التنبيه لجميع المستثمرين ({investors.length} مستثمر) في صفحاتهم الشخصية.
                            </p>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1.5">
                                <Type size={16} className="text-[#003B46]" />
                                عنوان التنبيه
                            </span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: تحديث هام في محفظتك الاستثمارية"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1.5">
                                <MessageSquare size={16} className="text-[#003B46]" />
                                نص التنبيه
                            </span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="اكتب نص التنبيه هنا..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400 resize-none"
                        />
                    </div>

                    {/* Link URL (optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1.5">
                                <LinkIcon size={16} className="text-[#003B46]" />
                                رابط (اختياري)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="#"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400 font-mono text-sm"
                        />
                    </div>

                    {/* Result */}
                    {result?.error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
                            <AlertCircle className="shrink-0" size={20} />
                            {result.error}
                        </div>
                    )}
                    {result?.success && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700 text-sm">
                            <CheckCircle className="shrink-0" size={20} />
                            تم إرسال التنبيه بنجاح.
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 bg-gradient-to-l from-[#003B46] to-[#005F6B] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#003B46]/25 hover:shadow-[#003B46]/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    إرسال التنبيه
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Sent Notifications List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Bell className="text-[#003B46]" size={24} />
                        <h2 className="text-lg font-bold text-gray-800">التنبيهات المرسلة</h2>
                    </div>
                    <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{notifications.length}</span>
                </div>

                {notifications.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <div className="flex justify-center mb-3 opacity-40">
                            <Bell size={48} />
                        </div>
                        <p>لم يتم إرسال أي تنبيهات بعد.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                            <div key={n.id} className="p-4 md:p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors group">
                                {/* Icon */}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.isGlobal ? "bg-blue-100 text-blue-600" : "bg-[#003B46]/10 text-[#003B46]"}`}>
                                    {n.isGlobal ? <Megaphone size={17} /> : <User size={17} />}
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {n.title && <p className="font-semibold text-gray-800 text-sm">{n.title}</p>}
                                    {n.message && <p className="text-sm text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>}
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.isGlobal ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                            {n.isGlobal ? "للجميع" : `لـ ${n.user?.name ?? "—"}`}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(n.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                    </div>
                                </div>
                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(n.id)}
                                    disabled={deletingId === n.id}
                                    className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                                    title="حذف التنبيه"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
