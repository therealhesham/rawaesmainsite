import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

function getSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");
    return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nationalId, phoneNumber, otp } = body;

        const nid = (nationalId || "").trim();
        const phone = (phoneNumber || "").trim();
        const otpStr = (otp || "").trim();

        if (!nid || !phone || !otpStr) {
            return NextResponse.json(
                { success: false, error: "أدخل رمز التحقق" },
                { status: 400 }
            );
        }

        const record = await prisma.otpVerification.findFirst({
            where: { nationalId: nid, phoneNumber: phone },
            orderBy: { createdAt: "desc" },
        });

        if (!record) {
            return NextResponse.json(
                { success: false, error: "رمز غير صالح. اطلب رمزاً جديداً." },
                { status: 401 }
            );
        }

        if (new Date() > record.expiresAt) {
            await prisma.otpVerification.delete({ where: { id: record.id } });
            return NextResponse.json(
                { success: false, error: "انتهى رمز التحقق. اطلب رمزاً جديداً." },
                { status: 401 }
            );
        }

        if (record.otp !== otpStr) {
            return NextResponse.json(
                { success: false, error: "رمز التحقق غير صحيح." },
                { status: 401 }
            );
        }

        await prisma.otpVerification.delete({ where: { id: record.id } });

        const user = await prisma.user.findFirst({
            where: { nationalId: nid, phoneNumber: phone, isAdmin: false },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "المستخدم غير موجود." },
                { status: 401 }
            );
        }

        const secretKey = getSecretKey();
        const jwt = await new SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secretKey);

        const cookieStore = await cookies();
        cookieStore.set("investor_session", jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (err) {
        console.error("verify-otp error:", err);
        return NextResponse.json(
            { success: false, error: "حدث خطأ. حاول لاحقاً." },
            { status: 500 }
        );
    }
}
