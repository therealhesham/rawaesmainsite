"use client";

import React, { useState } from "react";

export type FundTab = { id: string; label: string };

type InvestmentFundsSectionProps = {
    /** Section heading above the tabs */
    title: string;
    /** List of tabs: id and label */
    tabs: FundTab[];
    /** Initial active tab id (default: first tab) */
    defaultTabId?: string;
    /** Currently active tab id (for controlled component) */
    activeTabId?: string;
    /** Callback when tab is changed */
    onTabChange?: (tabId: string) => void;
    /** Content rendered inside the panel; receives current active tab id */
    children: (activeTabId: string) => React.ReactNode;
    /** Optional section id for anchor links */
    id?: string;
};

export function InvestmentFundsSection({
    title,
    tabs = [{ id: "1", label: "صندوق روائس للضيافة" }, { id: "2", label: "صندوق روائس لتأجير السيارات" }, { id: "3", label: "صندوق روائس للاستقدام" }],
    defaultTabId,
    activeTabId: controlledActiveTabId,
    onTabChange,
    children,
    id = "funds",
}: InvestmentFundsSectionProps) {
    const [internalActiveTab, setInternalActiveTab] = useState(defaultTabId ?? tabs[0]?.id ?? "");

    const activeTab = controlledActiveTabId !== undefined ? controlledActiveTabId : internalActiveTab;

    const handleTabChange = (tabId: string) => {
        if (onTabChange) {
            onTabChange(tabId);
        } else {
            setInternalActiveTab(tabId);
        }
    };

    return (
        <section
            className="py-12 px-4 bg-background-light dark:bg-background-dark"
            id={id}
        >
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gold mb-2">
                        {title}
                    </h2>
                </header>

                <div className="flex justify-center items-end -mb-px relative z-10 gap-1 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-6 md:px-8 py-4 rounded-t-xl font-bold text-sm transition-all duration-300 border-b-0 ${activeTab === tab.id
                                ? "active-tab dark:bg-corporate scale-105 origin-bottom shadow-lg"
                                : "bg-white dark:bg-slate-800 text-secondary dark:text-gold hover:bg-gold/10"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-[#EADDC9] dark:bg-slate-900 rounded-[40px] p-8 md:p-12 perspective-shadow relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                    <div className="relative z-10">{children(activeTab)}</div>
                </div>
            </div>
        </section>
    );
}
