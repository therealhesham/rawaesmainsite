import { NextRequest, NextResponse } from "next/server";

/** عنوان سيرفر استخراج التقارير (السكريبت Express) — مثال: https://your-vps.com أو http://localhost:3172 */
const EXTRACTING_API_URL = process.env.EXTRACTING_API_URL || "";

export async function POST(req: NextRequest) {
    if (!EXTRACTING_API_URL) {
        return NextResponse.json(
            { status: "error", message: "EXTRACTING_API_URL غير مضبوط في البيئة." },
            { status: 500 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file || file.size === 0) {
            return NextResponse.json(
                { status: "error", message: "لم يتم إرسال أي ملف. الرجاء إرفاق ملف Excel باسم الحقل (file)." },
                { status: 400 }
            );
        }

        const forwardFormData = new FormData();
        forwardFormData.append("file", file);

        const extractingUrl = EXTRACTING_API_URL.replace(/\/$/, "") + "/extracting";
        const response = await fetch(extractingUrl, {
            method: "POST",
            body: forwardFormData,
            headers: {
                // لا نضع Content-Type حتى يضبط fetch boundary تلقائياً لـ multipart
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return NextResponse.json(
                { status: "error", message: data?.message || "فشل طلب الاستخراج من الخادم البعيد.", ...data },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Extract reports API error:", error);
        return NextResponse.json(
            {
                status: "error",
                message: "خطأ أثناء إرسال الملف لخدمة الاستخراج.",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
