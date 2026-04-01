"use client";

import { useState } from "react";

interface QuickContactSettings {
    legalPhone: string | null;
    managementPhone: string | null;
    suggestionsPhone: string | null;
}

export default function QuickContact({ settings }: { settings: QuickContactSettings | null }) {
    const [isOpen, setIsOpen] = useState(false);

    // Fallback to empty strings if settings are null or fields are null
    const options = [
        { title: "الإدارة القانونية", phone: settings?.legalPhone || "" },
        { title: "الإدارة العليا", phone: settings?.managementPhone || "" },
        { title: "للاقتراحات والمساعدة", phone: settings?.suggestionsPhone || "" },
    ];

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center">
            <h3 className="text-lg font-bold text-center text-[#003B46] dark:text-white mb-6 leading-relaxed break-words px-2">
                التواصل السريع للاستفسارات والاقتراحات
            </h3>

            <div className="relative w-full flex flex-col items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 active:scale-95 text-white py-3 px-8 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 w-full md:w-auto"
                >
                    <span className="font-bold text-lg">تواصل معنا</span>
                    <img
                        alt="Whatsapp"
                        className="w-6 h-6 filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    />
                </button>

                {isOpen && (
                    <div className="mt-4 w-full md:w-auto min-w-[250px] flex flex-col gap-3 animate-fade-in-up">
                        {options.map((item, i) => (
                            <a
                                key={i}
                                href={item.phone ? `https://wa.me/${item.phone.replace(/\D/g, '')}` : "#"}
                                target={item.phone ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    if (!item.phone) {
                                        e.preventDefault();
                                        setIsOpen(false);
                                    }
                                }}
                                className={`group/item flex items-center justify-between py-3 px-5 rounded-xl border transition-all duration-200 ${item.phone
                                        ? "bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-[#003B46] dark:text-gray-200 border-gray-100 dark:border-gray-700"
                                        : "bg-gray-100 dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 cursor-not-allowed"
                                    }`}
                            >
                                <span className={`font-medium transition-colors duration-200 ${item.phone ? "group-hover/item:text-green-700 dark:group-hover/item:text-green-400" : ""}`}>{item.title}</span>
                                <img
                                    alt="Whatsapp"
                                    className={`w-5 h-5 transition-all duration-200 ${item.phone ? "opacity-70 group-hover/item:opacity-100 group-hover/item:scale-110" : "opacity-30 grayscale"}`}
                                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
