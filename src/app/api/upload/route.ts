import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const ALLOWED_TYPES = [".stl", ".obj", ".3mf", ".step", ".stp", ".ply"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_TYPES.includes(ext)) {
    return NextResponse.json(
      { error: `File type not supported. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const uniqueName = `${Date.now()}-${session.user.id}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  return NextResponse.json({
    fileName: file.name,
    fileUrl: `/uploads/${uniqueName}`,
    fileSize: file.size,
  });
}
