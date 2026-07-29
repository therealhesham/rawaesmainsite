import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendOtpCode, toMsegatNumber } from "@/lib/msegat";

const prisma = new PrismaClient();

const TEST_PHONE = "533370402";
const TEST_NATIONAL_ID = "__otp_test__";
const OTP_EXPIRY_MINUTES = 5;

export async function POST() {
    try {
        const sent = await sendOtpCode(TEST_PHONE);
        if (!sent.ok || !sent.id) {
            console.error("msegat sendOTPCode failed:", sent.code, sent.message);
            return NextResponse.json(
                { success: false, error: `فشل إرسال الرسالة. (${sent.code}) ${sent.message}` },
                { status: 500 }
            );
        }

        await prisma.otpVerification.deleteMany({
            where: { nationalId: TEST_NATIONAL_ID, phoneNumber: TEST_PHONE },
        });

        await prisma.otpVerification.create({
            data: {
                nationalId: TEST_NATIONAL_ID,
                phoneNumber: TEST_PHONE,
                providerRef: sent.id,
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        return NextResponse.json({ success: true, maskedPhone: toMsegatNumber(TEST_PHONE) });
    } catch (err) {
        console.error("test send-otp error:", err);
        return NextResponse.json(
            { success: false, error: "حدث خطأ." },
            { status: 500 }
        );
    }
}
