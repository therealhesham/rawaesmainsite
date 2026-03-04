import Link from "next/link";
import { getContactFormSubmissions, getEmailLogsForMessages } from "../../contact-actions";
import { requirePageView } from "../../lib/auth";
import { MessagesPageClient } from "./MessagesPageClient";
import { ArrowLeft, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminContactMessagesPage() {
  await requirePageView("contact-messages");

  const [messages, emailLogs] = await Promise.all([
    getContactFormSubmissions(),
    getEmailLogsForMessages(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/contact"
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white transition-colors"
            aria-label="العودة لاتصل بنا"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
              <Mail className="text-primary" size={32} />
              رسائل التواصل
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              الرسائل الواردة والبريد المرسل للمستثمرين
            </p>
          </div>
        </div>
      </div>

      <MessagesPageClient messages={messages} emailLogs={emailLogs as any} />
    </div>
  );
}

