import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Only available in development
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { email, password, name } = await req.json();
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "admin", password: hashed },
    create: { email, name: name ?? "Admin", password: hashed, role: "admin" },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
