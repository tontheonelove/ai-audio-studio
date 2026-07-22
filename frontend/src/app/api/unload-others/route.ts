import { NextResponse } from "next/server";

const PYTHON_BACKEND = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST() {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/unload-others`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

