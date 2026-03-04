"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteContactFormSubmission, deleteContactFormSubmissionsBulk } from "../../contact-actions";
import { AlertModal } from "@/app/components/AlertModal";

function ConfirmDeleteModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-card-dark w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
          <span className="material-icons text-2xl">warning</span>
        </div>
        <h3 className="text-lg font-bold text-secondary dark:text-white">تأكيد الحذف</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          هل أنت متأكد من رغبتك في الحذف نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

type Message = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string | null;
  createdAt: Date | string;
};

export function ContactMessagesTable({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selected = messages.find((m) => m.id === openId);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await deleteContactFormSubmission(id);
      if (res?.success) {
        setDeleteConfirmId(null);
        router.refresh();
      }
      else if (res && !res.success) setErrorMessage(res.error);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await deleteContactFormSubmissionsBulk(selectedIds);
      if (res?.success) {
        setShowBulkConfirm(false);
        setSelectedIds([]);
        router.refresh();
      } else if (res && !res.success) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsBulkDeleting(false);
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <AlertModal
        open={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="خطأ"
        message={errorMessage ?? ""}
        variant="error"
      />
      <ConfirmDeleteModal
        isOpen={deleteConfirmId !== null}
        isDeleting={deletingId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
      />
      <ConfirmDeleteModal
        isOpen={showBulkConfirm}
        isDeleting={isBulkDeleting}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
      />

      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 dark:bg-primary/10 dark:border-primary/30 rounded-xl p-4 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
              {selectedIds.length}
            </span>
            <span className="text-secondary dark:text-white font-medium">
              عناصر محددة
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBulkConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <span className="material-icons text-sm">delete_sweep</span>
            حذف المحدد
          </button>
        </div>
      )}

      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
          <tr>
            <th className="px-6 py-4 text-center font-medium w-16">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary cursor-pointer"
                checked={messages.length > 0 && selectedIds.length === messages.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-6 py-4 text-right font-medium">الاسم</th>
            <th className="px-6 py-4 text-right font-medium">البريد</th>
            <th className="px-6 py-4 text-right font-medium">الجوال</th>
            <th className="px-6 py-4 text-right font-medium">الرسالة</th>
            <th className="px-6 py-4 text-center font-medium">التاريخ</th>
            <th className="px-6 py-4 text-center font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {messages.map((msg) => (
            <tr
              key={msg.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedIds.includes(msg.id) ? "bg-primary/5 dark:bg-primary/10" : ""}`}
            >
              <td className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary cursor-pointer"
                  checked={selectedIds.includes(msg.id)}
                  onChange={() => toggleSelect(msg.id)}
                />
              </td>
              <td className="px-6 py-4">
                <span className="font-medium text-secondary dark:text-white">
                  {msg.firstName} {msg.lastName}
                </span>
              </td>
              <td className="px-6 py-4">
                <a
                  href={`mailto:${msg.email}`}
                  className="text-primary hover:underline font-mono text-sm"
                >
                  {msg.email}
                </a>
              </td>
              <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300 dir-ltr text-right">
                {msg.phone || "—"}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm max-w-[200px] truncate">
                {msg.message || "—"}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                {new Date(msg.createdAt).toLocaleString("ar-EG", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(msg.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-icons text-sm">visibility</span>
                    عرض
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(msg.id)}
                    disabled={deletingId === msg.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    aria-label="حذف"
                  >
                    <span className="material-icons text-sm">delete</span>
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <MessageModal
          message={selected}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}

function MessageModal({
  message: msg,
  onClose,
}: {
  message: Message;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2
            id="message-modal-title"
            className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2"
          >
            <span className="material-icons text-primary">mail</span>
            رسالة من {msg.firstName} {msg.lastName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-secondary dark:hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">الاسم</span>
            <p className="text-secondary dark:text-white font-medium">
              {msg.firstName} {msg.lastName}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">البريد الإلكتروني</span>
            <a
              href={`mailto:${msg.email}`}
              className="text-primary hover:underline font-mono text-sm"
            >
              {msg.email}
            </a>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">رقم الجوال</span>
            <p className="font-mono text-sm text-gray-700 dark:text-gray-300 dir-ltr">
              {msg.phone || "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">التاريخ</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(msg.createdAt).toLocaleString("ar-EG", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">الرسالة</span>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap min-h-[80px]">
              {msg.message || "—"}
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 flex justify-end gap-2">
          <a
            href={`mailto:${msg.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-icons text-sm">reply</span>
            رد بالبريد
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
