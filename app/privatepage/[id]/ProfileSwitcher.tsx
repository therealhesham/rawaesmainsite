"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowLeftRight, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { switchProfile } from "../../login/actions";

type Profile = {
    id: number;
    name: string;
    profilepicture: string | null;
    sectors: string[];
};

export default function ProfileSwitcher({
    currentProfileId,
    profiles,
}: {
    currentProfileId: number;
    profiles: Profile[];
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [switching, setSwitching] = useState<number | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const otherProfiles = profiles.filter((p) => p.id !== currentProfileId);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    if (otherProfiles.length === 0) return null;

    const handleSwitch = async (targetId: number) => {
        setSwitching(targetId);
        try {
            const result = await switchProfile(targetId);
            if (result.success && result.userId) {
                router.push(`/privatepage/${result.userId}`);
                router.refresh();
            }
        } catch {
            // silent
        } finally {
            setSwitching(null);
            setOpen(false);
        }
    };

    return (
        <div ref={panelRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#003B46] to-[#005a6e] hover:from-[#005a6e] hover:to-[#007a8e] text-white text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg"
            >
                <ArrowLeftRight className="size-4 shrink-0" aria-hidden />
                <span>تبديل الملف الاستثماري</span>
                <ChevronDown
                    className={`size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    aria-hidden
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            ملفاتك الاستثمارية الأخرى
                        </p>
                    </div>
                    <div className="py-1">
                        {otherProfiles.map((profile) => (
                            <button
                                key={profile.id}
                                type="button"
                                onClick={() => handleSwitch(profile.id)}
                                disabled={switching !== null}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#003B46] to-[#005a6e] flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
                                    {/* {profile.profilepicture ? (
                                        <img
                                            // src={profile.profilepicture}
                                            alt={profile.name.charAt(0)}
                                            // className="w-full h-full object-cover"
                                        />
                                    ) : ( */}
                                        <span>{ profile.name.charAt(0) }</span>
                                    {/* )} */}
                                </div>
                                <div className="flex-1 text-start min-w-0">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                                        {profile.name}
                                    </p>
                                    {profile.sectors.length > 0 && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                            {profile.sectors.join(" • ")}
                                        </p>
                                    )}
                                </div>
                                <div className="shrink-0">
                                    {switching === profile.id ? (
                                        <Loader2 className="size-5 animate-spin text-primary shrink-0" aria-hidden />
                                    ) : (
                                        <ArrowLeft className="size-5 text-gray-300 dark:text-gray-600 group-hover:text-primary shrink-0" aria-hidden />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
