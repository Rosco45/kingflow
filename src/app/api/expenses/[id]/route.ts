import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: { supplier: true },
    });

    if (!expense) {
      return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("GET /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        title: body.title?.trim(),
        category: body.category,
        amount: parseFloat(body.amount),
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : undefined,
        paymentMethod: body.paymentMethod,
        isPaid: body.isPaid !== undefined ? Boolean(body.isPaid) : undefined,
        supplierId: body.supplierId || null,
        receiptUrl: body.receiptUrl || null,
        notes: body.notes?.trim() || null,
      },
      include: { supplier: true },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("PUT /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.expense.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
