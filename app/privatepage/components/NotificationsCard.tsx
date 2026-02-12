export function NotificationsCard() {
  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
      <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-2">
        اشعارات مجموعة روائس
      </h2>
      <p className="text-text-dark/80 dark:text-text-light/80 text-sm mb-6">
        تم تفعيل استعراض ملفات الاستثمارات من خلال الموقع الرسمي لدى مجموعة
        روائس ( النسخة التجريبية )
      </p>
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        لا يوجد اشعارات
      </div>
    </div>
  );
}
