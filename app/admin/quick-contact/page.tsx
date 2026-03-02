import { getQuickContactSettings } from "./actions";
import { requirePageView } from "../lib/auth";
import { QuickContactForm } from "./QuickContactForm";

export default async function QuickContactAdminPage() {
    await requirePageView("quick-contact");
    const settings = await getQuickContactSettings();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#003B46] p-6 text-white">
                    <h1 className="text-2xl font-bold font-heading">
                        إعدادات أرقام التواصل السريع
                    </h1>
                    <p className="opacity-80 mt-2 text-sm">
                        تحكم في أرقام الواتساب الظاهرة للمستثمرين في واجهتهم الخاصة
                    </p>
                </div>

                <div className="p-8">
                    <QuickContactForm settings={settings ?? {}} />
                </div>
            </div>
        </div>
    );
}
