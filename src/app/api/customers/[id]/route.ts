import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          include: {
            items: true,
            payments: true,
          },
          orderBy: { issueDate: "desc" },
        },
        payments: {
          include: {
            invoice: {
              select: {
                number: true,
              },
            },
          },
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const validInvoices = customer.invoices.filter(
      (i) => i.type === "INVOICE" && i.status !== "CANCELLED"
    );
    const totalBilled = validInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = customer.invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const balanceDue = validInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

    return NextResponse.json({
      ...customer,
      totalBilled,
      totalPaid,
      balanceDue,
    });
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.update({
      where: { id: params.id },
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

    return NextResponse.json(customer);
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customer.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
