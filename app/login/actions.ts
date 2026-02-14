"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function sendOtp(phoneNumber: string) {
    const user = await prisma.user.findFirst({
        where: { phoneNumber, isAdmin: false }
    });

    if (!user) {
        return { success: false, error: "رقم الجوال غير مسجل" };
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    return { success: true, otp };
}

export async function verifyOtp(phoneNumber: string, otp: string) {
    console.log(`Verifying OTP for ${phoneNumber}: ${otp}`);
    // Simulate verification
    if (otp.length === 4) {
        const user = await prisma.user.findFirst({
            where: { phoneNumber, isAdmin: false }
        });

        if (user) {
            console.log("Login Successful");
            return { success: true, userId: user.id };
        }
    }
    return { success: false, error: "رمز التحقق غير صحيح" };
}
