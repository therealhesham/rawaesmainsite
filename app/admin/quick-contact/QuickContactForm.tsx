"use client";

import { useActionState, useRef, useState } from "react";
import { updateQuickContactSettings, type QuickContactFormState } from "./actions";
import { CheckCircle, AlertCircle, Phone, Info, Save } from "lucide-react";

const PHONE_REGEX = /^\+?[0-9]*$/;
const VALIDATION_MSG = "الرجاء إدخال أرقام وعلامة + فقط";

type Settings = {
    legalPhone?: string | null;
    managementPhone?: string | null;
    suggestionsPhone?: string | null;
};

export function QuickContactForm({ settings }: { settings: Settings }) {
    const [state, formAction, isPending] = useActionState<QuickContactFormState, FormData>(
        updateQuickContactSettings,
        null
    );
    const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const validatePhone = (value: string, fieldName: string): boolean => {
        if (!value.trim()) return true;
        if (!PHONE_REGEX.test(value)) {
            setValidationError({ field: fieldName, message: VALIDATION_MSG });
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidationError(null);

        const form = formRef.current;
        if (!form) return;

        const legalPhone = (form.elements.namedItem("legalPhone") as HTMLInputElement)?.value ?? "";
        const managementPhone = (form.elements.namedItem("managementPhone") as HTMLInputElement)?.value ?? "";
        const suggestionsPhone = (form.elements.namedItem("suggestionsPhone") as HTMLInputElement)?.value ?? "";

        if (!validatePhone(legalPhone, "legalPhone")) return;
        if (!validatePhone(managementPhone, "managementPhone")) return;
        if (!validatePhone(suggestionsPhone, "suggestionsPhone")) return;

        const fd = new FormData(form);
        formAction(fd);
    };

    const clearValidationFor = (field: string) => {
        setValidationError((prev) => (prev?.field === field ? null : prev));
    };

    return (
        <form
            ref={formRef}
            action={formAction}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 max-w-2xl"
        >
            {/* Success feedback */}
            {state?.success && (
                <div
                    role="alert"
                    className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium"
                >
                    <CheckCircle className="text-green-600" size={20} />
                    تم حفظ الإعدادات بنجاح
                </div>
            )}

            {/* Error feedback */}
            {state?.error && (
                <div
                    role="alert"
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium"
                >
                    <AlertCircle className="text-red-600" size={20} />
                    {state.error}
                </div>
            )}

            {/* الإدارة القانونية */}
            <div>
                <label
                    htmlFor="legalPhone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    رقم الإدارة القانونية
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <Phone size={18} />
                    </div>
                    <input
                        type="text"
                        name="legalPhone"
                        id="legalPhone"
                        defaultValue={settings?.legalPhone || ""}
                        placeholder="مثال: +966500000000"
                        onFocus={() => clearValidationFor("legalPhone")}
                        onInput={() => clearValidationFor("legalPhone")}
                        className={`w-full pr-10 pl-4 py-3 bg-gray-50 border rounded-xl focus:ring-1 outline-none transition-all text-left dir-ltr ${validationError?.field === "legalPhone"
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:border-[#003B46] focus:ring-[#003B46]"
                            }`}
                    />
                </div>
                {validationError?.field === "legalPhone" && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <Info size={16} />
                        {validationError.message}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500 mb-4 text-start">يجب أن يشمل رمز الدولة بدون مسافات</p>
            </div>

            {/* الإدارة العليا */}
            <div>
                <label
                    htmlFor="managementPhone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    رقم الإدارة العليا
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <Phone size={18} />
                    </div>
                    <input
                        type="text"
                        name="managementPhone"
                        id="managementPhone"
                        defaultValue={settings?.managementPhone || ""}
                        placeholder="مثال: +966500000000"
                        onFocus={() => clearValidationFor("managementPhone")}
                        onInput={() => clearValidationFor("managementPhone")}
                        className={`w-full pr-10 pl-4 py-3 bg-gray-50 border rounded-xl focus:ring-1 outline-none transition-all text-left dir-ltr ${validationError?.field === "managementPhone"
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:border-[#003B46] focus:ring-[#003B46]"
                            }`}
                    />
                </div>
                {validationError?.field === "managementPhone" && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <Info size={16} />
                        {validationError.message}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500 mb-4 text-start">يجب أن يشمل رمز الدولة بدون مسافات</p>
            </div>

            {/* اقتراحات ومساعدة */}
            <div>
                <label
                    htmlFor="suggestionsPhone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    رقم الاقتراحات والمساعدة
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <Phone size={18} />
                    </div>
                    <input
                        type="text"
                        name="suggestionsPhone"
                        id="suggestionsPhone"
                        defaultValue={settings?.suggestionsPhone || ""}
                        placeholder="مثال: +966500000000"
                        onFocus={() => clearValidationFor("suggestionsPhone")}
                        onInput={() => clearValidationFor("suggestionsPhone")}
                        className={`w-full pr-10 pl-4 py-3 bg-gray-50 border rounded-xl focus:ring-1 outline-none transition-all text-left dir-ltr ${validationError?.field === "suggestionsPhone"
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:border-[#003B46] focus:ring-[#003B46]"
                            }`}
                    />
                </div>
                {validationError?.field === "suggestionsPhone" && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <Info size={16} />
                        {validationError.message}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500 mb-4 text-start">يجب أن يشمل رمز الدولة بدون مسافات</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-gold hover:bg-[#b8860b] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={20} />
                            حفظ الإعدادات
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
