"use client";

import { useState } from "react";

interface QuickContactSettings {
    legalPhone: string | null;
    managementPhone: string | null;
    suggestionsPhone: string | null;
}

const options = (settings: QuickContactSettings | null) => [
    { title: "الإدارة القانونية", phone: settings?.legalPhone || "", icon: "gavel" },
    { title: "الإدارة العليا", phone: settings?.managementPhone || "", icon: "business_center" },
    { title: "اقتراحات ومساعدة", phone: settings?.suggestionsPhone || "", icon: "lightbulb_outline" },
];

export default function FloatingWhatsAppButton({
    settings,
}: {
    settings: QuickContactSettings | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const items = options(settings);

    const handleOptionClick = (phone: string) => {
        if (phone) {
            window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
        }
    };

    return (
        <>
            {/* Transparent backdrop - tap anywhere to close */}
            {isOpen && (
                <button
                    type="button"
                    aria-label="إغلاق"
                    onClick={() => setIsOpen(false)}
                    className="md:hidden fixed inset-0 z-40 bg-black/10"
                />
            )}

            <div className="md:hidden fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
                {/* Floating options - transparent glass style */}
                {items.map((item, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => item.phone && handleOptionClick(item.phone)}
                        disabled={!item.phone}
                        className={`flex items-center gap-2 pr-2 pl-3 py-2 rounded-2xl backdrop-blur-xl border border-white/25 dark:border-white/15 transition-all duration-300 ${
                            isOpen
                                ? "opacity-100 translate-y-0 scale-100"
                                : "opacity-0 translate-y-4 scale-75 pointer-events-none"
                        } ${
                            item.phone
                                ? "bg-white/40 dark:bg-white/15 hover:bg-white/60 dark:hover:bg-white/25 active:scale-95 text-[#003B46] dark:text-white shadow-lg shadow-black/5"
                                : "bg-white/20 dark:bg-white/5 text-gray-500 cursor-not-allowed"
                        }`}
                        style={{ transitionDelay: isOpen ? `${(2 - i) * 50}ms` : "0ms" }}
                    >
                        <span className="material-icons text-[22px] text-[#25D366] shrink-0">
                            {item.icon}
                        </span>
                        <span className="text-sm font-medium max-w-[140px] truncate">
                            {item.title}
                        </span>
                    </button>
                ))}

                {/* Main FAB */}
                <button
                    type="button"
                    aria-label={isOpen ? "إغلاق" : "تواصل عبر واتساب"}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 hover:bg-[#20BD5A] active:scale-95 transition-all duration-200 flex items-center justify-center shrink-0"
                >
                    {isOpen ? (
                        <span className="material-icons text-3xl">close</span>
                    ) : (
                        <img
                            alt="WhatsApp"
                            className="w-7 h-7 brightness-0 invert"
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        />
                    )}
                </button>
            </div>
        </>
    );
}
