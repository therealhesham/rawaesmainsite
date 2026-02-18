"use server";

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const prisma = new PrismaClient();

const loginSchema = z.object({
    phoneNumber: z.string().min(1, "رقم الجوال مطلوب"),
    password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export async function loginAdmin(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            error: "يرجى التحقق من المدخلات",
        };
    }

    const { phoneNumber, password } = result.data;

    try {
        const user = await prisma.user.findFirst({
            where: {
                phoneNumber: phoneNumber,
                isAdmin: true,
            },
        });

        if (!user || user.password !== password) {
            return {
                error: "بيانات الدخول غير صحيحة أو ليس لديك صلاحية الدخول",
            };
        }

        const cookieStore = await cookies();
        cookieStore.set("admin_session", user.id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return {
            error: "حدث خطأ أثناء تسجيل الدخول",
        };
    }

    redirect("/admin");
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    redirect("/admin/login");
}
