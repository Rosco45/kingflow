import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";

    const suppliers = await prisma.supplier.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { companyName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
              { category: { contains: search } },
            ],
          }
        : undefined,
      include: {
        expenses: {
          select: {
            id: true,
            title: true,
            amount: true,
            isPaid: true,
            expenseDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = suppliers.map((s) => {
      const totalPurchased = s.expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalDue = s.expenses
        .filter((e) => !e.isPaid)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        ...s,
        totalPurchased,
        totalDue,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Le nom du fournisseur est requis" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: body.name.trim(),
        companyName: body.companyName?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        category: body.category?.trim() || "Fournisseur Général",
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("POST /api/suppliers error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du fournisseur" }, { status: 500 });
  }
}
