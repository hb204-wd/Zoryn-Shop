import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = orders.map((order) => ({
    id: order.id,
    date: order.createdAt.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    total: order.totalAmount,
    status: order.status,
    itemsCount: order.items.length,
  }));

  return NextResponse.json({ orders: formatted });
}
