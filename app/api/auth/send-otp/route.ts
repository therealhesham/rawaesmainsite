import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OTP_EXPIRY_MINUTES = 5;

/** نفس مزوّد الرابط الشغال؛ القيم الافتراضية = اختبارك المعمول به (بدون استدعاء من هنا). */
function buildSmsUrl(phoneLocal: string, message: string): string {
    const user = process.env.SMS_USER || "966555544961";
    const pass = process.env.SMS_PASS || "Aa555544Bb";
    const sender = process.env.SMS_SENDER || "RawaesES";
    const base =
        (process.env.SMS_API_BASE || "https://www.brcitco-api.com/api/sendsms/").replace(/\/?$/, "/");
    return `${base}?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&to=966${phoneLocal}&message=${encodeURIComponent(message)}&sender=${encodeURIComponent(sender)}`;
}

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanPhoneForSms(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("966")) return digits.slice(3);
    if (digits.startsWith("0")) return digits.slice(1);
    return digits;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nationalId, phoneNumber } = body;

        const nid = (nationalId || "").trim();
        const phone = (phoneNumber || "").trim();

        if (!nid || !phone) {
            return NextResponse.json(
                { success: false, error: "أدخل رقم الهوية ورقم الجوال" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: {
                password: nid,
                phoneNumber: phone,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "رقم الهوية أو رقم الجوال غير مطابق. تحقق من البيانات أو تواصل مع الدعم.",
                },
                { status: 401 }
            );
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await prisma.otpVerification.deleteMany({
            where: { nationalId: nid, phoneNumber: phone },
        });

        await prisma.otpVerification.create({
            data: {
                nationalId: nid,
                phoneNumber: phone,
                otp,
                expiresAt,
            },
        });

        const phoneForSms = cleanPhoneForSms(phone);
        const message = `رمز التحقق: ${otp}`;
        const url = buildSmsUrl(phoneForSms, message);

        const smsRes = await fetch(url);
        if (!smsRes.ok) {
            console.error("SMS API error:", await smsRes.text());
            return NextResponse.json(
                { success: false, error: "فشل إرسال الرسالة. حاول لاحقاً." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("send-otp error:", err);
        return NextResponse.json(
            { success: false, error: "حدث خطأ. حاول لاحقاً." },
            { status: 500 }
        );
    }
}
