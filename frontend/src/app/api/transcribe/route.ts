import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await fetch(`${PYTHON_BACKEND}/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      return NextResponse.json(error, { status: response.status });
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    const contentType = response.headers.get("content-type") || "application/x-subrip";

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition || 'attachment; filename="subtitle.srt"',
      },
    });
  } catch (error: any) {
    console.error("❌ Transcribe API Error:", error);
    return NextResponse.json({ detail: `Server error: ${error.message}` }, { status: 500 });
  }
}