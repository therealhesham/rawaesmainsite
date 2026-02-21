import Link from "next/link";
import { getContactFormSubmissions } from "../../contact-actions";
import { ContactMessagesTable } from "./ContactMessagesTable";

export const dynamic = "force-dynamic";

export default async function AdminContactMessagesPage() {
  const messages = await getContactFormSubmissions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/contact"
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white transition-colors"
            aria-label="العودة لاتصل بنا"
          >
            <span className="material-icons">arrow_forward</span>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
              <span className="material-icons text-primary">mail</span>
              رسائل تواصل معنا
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              الرسائل الواردة من نموذج «تواصل معنا» في الموقع
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
            <span className="material-icons text-primary">inbox</span>
            الرسائل ({messages.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {messages.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
              <span className="material-icons text-5xl mb-3 opacity-30">inbox</span>
              <p>لا توجد رسائل حتى الآن</p>
            </div>
          ) : (
            <ContactMessagesTable messages={messages} />
          )}
        </div>
      </div>
    </div>
  );
}
