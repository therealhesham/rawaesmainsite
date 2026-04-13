"use client";

import { useState } from "react";
import Link from "next/link";

export default function OtpTestPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [ok, setOk] = useState<boolean | null>(null);

    const sendTestOtp = async () => {
        setMessage(null);
        setOk(null);
        setLoading(true);
        try {
            const res = await fetch("/api/test/send-otp", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setOk(true);
                setMessage(
                    `تم الإرسال إلى ${data.maskedPhone ?? "966533370402"}. تحقق من الرسائل.`
                );
            } else {
                setOk(false);
                setMessage(data.error || "فشل الإرسال");
            }
        } catch {
            setOk(false);
            setMessage("حدث خطأ في الشبكة.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-8 shadow-lg">
                <h1 className="text-xl font-bold text-secondary dark:text-white mb-2">
                    اختبار إرسال OTP
                </h1>
                <p className="text-sm text-secondary/70 dark:text-gray-400 mb-6">
                    يُرسل رمز تحقق من 6 أرقام إلى الجوال{" "}
                    <span dir="ltr" className="font-mono font-semibold text-primary">
                        533370402
                    </span>
                </p>
                <button
                    type="button"
                    onClick={sendTestOtp}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-[#d4af79] to-[#c49b60] text-white font-semibold disabled:opacity-60"
                >
                    {loading ? "جاري الإرسال…" : "إرسال OTP"}
                </button>
                {message && (
                    <p
                        className={`mt-4 text-sm ${ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                        {message}
                    </p>
                )}
                <Link
                    href="/"
                    className="mt-6 inline-block text-sm text-primary hover:underline"
                >
                    ← العودة للرئيسية
                </Link>
            </div>
        </div>
    );
}
