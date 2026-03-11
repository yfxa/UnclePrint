import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = session.user.role === "admin" ? {} : { userId: session.user.id };
  const orders = await prisma.order.findMany({
    where,
    include: { settings: true, statusHistory: { orderBy: { createdAt: "asc" } }, user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { fileName, fileUrl, fileSize, notes, settings } = body;

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      fileName,
      fileUrl,
      fileSize,
      notes,
      status: "uploaded",
      settings: settings
        ? {
            create: {
              printerModel: settings.printerModel ?? "Bambu Lab X1C",
              material: settings.material ?? "PLA",
              nozzleSize: settings.nozzleSize ?? "0.4mm",
              layerHeight: settings.layerHeight ?? "0.2mm",
              infillPercent: settings.infillPercent ?? 15,
              color: settings.color ?? "White",
              quantity: settings.quantity ?? 1,
            },
          }
        : {
            create: {},
          },
      statusHistory: {
        create: { status: "uploaded", note: "File uploaded successfully" },
      },
    },
    include: { settings: true, statusHistory: true },
  });

  return NextResponse.json(order);
}
