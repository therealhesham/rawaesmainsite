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

export async function checkUserExists(nationalId: string, phoneNumber: string) {
    const nid = nationalId.trim();
    const phone = phoneNumber.trim();
    if (!nid || !phone) {
        return { exists: false, error: "أدخل رقم الهوية ورقم الجوال" };
    }
    const user = await prisma.user.findFirst({
        where: { password: nid, phoneNumber: phone },
    });
    if (!user) {
        return { exists: false, error: "رقم الهوية أو رقم الجوال غير مطابق. تحقق من البيانات أو تواصل مع الدعم." };
    }
    return { exists: true };
}

export async function getMatchingProfiles(nationalId: string, phoneNumber: string) {
    const nid = nationalId.trim();
    const phone = phoneNumber.trim();
    if (!nid || !phone) {
        return { profiles: [] };
    }
    const users = await prisma.user.findMany({
        where: { password: nid, phoneNumber: phone },
        select: {
            id: true,
            name: true,
            profilepicture: true,
            email: true,
            investmentSectors: {
                select: { sector: { select: { nameAr: true, key: true } } },
            },
        },
    });
    return {
        profiles: users.map((u) => ({
            id: u.id,
            name: u.name,
            profilepicture: u.profilepicture,
            email: u.email,
            sectors: u.investmentSectors.map((s) => s.sector.nameAr || s.sector.key),
        })),
    };
}

export async function loginAsProfile(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!user) {
        return { success: false, error: "الملف الشخصي غير موجود" };
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

    return { success: true, userId: user.id };
}

export async function loginWithNationalIdAndPhone(nationalId: string, phoneNumber: string) {
    const nid = nationalId.trim();
    const phone = phoneNumber.trim();

    if (!nid || !phone) {
        return { success: false, error: "أدخل رقم الهوية ورقم الجوال" };
    }

    const users = await prisma.user.findMany({
        where: { password: nid, phoneNumber: phone },
        select: { id: true },
    });

    if (users.length === 0) {
        return { success: false, error: "رقم الهوية أو رقم الجوال غير مطابق. تحقق من البيانات أو تواصل مع الدعم." };
    }

    if (users.length > 1) {
        return { success: true, multipleProfiles: true, profileCount: users.length };
    }

    const user = users[0];
    const secretKey = getSecretKey();
    const jwt = await new SignJWT({ userId: user.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);

    const cookieStore = await cookies();
    cookieStore.set("investor_session", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return { success: true, userId: user.id };
}

export async function logoutInvestor() {
    const cookieStore = await cookies();
    cookieStore.delete("investor_session");
    redirect("/login");
}

/** بوابة مخفية: تسجيل دخول الأدمن باستخدام جلسة المستثمر (يُشترط isAdmin: true) */
export async function switchToAdminFromInvestor() {
    const cookieStore = await cookies();
    const token = cookieStore.get("investor_session")?.value;
    if (!token) {
        redirect("/admin/login");
    }
    let userId: number;
    try {
        const { payload } = await jwtVerify(token, getSecretKey());
        userId = payload.userId as number;
    } catch {
        redirect("/admin/login");
    }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isAdmin: true } });
    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/admin/login");
    cookieStore.set("admin_session", user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });
    redirect("/admin");
}
