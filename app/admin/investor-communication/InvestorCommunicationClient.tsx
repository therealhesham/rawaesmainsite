"use client";

import { useCallback, useMemo, useRef, useState, useTransition, useEffect } from "react";
import { createMessageTemplate, deleteMessageTemplate, sendInvestorCommunication } from "./actions";
import {
  X, Search, Users, User, Building2, Plus, Trash2, Send, Bell, Mail, MessageSquare,
  FileText, CheckCircle, AlertCircle, ChevronDown, Paperclip, Link as LinkIcon,
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

function TemplateModal({
  open,
  onClose,
  templates,
  onSelectTemplate,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  onSelectTemplate: (t: Template) => void;
  isPending: boolean;
}) {
  const [tab, setTab] = useState<Channel>("SMS");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => templates.filter((t) => t.channel === tab), [templates, tab]);

  const handleCreate = () => {
    if (!name.trim() || !body.trim()) {
      setResult({ error: "اسم القالب ونصه مطلوبان." });
      return;
    }
    setResult(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("channel", tab);
      fd.set("subject", subject);
      fd.set("body", body);
      const res = await createMessageTemplate(fd);
      if ((res as any).error) setResult({ error: (res as any).error });
      else {
        setResult({ success: true });
        setName(""); setSubject(""); setBody(""); setCreating(false);
      }
    });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteMessageTemplate(id);
      setDeletingId(null);
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden m-4">
        <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FileText size={22} />
            <h2 className="text-lg font-bold">إدارة القوالب</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreating(!creating)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              قالب جديد
            </button>
            <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
              <X size={22} />
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-l from-[#C9A84C] via-[#F0C040] to-[#C9A84C] shrink-0" />

        <div className="flex gap-1 p-3 bg-gray-50 border-b shrink-0">
          {(["SMS", "EMAIL", "NOTIFICATION"] as Channel[]).map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setTab(ch)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === ch ? "bg-[#003B46] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {CHANNEL_META[ch].icon}
              {CHANNEL_META[ch].label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {creating && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم القالب" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
              {tab !== "SMS" && (
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="الموضوع" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
              )}
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="مثال: مرحباً {{name}}، نود إبلاغك بـ..." className="w-full border rounded-lg px-3 py-2 text-sm bg-white resize-none" />
              <p className="text-[11px] text-gray-500 leading-relaxed">
                <span className="font-medium text-gray-600">متغير الاسم:</span> اكتب{" "}
                <code className="font-mono bg-white/80 px-1 rounded border border-blue-200 text-[10px]">{"{{name}}"}</code>
                {" "}أو{" "}
                <code className="font-mono bg-white/80 px-1 rounded border border-blue-200 text-[10px]">{"{{اسم}}"}</code>
                {" "}في الموضوع أو النص — يُستبدل تلقائياً باسم كل مستثمر عند الإرسال.
              </p>
              {result?.error && <p className="text-xs text-red-600">{result.error}</p>}
              {result?.success && <p className="text-xs text-emerald-600">تم حفظ القالب بنجاح.</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setCreating(false)} className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">إلغاء</button>
                <button type="button" onClick={handleCreate} disabled={isPending} className="text-sm bg-[#003B46] text-white px-4 py-1.5 rounded-lg disabled:opacity-60">حفظ القالب</button>
              </div>
            </div>
          )}

          {filtered.length === 0 && !creating && (
            <div className="text-center py-12 text-gray-400">
              <FileText size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">لا يوجد قوالب لهذا النوع بعد.</p>
            </div>
          )}

          {filtered.map((t) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm">{t.name}</h4>
                  {t.subject && <p className="text-xs text-gray-500 mt-0.5">الموضوع: {t.subject}</p>}
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{t.body}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => { onSelectTemplate(t); onClose(); }}
                    className="text-xs bg-[#003B46] text-white px-3 py-1.5 rounded-lg hover:bg-[#005F6B] transition-colors"
                  >
                    استخدام
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
}: {
  investors: Investor[];
  sectors: Sector[];
  templates: Template[];
  logs: Log[];
}) {
  const [channel, setChannel] = useState<Channel>("SMS");
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
  const formRef = useRef<HTMLFormElement>(null);

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
    setChannel(t.channel);
    if (t.channel !== "SMS") setSubject(t.subject || "");
    setBody(t.body);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set("channel", channel);
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
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">تواصل مع المستثمر</h1>
              <p className="text-sm text-white/70 mt-1">إرسال SMS أو بريد إلكتروني (مع مرفقات) أو إشعارات — من قوالب جاهزة أو رسالة مخصصة.</p>
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
          {/* Channel Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">قناة الإرسال</label>
            <div className="grid grid-cols-3 gap-3">
              {(["SMS", "EMAIL", "NOTIFICATION"] as Channel[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all duration-200 font-semibold text-sm ${
                    channel === ch
                      ? "bg-[#003B46] border-[#003B46] text-white shadow-lg shadow-[#003B46]/20"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#003B46]/30 hover:text-[#003B46]"
                  }`}
                >
                  {CHANNEL_META[ch].icon}
                  {CHANNEL_META[ch].label}
                </button>
              ))}
            </div>
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
          {initialTemplates.filter((t) => t.channel === channel).length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">قالب سريع</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setTemplateId(null); setSubject(""); setBody(""); }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    !templateId ? "bg-[#003B46] text-white border-[#003B46]" : "bg-white text-gray-600 border-gray-200 hover:border-[#003B46]/40"
                  }`}
                >
                  بدون قالب
                </button>
                {initialTemplates.filter((t) => t.channel === channel).map((t) => (
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
          {channel !== "SMS" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الموضوع</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: تحديث هام بخصوص محفظتك الاستثمارية"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نص الرسالة</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
              placeholder="اكتب نص الرسالة هنا… يمكنك استخدام {{name}} لعرض اسم المستثمر."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] bg-gray-50 transition-all placeholder:text-gray-400 resize-none leading-relaxed"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              <span className="font-medium text-gray-600">اسم المستثمر:</span>{" "}
              <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{"{{name}}"}</code>
              {" "}أو{" "}
              <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{"{{اسم}}"}</code>
              {" "}في الموضوع أو النص — يُستبدل باسم كل مستلم عند الإرسال (الإيميل يُرسل لكل مستثمر على حدة عند وجود المتغير).
            </p>
          </div>

          {/* Link URL for notifications */}
          {channel === "NOTIFICATION" && (
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
          {channel === "EMAIL" && (
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
              disabled={isPending}
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

      {/* Template Management Modal */}
      <TemplateModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={initialTemplates}
        onSelectTemplate={handleApplyTemplate}
        isPending={isPending}
      />
    </div>
  );
}
