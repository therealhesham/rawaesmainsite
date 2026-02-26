"use server";

import { PrismaClient } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

const getSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    return new TextEncoder().encode(secret);
};

export async function loginWithNationalIdAndPhone(nationalId: string, phoneNumber: string) {
    const nid = nationalId.trim();
    const phone = phoneNumber.trim();

    if (!nid || !phone) {
        return { success: false, error: "أدخل رقم الهوية ورقم الجوال" };
    }

    const user = await prisma.user.findFirst({
        where: {
            nationalId: nid,
            phoneNumber: phone,
            isAdmin: false,
        },
    });

    if (!user) {
        return { success: false, error: "رقم الهوية أو رقم الجوال غير مطابق. تحقق من البيانات أو تواصل مع الدعم." };
    }

    // Create a JWT
    const secretKey = getSecretKey();
    const jwt = await new SignJWT({ userId: user.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 1 week
        .sign(secretKey);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("investor_session", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
    });

    return { success: true, userId: user.id };
}

export async function logoutInvestor() {
    const cookieStore = await cookies();
    cookieStore.delete("investor_session");
    redirect("/login");
}
