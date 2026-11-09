import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isPaid = searchParams.get("isPaid");
    const supplierId = searchParams.get("supplierId");
    const search = searchParams.get("q") || "";

    const expenses = await prisma.expense.findMany({
      where: {
        AND: [
          category && category !== "ALL" ? { category } : {},
          isPaid !== null && isPaid !== undefined && isPaid !== "ALL"
            ? { isPaid: isPaid === "true" }
            : {},
          supplierId ? { supplierId } : {},
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { supplier: { name: { contains: search } } },
                  { notes: { contains: search } },
                ],
              }
            : {},
        ],
      },
      include: {
        supplier: true,
      },
      orderBy: { expenseDate: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json({ error: "L'intitulé de la dépense est requis" }, { status: 400 });
    }

    const amount = parseFloat(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Le montant doit être supérieur à 0" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        title: body.title.trim(),
        category: body.category || "AUTRES",
        amount,
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
        paymentMethod: body.paymentMethod || "CASH",
        isPaid: body.isPaid !== undefined ? Boolean(body.isPaid) : true,
        supplierId: body.supplierId || null,
        receiptUrl: body.receiptUrl || null,
        notes: body.notes?.trim() || null,
      },
      include: {
        supplier: true,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la dépense" }, { status: 500 });
  }
}
