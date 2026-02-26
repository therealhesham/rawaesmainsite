"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    return { success: true, userId: user.id };
}
