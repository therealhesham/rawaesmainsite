"use client";

import { useState, useTransition, useRef } from "react";
import { sendInvestorEmail, getEmailLogs, InvestorBasic } from "./actions";

type EmailLog = {
    id: number;
    subject: string;
    sentTo: string;
    recipientId: number | null;
    status: string;
    createdAt: Date;
    recipient: { id: number; name: string } | null;
};

export function MailClient({
    investors,
    logs,
}: {
    investors: InvestorBasic[];
    logs: EmailLog[];
}) {
    const [mode, setMode] = useState<"individual" | "bulk">("individual");
    const [recipientId, setRecipientId] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [result, setResult] = useState<{ success?: boolean; error?: string; count?: number } | null>(null);
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);
        const fd = new FormData();
        fd.set("mode", mode);
        fd.set("subject", subject);
        fd.set("body", body);
        if (mode === "individual") fd.set("recipientId", recipientId);
        startTransition(async () => {
            const res = await sendInvestorEmail(fd);
            setResult(res as any);
            if ((res as any).success) {
                setSubject("");
                setBody("");
                setRecipientId("");
            }
        });
    };

    const withEmailCount = investors.filter((i) => i.email).length;

    return (
        <div className="space-y-8">
            {/* Compose Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                            <span className="material-icons text-[22px]">forward_to_inbox</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">إنشاء رسالة جديدة</h1>
                            <p className="text-sm text-white/70 mt-0.5">
                                {investors.length} مستثمر مسجل — {withEmailCount} لديهم بريد إلكتروني
                            </p>
                        </div>
                    </div>
                </div>
                <div className="h-1 bg-gradient-to-l from-[#C9A84C] via-[#F0C040] to-[#C9A84C]" />

                <form ref={formRef} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
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
                                <span className="material-icons text-[18px]">
                                    {m === "individual" ? "person" : "group"}
                                </span>
                                {m === "individual" ? "رسالة فردية" : `رسالة جماعية (${withEmailCount})`}
                            </button>
                        ))}
                    </div>

                    {/* Recipient (individual only) */}
                    {mode === "individual" && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-icons text-[16px] text-[#003B46]">person_search</span>
                                    المستثمر المستلم
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
                                    <option key={inv.id} value={inv.id} disabled={!inv.email}>
                                        {inv.name} {inv.email ? `(${inv.email})` : "— لا يوجد بريد"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {mode === "bulk" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-icons text-amber-500 shrink-0">info</span>
                            <p className="text-sm text-amber-800">
                                سيتم إرسال الرسالة لجميع المستثمرين الذين لديهم بريد إلكتروني ({withEmailCount} مستثمر).
                            </p>
                        </div>
                    )}

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1.5">
                                <span className="material-icons text-[16px] text-[#003B46]">subject</span>
                                موضوع الرسالة
                            </span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            placeholder="مثال: تقرير أرباح الربع الأول 2025"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1.5">
                                <span className="material-icons text-[16px] text-[#003B46]">edit_note</span>
                                نص الرسالة
                            </span>
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                            rows={8}
                            placeholder="اكتب نص رسالتك هنا..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400 resize-none leading-relaxed"
                        />
                    </div>



                    {/* Result */}
                    {result?.error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
                            <span className="material-icons shrink-0">error_outline</span>
                            {result.error}
                        </div>
                    )}
                    {result?.success && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700 text-sm">
                            <span className="material-icons shrink-0">check_circle</span>
                            تم إرسال الرسالة بنجاح إلى {result.count} {result.count === 1 ? "مستثمر" : "مستثمرين"}.
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
                                    <span className="material-icons text-[18px]">send</span>
                                    إرسال الرسالة
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Email Log */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <span className="material-icons text-[#003B46]">history</span>
                    <h2 className="text-lg font-bold text-gray-800">سجل الرسائل المرسلة</h2>
                </div>

                {logs.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <span className="material-icons text-5xl block mb-3 opacity-40">mail_outline</span>
                        <p>لم يتم إرسال أي رسائل بعد.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {logs.map((log) => {
                            const addresses: string[] = (() => {
                                try { return JSON.parse(log.sentTo); } catch { return []; }
                            })();
                            return (
                                <div key={log.id} className="p-4 md:p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${log.status === "sent" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                                        <span className="material-icons text-[17px]">{log.status === "sent" ? "check_circle" : "error"}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">{log.subject}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {log.recipientId
                                                ? `إلى: ${log.recipient?.name ?? "—"}`
                                                : `جماعي — ${addresses.length} مستلم`}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 shrink-0 pt-0.5">
                                        {new Date(log.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
