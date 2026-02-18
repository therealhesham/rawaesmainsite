import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // صندوق تأجير السيارات - rentalcarfund
        await prisma.rentalcarfund.create({
            data: {
                daysRental: "+50",
                availableServices: "+6",
                avaiableCars: "+350",
                branches: 7,
            },
        });

        // صندوق الاستقدام - recruitmentFund
        await prisma.recruitmentFund.create({
            data: {
                branches: 1,
                contractsCount: "+100",
                homemaidsCound: "+900",
                musanadRating: "+4",
            },
        });

        // صندوق الضيافة - hospitalityFund
        await prisma.hospitalityFund.create({
            data: {
                branches: 5,
                contractsCount: "500+",
                homemaidsCound: "100+",
                musanadRating: "4.5",
                facilities: "8+",
            },
        });

        return NextResponse.json({
            success: true,
            message: "تم إنشاء بيانات وهمية للصناديق الثلاثة",
            created: {
                rentalcarfund: 1,
                recruitmentFund: 1,
                hospitalityFund: 1,
            },
        });
    } catch (error) {
        console.error("Seed funds error:", error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
