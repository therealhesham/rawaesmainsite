"use client";

type AlertModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: "error" | "info";
};

export function AlertModal({
  open,
  onClose,
  title = "تنبيه",
  message,
  variant = "error",
}: AlertModalProps) {
  if (!open) return null;

  const isError = variant === "error";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-desc"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white dark:bg-card-dark w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isError
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <span className="material-icons">
                {isError ? "error_outline" : "info"}
              </span>
            </span>
            <h2
              id="alert-modal-title"
              className="text-lg font-bold text-secondary dark:text-white"
            >
              {title}
            </h2>
          </div>
          <p
            id="alert-modal-desc"
            className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
          >
            {message}
          </p>
        </div>
        <div className="p-4 pt-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            حسناً
          </button>
        </div>
      </div>
    </div>
  );
}
