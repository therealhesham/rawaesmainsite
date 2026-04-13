import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_PHONE = "533370402";
const TEST_NATIONAL_ID = "__otp_test__";
const OTP_EXPIRY_MINUTES = 5;

function buildSmsUrl(phonenumber: string, message: string): string {
    return `https://www.brcitco-api.com/api/sendsms/?user=966555544961&pass=Rwes1484&to=966533370402&message=${encodeURIComponent(message)}&sender=RawaesEs`;
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

export async function POST() {
    try {
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await prisma.otpVerification.deleteMany({
            where: { nationalId: TEST_NATIONAL_ID, phoneNumber: TEST_PHONE },
        });

        await prisma.otpVerification.create({
            data: {
                nationalId: TEST_NATIONAL_ID,
                phoneNumber: TEST_PHONE,
                otp,
                expiresAt,
            },
        });

        const phoneForSms = cleanPhoneForSms(TEST_PHONE);
        const message = `رمز التحقق: ${otp}`;
        const url = buildSmsUrl(phoneForSms, message);

        const smsRes = await fetch(url);
        if (!smsRes.ok) {
            console.error("SMS API error:", await smsRes.text());
            return NextResponse.json(
                { success: false, error: "فشل إرسال الرسالة." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, maskedPhone: `966${phoneForSms}` });
    } catch (err) {
        console.error("test send-otp error:", err);
        return NextResponse.json(
            { success: false, error: "حدث خطأ." },
            { status: 500 }
        );
    }
}
