"use client";

import { useCallback, useMemo, useRef, useState, useTransition, useEffect } from "react";
import { createMessageTemplate, deleteMessageTemplate, sendInvestorCommunication, updateMessageTemplate, uploadInvestorCommunicationLogo } from "./actions";
import {
  X, Search, Users, User, Building2, Plus, Trash2, Send, Bell, Mail, MessageSquare,
  FileText, CheckCircle, AlertCircle, ChevronDown, Paperclip, Link as LinkIcon, ImagePlus,
} from "lucide-react";

type Investor = { id: number; name: string; email: string | null; phoneNumber: string | null };
type Sector = { id: number; key: string; nameAr: string | null };
type Template = { id: number; name: string; channel: "SMS" | "EMAIL" | "NOTIFICATION"; subject: string | null; body: string };
type Log = {
  id: number;
  channel: "SMS" | "EMAIL" | "NOTIFICATION";
  mode: string;
  templateName: string | null;
  subject: string | null;
  body: string;
  recipientsJson: string;
  status: string;
  createdAt: Date;
};

type AudienceMode = "INDIVIDUAL" | "MULTIPLE" | "SECTOR" | "BULK";
type Channel = "SMS" | "EMAIL" | "NOTIFICATION";

const CHANNEL_META: Record<Channel, { label: string; icon: React.ReactNode; color: string }> = {
  SMS: { label: "رسائل SMS", icon: <MessageSquare size={18} />, color: "from-emerald-600 to-emerald-700" },
  EMAIL: { label: "بريد إلكتروني", icon: <Mail size={18} />, color: "from-blue-600 to-blue-700" },
  NOTIFICATION: { label: "إشعار", icon: <Bell size={18} />, color: "from-amber-600 to-amber-700" },
};

