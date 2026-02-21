"use client";

import { useState } from "react";

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
  const [openId, setOpenId] = useState<number | null>(null);
  const selected = messages.find((m) => m.id === openId);

  return (
    <>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
          <tr>
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
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
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
                <button
                  type="button"
                  onClick={() => setOpenId(msg.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <span className="material-icons text-sm">visibility</span>
                  عرض
                </button>
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
