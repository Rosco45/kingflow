import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        expenses: {
          orderBy: { expenseDate: "desc" },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });
    }

    const totalPurchased = supplier.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDue = supplier.expenses
      .filter((e) => !e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      ...supplier,
      totalPurchased,
      totalDue,
    });
  } catch (error) {
    console.error("GET /api/suppliers/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        companyName: body.companyName?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        category: body.category?.trim() || "Fournisseur Général",
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("PUT /api/suppliers/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.supplier.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/suppliers/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
