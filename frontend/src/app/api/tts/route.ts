import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${PYTHON_BACKEND}/tts`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      return NextResponse.json(error, { status: response.status });
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": contentDisposition || 'attachment; filename="tts.wav"',
      },
    });
  } catch (error: any) {
    console.error("❌ TTS API Error:", error);
    return NextResponse.json({ detail: `Server error: ${error.message}` }, { status: 500 });
  }
}