const TEAL = "#003749";
const GOLD = "#b8860b";

const DocumentIcon = () => (
    <svg
        className="w-10 h-10 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
        <rect x="8" y="9" width="3" height="3" rx="0.5" />
    </svg>
);

interface SectorCardProps {
    title: string;
    description: string;
    buttonLabel: string;
    buttonVariant?: "teal" | "gold";
    href?: string;
}

function SectorCard({
    title,
    description,
    buttonLabel,
    buttonVariant = "teal",
    href = "#",
}: SectorCardProps) {
    const btnBg = buttonVariant === "teal" ? TEAL : GOLD;

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600/50 bg-white dark:bg-gray-800/40">
            {/* Header bar */}
            <div
                className="px-4 py-3 text-center text-white font-bold text-base"
                style={{ backgroundColor: TEAL }}
            >
                {title}
            </div>

            {/* Content */}
            <div className="flex flex-col items-center gap-3 px-4 py-6">
                <div className="flex items-center gap-3 justify-center">
                    <DocumentIcon />
                    <span className="text-sm text-text-dark dark:text-text-light font-medium text-center">
                        {description}
                    </span>
                </div>

                <a
                    href={href}
                    className="inline-block px-5 py-2 rounded-md text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: btnBg }}
                >
                    {buttonLabel}
                </a>

                {/* Gold underline */}
                <div
                    className="w-3/4 h-[2px] mt-1"
                    style={{ backgroundColor: GOLD }}
                />
            </div>
        </div>
    );
}

export function InvestmentReportsCard() {
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-6 text-center">
                التقارير الاستثمارية
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Row 1 */}
                <SectorCard
                    title="قطاع تأجير السيارات"
                    description="قالب استثمارات"
                    buttonLabel="استعرض الملف"
                    buttonVariant="teal"
                />
                <SectorCard
                    title="قطاع تشغيل الفنادق"
                    description="قالب استثمارات"
                    buttonLabel="استعرض الملف"
                    buttonVariant="teal"
                />

                {/* Row 2 */}
                <SectorCard
                    title="قطاع التقسيط"
                    description="تواصل مع الادارة العليا"
                    buttonLabel="الادارة العليا"
                    buttonVariant="teal"
                />
                <SectorCard
                    title="قطاع العقار"
                    description="نتشرف باستثماراتك في هذا القطاع"
                    buttonLabel="استثمر معنا"
                    buttonVariant="gold"
                />
            </div>
        </div>
    );
}
