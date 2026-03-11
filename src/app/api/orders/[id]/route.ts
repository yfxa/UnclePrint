import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      settings: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "admin" && order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { status, note, trackingNumber, estimatedPrice, finalPrice } = body;

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(estimatedPrice !== undefined && { estimatedPrice }),
      ...(finalPrice !== undefined && { finalPrice }),
      ...(status && {
        statusHistory: {
          create: { status, note: note ?? null },
        },
      }),
    },
    include: { settings: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(order);
}
