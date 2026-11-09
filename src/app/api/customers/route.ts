import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { companyName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      include: {
        invoices: {
          select: {
            id: true,
            number: true,
            type: true,
            status: true,
            total: true,
            paidAmount: true,
            balanceDue: true,
            issueDate: true,
            dueDate: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
            reference: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = customers.map((c) => {
      // Calculate only real invoices (not quotes or cancelled)
      const validInvoices = c.invoices.filter(
        (i) => i.type === "INVOICE" && i.status !== "CANCELLED"
      );
      const totalBilled = validInvoices.reduce((sum, i) => sum + i.total, 0);
      const totalPaid = c.invoices.reduce((sum, i) => sum + i.paidAmount, 0);
      const balanceDue = validInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

      return {
        ...c,
        totalBilled,
        totalPaid,
        balanceDue,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Le nom du client est requis" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name.trim(),
        companyName: body.companyName?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        country: body.country?.trim() || "Sénégal",
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    );
  }
}