/** زر يُدرج {{name}} (اسم المستثمر) عند موضع المؤشر — onMouseDown يمنع فقدان التحديد قبل النقر */
function PlaceholderInsertButtons({
  inputRef,
  value,
  setValue,
  compact,
  disabled,
}: {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  value: string;
  setValue: (v: string) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const insert = useCallback(
    (snippet: string) => {
      const el = inputRef.current;
      const start = typeof el?.selectionStart === "number" ? el.selectionStart : value.length;
      const end = typeof el?.selectionEnd === "number" ? el.selectionEnd : value.length;
      const next = value.slice(0, start) + snippet + value.slice(end);
      const pos = start + snippet.length;
      setValue(next);
      setTimeout(() => {
        const node = inputRef.current;
        if (!node) return;
        node.focus();
        try {
          node.setSelectionRange(pos, pos);
        } catch {
          /* ignore */
        }
      }, 0);
    },
    [inputRef, value, setValue]
  );

  const wrap = compact ? "flex flex-wrap items-center gap-1.5" : "flex flex-wrap items-center gap-2 mb-2";

  return (
    <div className={wrap} role="group" aria-label="إدراج اسم المستثمر">
      <span className={`text-gray-500 ${compact ? "text-[10px]" : "text-[11px]"}`}>إدراج:</span>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insert("{{name}}")}
        className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-lg border border-[#003B46]/35 bg-[#003B46]/8 text-[#003B46] hover:bg-[#003B46]/18 transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed"
        title="يُدرج {{name}} — يُستبدل باسم المستثمر عند الإرسال"
      >
        <span>اسم المستثمر</span>
        <span className="opacity-80">{"{{name}}"}</span>
      </button>
    </div>
  );
}

function InvestorAutocomplete({
  investors,
  selectedIds,
  onToggle,
  multi,
}: {
  investors: Investor[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  multi: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return investors.slice(0, 30);
    const q = query.trim().toLowerCase();
    return investors.filter(
      (inv) =>
        inv.name.toLowerCase().includes(q) ||
        (inv.phoneNumber || "").includes(q) ||
        (inv.email || "").toLowerCase().includes(q)
    ).slice(0, 30);
  }, [investors, query]);

  const selectedInvestors = useMemo(
    () => investors.filter((i) => selectedIds.includes(i.id)),
    [investors, selectedIds]
  );

  return (
    <div ref={ref} className="relative">
      <div className="border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[#003B46]/30 focus-within:border-[#003B46] transition-all">
        {multi && selectedInvestors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 pb-0">
            {selectedInvestors.map((inv) => (
              <span key={inv.id} className="inline-flex items-center gap-1 bg-[#003B46]/10 text-[#003B46] text-xs font-medium px-2.5 py-1 rounded-lg">
                {inv.name}
                <button type="button" onClick={() => onToggle(inv.id)} className="hover:text-red-500 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={multi ? "ابحث وأضف مستثمرين..." : "ابحث عن مستثمر بالاسم أو الجوال..."}
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-gray-400"
          />
          {!multi && selectedIds.length === 1 && (
            <span className="text-xs text-[#003B46] font-medium bg-[#003B46]/10 px-2 py-0.5 rounded-md">
              {investors.find((i) => i.id === selectedIds[0])?.name}
            </span>
          )}
        </div>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-30 top-full mt-1 inset-x-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((inv) => {
            const selected = selectedIds.includes(inv.id);
            return (
              <button
                key={inv.id}
                type="button"
                onClick={() => {
                  onToggle(inv.id);
                  if (!multi) { setOpen(false); setQuery(""); }
                }}
                className={`w-full text-right px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${selected ? "bg-[#003B46]/5" : ""}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{inv.name}</span>
                  <span className="text-xs text-gray-400">{inv.phoneNumber || "—"} · {inv.email || "لا يوجد بريد"}</span>
                </div>
                {selected && <CheckCircle size={16} className="text-[#003B46] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TemplateManager({
  templates,
  onClose,
  onUseTemplate,
}: {
  templates: Template[];
  onClose: () => void;
  onUseTemplate: (t: Template) => void;
}) {
  const [tab, setTab] = useState<Channel>("SMS");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const [tplName, setTplName] = useState("");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");
  const [saveResult, setSaveResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const editorBodyRef = useRef<HTMLTextAreaElement>(null);
  const editorSubjectRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => templates.filter((t) => t.channel === tab), [templates, tab]);
  const activeTemplate = useMemo(() => (selectedId ? templates.find((t) => t.id === selectedId) : null), [templates, selectedId]);

  const selectTemplate = (t: Template) => {
    setSelectedId(t.id);
    setCreating(false);
    setTplName(t.name);
    setTplSubject(t.subject || "");
    setTplBody(t.body);
    setSaveResult(null);
  };

  const startCreate = () => {
    setSelectedId(null);
    setCreating(true);
    setTplName("");
    setTplSubject("");
    setTplBody("");
    setSaveResult(null);
  };

  const handleSave = () => {
    if (!tplName.trim() || !tplBody.trim()) {
      setSaveResult({ error: "اسم القالب ونصه مطلوبان." });
      return;
    }
    setSaveResult(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", tplName);
      fd.set("channel", tab);
      fd.set("subject", tplSubject);
      fd.set("body", tplBody);
      const res = await createMessageTemplate(fd);
      if ((res as any).error) setSaveResult({ error: (res as any).error });
      else {
        setSaveResult({ success: true });
        setCreating(false);
        setTplName(""); setTplSubject(""); setTplBody("");
      }
    });
  };

  const handleUpdate = () => {
    if (!activeTemplate) return;
    if (!tplName.trim() || !tplBody.trim()) {
      setSaveResult({ error: "اسم القالب ونصه مطلوبان." });
      return;
    }
    setSaveResult(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(activeTemplate.id));
      fd.set("name", tplName);
      fd.set("subject", tplSubject);
      fd.set("body", tplBody);
      const res = await updateMessageTemplate(fd);
      if ((res as any).error) setSaveResult({ error: (res as any).error });
      else setSaveResult({ success: true });
    });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteMessageTemplate(id);
      if (selectedId === id) { setSelectedId(null); setTplName(""); setTplSubject(""); setTplBody(""); }
      setDeletingId(null);
    });
  };

  const handleUse = () => {
    if (activeTemplate) {
      onUseTemplate(activeTemplate);
      onClose();
    }
  };

  const editorHasContent = creating || !!selectedId;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={22} />
          <h2 className="text-lg font-bold">إدارة القوالب</h2>
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <X size={16} />
          رجوع للإرسال
        </button>
      </div>
      <div className="h-1 bg-gradient-to-l from-[#C9A84C] via-[#F0C040] to-[#C9A84C]" />

      {/* Channel tabs */}
      <div className="flex gap-1 p-3 bg-gray-50 border-b">
        {(["SMS", "EMAIL", "NOTIFICATION"] as Channel[]).map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => { setTab(ch); setSelectedId(null); setCreating(false); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === ch ? "bg-[#003B46] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {CHANNEL_META[ch].icon}
            {CHANNEL_META[ch].label}
          </button>
        ))}
      </div>

      {/* Split layout: list (right in RTL) + editor (left in RTL) */}
      <div className="flex flex-col md:flex-row min-h-[420px]">
        {/* Template list — right side (RTL) */}
        <div className="md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-l border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">النماذج ({filtered.length})</span>
            <button
              type="button"
              onClick={startCreate}
              className="flex items-center gap-1 text-xs font-semibold text-[#003B46] bg-[#003B46]/10 hover:bg-[#003B46]/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} />
              جديد
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ maxHeight: "400px" }}>
            {filtered.length === 0 && !creating && (
              <div className="text-center py-10 text-gray-400">
                <FileText size={28} className="mx-auto mb-1.5 opacity-40" />
                <p className="text-xs">لا يوجد قوالب بعد</p>
              </div>
            )}
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTemplate(t)}
                className={`w-full text-right p-3 rounded-xl transition-all text-sm group ${selectedId === t.id ? "bg-[#003B46] text-white shadow-md" : "bg-white border border-gray-100 hover:border-[#003B46]/30 hover:shadow-sm"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${selectedId === t.id ? "text-white" : "text-gray-800"}`}>{t.name}</p>
                    <p className={`text-[11px] mt-0.5 truncate ${selectedId === t.id ? "text-white/70" : "text-gray-400"}`}>{t.body.slice(0, 50)}…</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    disabled={deletingId === t.id}
                    className={`shrink-0 p-1 rounded transition-colors ${selectedId === t.id ? "text-white/60 hover:text-red-300" : "text-gray-300 hover:text-red-500"} disabled:opacity-40`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor — left side (RTL) */}
        <div className="flex-1 p-5 flex flex-col">
          {!editorHasContent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <FileText size={48} className="opacity-30" />
              <p className="text-sm">اختر قالباً من القائمة أو أنشئ قالباً جديداً</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              {/* Template name */}
              <input
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="اسم القالب"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-white"
              />

              {/* Subject (email/notification only) */}
              {tab !== "SMS" && (
                <div>
                  <PlaceholderInsertButtons inputRef={editorSubjectRef} value={tplSubject} setValue={setTplSubject} compact />
                  <input
                    ref={editorSubjectRef}
                    value={tplSubject}
                    onChange={(e) => setTplSubject(e.target.value)}
                    placeholder="الموضوع"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-white mt-1"
                  />
                </div>
              )}

              {/* Body — the big green area */}
              <div className="flex-1 flex flex-col">
                <PlaceholderInsertButtons inputRef={editorBodyRef} value={tplBody} setValue={setTplBody} />
                <textarea
                  ref={editorBodyRef}
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  placeholder="نص القالب… اضغط «اسم المستثمر» أعلاه لإدراج {{name}}"
                  className="flex-1 min-h-[200px] w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 resize-none leading-relaxed"
                />
              </div>

              {/* Feedback + Actions */}
              {saveResult?.error && <p className="text-xs text-red-600">{saveResult.error}</p>}
              {saveResult?.success && <p className="text-xs text-emerald-600">تم حفظ القالب بنجاح.</p>}

              <div className="flex items-center gap-2 justify-end pt-1">
                {creating && (
                  <button type="button" onClick={handleSave} className="flex items-center gap-1.5 bg-[#003B46] text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-[#005F6B] transition-colors">
                    <Plus size={16} />
                    حفظ القالب
                  </button>
                )}
                {!creating && activeTemplate && (
                  <>
                    <button type="button" onClick={handleUpdate} className="flex items-center gap-1.5 bg-amber-500 text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors">
                      <CheckCircle size={16} />
                      حفظ التعديلات
                    </button>
                    <button type="button" onClick={handleUse} className="flex items-center gap-1.5 bg-[#003B46] text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-[#005F6B] transition-colors">
                      <Send size={16} />
                      استخدام القالب
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InvestorCommunicationClient({
  investors,
  sectors,
  templates: initialTemplates,
  logs,
  emailLogoUrlDisplay,
}: {
  investors: Investor[];
  sectors: Sector[];
  templates: Template[];
  logs: Log[];
  emailLogoUrlDisplay?: string | null;
}) {
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(["SMS"]);
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("INDIVIDUAL");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sectorId, setSectorId] = useState("");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("#");
  const [result, setResult] = useState<{ success?: boolean; error?: string; count?: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showTemplates, setShowTemplates] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const primaryChannel: Channel = selectedChannels[0] ?? "SMS";
  const hasEmailChannel = selectedChannels.includes("EMAIL");
  const hasNotificationChannel = selectedChannels.includes("NOTIFICATION");
  const hasNonSmsChannel = hasEmailChannel || hasNotificationChannel;

  const toggleChannel = useCallback((ch: Channel) => {
    setSelectedChannels((prev) => {
      if (prev.includes(ch)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== ch);
      }
      return [...prev, ch];
    });
  }, []);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const templateSelected = templateId !== null;

  const toggleInvestor = useCallback((id: number) => {
    if (audienceMode === "INDIVIDUAL") {
      setSelectedIds((prev) => (prev[0] === id ? [] : [id]));
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  }, [audienceMode]);

  const handleApplyTemplate = useCallback((t: Template) => {
    setTemplateId(t.id);
    setSelectedChannels([t.channel]);
    if (t.channel !== "SMS") setSubject(t.subject || "");
    setBody(t.body);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    if (!templateSelected) {
      setResult({ error: "يجب اختيار قالب قبل الإرسال." });
      return;
    }
    fd.set("channels", JSON.stringify(selectedChannels));
    fd.set("mode", audienceMode);
    fd.set("subject", subject);
    fd.set("body", body);
    fd.set("linkUrl", linkUrl);
    if (templateId) fd.set("templateId", String(templateId));

    if (audienceMode === "INDIVIDUAL" || audienceMode === "MULTIPLE") {
      fd.set("recipientIds", JSON.stringify(selectedIds));
    } else if (audienceMode === "SECTOR") {
      fd.set("sectorId", sectorId);
    }

    startTransition(async () => {
      const res = await sendInvestorCommunication(fd);
      setResult(res as any);
      if ((res as any).success) {
        setBody(""); setSubject(""); setSelectedIds([]); setTemplateId(null); setSectorId("");
        const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      }
    });
  };

  const recipientSummary = useMemo(() => {
    if (audienceMode === "BULK") return `جميع المستثمرين (${investors.length})`;
    if (audienceMode === "SECTOR") {
      const s = sectors.find((x) => String(x.id) === sectorId);
      return s ? `قطاع ${s.nameAr || s.key}` : "اختر قطاعاً";
    }
    if (selectedIds.length === 0) return "لم يتم اختيار أحد";
    if (selectedIds.length === 1) return investors.find((i) => i.id === selectedIds[0])?.name || "";
    return `${selectedIds.length} مستثمر`;
  }, [audienceMode, investors, sectors, sectorId, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Template Manager — inline, replaces the send card */}
      {showTemplates && (
        <TemplateManager
          templates={initialTemplates}
          onClose={() => setShowTemplates(false)}
          onUseTemplate={(t) => { handleApplyTemplate(t); setShowTemplates(false); }}
        />
      )}

      {/* Send Card — hidden when template manager is open */}
      {!showTemplates && (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">تواصل مع المستثمر</h1>
              <p className="text-sm text-white/70 mt-1">اختر قناة أو أكثر (SMS / Email / Notification) وأرسلهم دفعة واحدة.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
            >
              <FileText size={18} />
              إدارة القوالب
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-l from-[#C9A84C] via-[#F0C040] to-[#C9A84C]" />

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Email Logo Upload */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-secondary flex items-center gap-2">
                  <ImagePlus size={16} className="text-primary" />
                  شعار الإيميل
                </h3>
                <p className="text-xs text-gray-500 mt-1">يظهر في الإيميلات المرسلة للمستثمرين.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(logoPreview ?? emailLogoUrlDisplay) && (
                  <img
                    src={logoPreview ?? emailLogoUrlDisplay ?? ""}
                    alt="شعار الإيميل"
                    className="h-10 w-auto object-contain rounded border border-gray-200 bg-white px-2"
                  />
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (logoPreview) URL.revokeObjectURL(logoPreview);
                    setLogoPreview(file ? URL.createObjectURL(file) : null);
                    setLogoError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium hover:bg-gray-50"
                >
                  اختر صورة
                </button>
                <button
                  type="button"
                  disabled={logoUploading}
                  onClick={async () => {
                    const file = logoInputRef.current?.files?.[0];
                    if (!file) {
                      setLogoError("اختر صورة أولاً.");
                      return;
                    }
                    setLogoUploading(true);
                    setLogoError(null);
                    const fd = new FormData();
                    fd.set("file", file);
                    const res = await uploadInvestorCommunicationLogo(fd);
                    setLogoUploading(false);
                    if ((res as any).success) {
                      setResult({ success: true });
                      setLogoPreview(null);
                      if (logoInputRef.current) logoInputRef.current.value = "";
                      window.location.reload();
                    } else {
                      setLogoError((res as any).error || "تعذر رفع الشعار.");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {logoUploading ? "جاري الرفع..." : "رفع الشعار"}
                </button>
              </div>
            </div>
            {logoError && <p className="text-xs text-red-600 mt-2">{logoError}</p>}
          </div>

          {/* Channel Picker (multi-select) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">قنوات الإرسال (متعدد)</label>
            <div className="grid grid-cols-3 gap-3">
              {(["SMS", "EMAIL", "NOTIFICATION"] as Channel[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all duration-200 font-semibold text-sm ${
                    selectedChannels.includes(ch)
                      ? "bg-[#003B46] border-[#003B46] text-white shadow-lg shadow-[#003B46]/20"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#003B46]/30 hover:text-[#003B46]"
                  }`}
                >
                  {CHANNEL_META[ch].icon}
                  {CHANNEL_META[ch].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
              ملاحظة: المرفقات يتم إرسالها فقط عبر البريد الإلكتروني (Email).
            </p>
          </div>

          {/* Audience Mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">الجمهور المستهدف</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {([
                { key: "INDIVIDUAL" as AudienceMode, label: "شخص واحد", icon: <User size={16} /> },
                { key: "MULTIPLE" as AudienceMode, label: "عدة أشخاص", icon: <Users size={16} /> },
                { key: "SECTOR" as AudienceMode, label: "قطاع كامل", icon: <Building2 size={16} /> },
                { key: "BULK" as AudienceMode, label: "الجميع", icon: <Users size={16} /> },
              ]).map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setAudienceMode(key); setSelectedIds([]); setSectorId(""); }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    audienceMode === key
                      ? "bg-[#003B46] border-[#003B46] text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#003B46]/30"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Selection */}
          {audienceMode === "INDIVIDUAL" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اختر المستثمر</label>
              <InvestorAutocomplete investors={investors} selectedIds={selectedIds} onToggle={toggleInvestor} multi={false} />
            </div>
          )}
          {audienceMode === "MULTIPLE" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اختر المستثمرين</label>
              <InvestorAutocomplete investors={investors} selectedIds={selectedIds} onToggle={toggleInvestor} multi />
            </div>
          )}
          {audienceMode === "SECTOR" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اختر القطاع</label>
              <div className="relative">
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-white transition-all appearance-none"
                >
                  <option value="">— اختر قطاعاً —</option>
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.nameAr || s.key}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
          {audienceMode === "BULK" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Users className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-amber-800">سيتم إرسال الرسالة لجميع المستثمرين ({investors.length} مستثمر).</p>
            </div>
          )}

          {/* Template Quick-Select */}
          {initialTemplates.filter((t) => t.channel === primaryChannel).length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">اختر قالبًا ({CHANNEL_META[primaryChannel].label})</label>
              <div className="flex flex-wrap gap-2">
                {initialTemplates.filter((t) => t.channel === primaryChannel).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleApplyTemplate(t)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      templateId === t.id ? "bg-[#003B46] text-white border-[#003B46]" : "bg-white text-gray-600 border-gray-200 hover:border-[#003B46]/40"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          {hasNonSmsChannel && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الموضوع</label>
              <PlaceholderInsertButtons inputRef={subjectInputRef} value={subject} setValue={setSubject} disabled />
              <input
                ref={subjectInputRef}
                value={subject}
                readOnly
                placeholder="مثال: تحديث هام بخصوص محفظتك الاستثمارية"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-100 transition-all placeholder:text-gray-400 cursor-not-allowed"
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نص الرسالة</label>
            <PlaceholderInsertButtons inputRef={bodyTextareaRef} value={body} setValue={setBody} disabled />
            <textarea
              ref={bodyTextareaRef}
              value={body}
              readOnly
              required
              rows={6}
              placeholder="بعد اختيار القالب سيظهر النص هنا."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-100 transition-all placeholder:text-gray-400 resize-none leading-relaxed cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              الإرسال من القوالب فقط. لتعديل النص أو الموضوع عدّل القالب من "إدارة القوالب".
            </p>
          </div>

          {/* Link URL for notifications */}
          {hasNotificationChannel && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1.5"><LinkIcon size={14} className="text-[#003B46]" /> رابط (اختياري)</span>
              </label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="#"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400 font-mono text-sm"
              />
            </div>
          )}

          {/* Attachments */}
          {hasEmailChannel && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1.5"><Paperclip size={14} className="text-[#003B46]" /> مرفقات (اختياري)</span>
              </label>
              <input name="attachments" type="file" multiple className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#003B46]/10 file:text-[#003B46]" />
            </div>
          )}

          {/* Result */}
          {result?.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="shrink-0" size={20} />
              {result.error}
            </div>
          )}
          {result?.success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700 text-sm">
              <CheckCircle className="shrink-0" size={20} />
              تم الإرسال بنجاح إلى {result.count ?? 0} مستثمر.
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">
              المستلمون: <span className="text-gray-600 font-medium">{recipientSummary}</span>
            </p>
            <button
              type="submit"
              disabled={isPending || !templateSelected}
              className="flex items-center gap-2 bg-gradient-to-l from-[#003B46] to-[#005F6B] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#003B46]/25 hover:shadow-[#003B46]/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  جاري الإرسال...
                </>
              ) : (
                <><Send size={18} /> إرسال</>
              )}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <FileText className="text-[#003B46]" size={22} />
          <h2 className="text-lg font-bold text-gray-800">سجل الإرسال</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full mr-auto">{logs.length}</span>
        </div>
        {logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Send size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا يوجد سجل إرسال بعد.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => {
              let recipientsSummary = "";
              try {
                const arr = JSON.parse(log.recipientsJson);
                recipientsSummary = arr.length <= 2
                  ? arr.map((r: any) => r.name).join("، ")
                  : `${arr.length} مستثمر`;
              } catch { recipientsSummary = "—"; }
              return (
                <div key={log.id} className="p-4 md:p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    log.status === "sent" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                  }`}>
                    {log.status === "sent" ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{log.channel}</span>
                      <span className="text-xs text-gray-400">{log.mode === "BULK" ? "جماعي" : log.mode === "SECTOR" ? "قطاع" : "فردي/متعدد"}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mt-1 truncate">{log.subject || log.body.slice(0, 60)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">إلى: {recipientsSummary} {log.templateName ? `· قالب: ${log.templateName}` : ""}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0 pt-1">
                    {new Date(log.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
