import { getContactUsForAdmin } from "../contact-actions";
import { requirePageView } from "../lib/auth";
import { ContactUsForm } from "./ContactUsForm";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  await requirePageView("contact");
  const contact = await getContactUsForAdmin();
  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex items-center justify-center" dir="rtl">
        <p className="text-gray-500">لا توجد بيانات اتصل بنا. أضف سجلاً من قاعدة البيانات.</p>
      </div>
    );
  }
  return <ContactUsForm contact={contact} />;
}
