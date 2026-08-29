import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const orders = await db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = orders.map((order) => ({
    id: order.id,
    customer: order.user?.name || order.user?.email || "Anonyme",
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
