import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    const name = req.nextUrl.searchParams.get("name") || "file.pdf";

    if (!url) {
        return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            return NextResponse.json({ error: "Upstream error" }, { status: 502 });
        }

        const body = response.body;
        const safeName = name.replace(/[^\w\u0600-\u06FF\s.\-()]/g, "_");

        return new NextResponse(body, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
                "Cache-Control": "private, no-cache",
            },
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }
}
