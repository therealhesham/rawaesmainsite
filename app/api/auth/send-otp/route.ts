import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendOtpCode } from "@/lib/msegat";

const prisma = new PrismaClient();

/** حارس محلي فقط؛ مسيجات تفرض صلاحيتها الخاصة على الرمز أيضاً. */
const OTP_EXPIRY_MINUTES = 5;

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

        // مسيجات هي من يولّد الرمز ويرسله؛ نحتفظ بالمعرّف الراجع للتحقق لاحقاً.
        const sent = await sendOtpCode(phone);
        if (!sent.ok || !sent.id) {
            console.error("msegat sendOTPCode failed:", sent.code, sent.message);
            return NextResponse.json(
                { success: false, error: "فشل إرسال الرسالة. حاول لاحقاً." },
                { status: 500 }
            );
        }

        await prisma.otpVerification.deleteMany({
            where: { nationalId: nid, phoneNumber: phone },
        });

        await prisma.otpVerification.create({
            data: {
                nationalId: nid,
                phoneNumber: phone,
                providerRef: sent.id,
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("send-otp error:", err);
        return NextResponse.json(
            { success: false, error: "حدث خطأ. حاول لاحقاً." },
            { status: 500 }
        );
    }
}
