import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const amount = parseFloat(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Le montant du paiement doit être supérieur à 0" }, { status: 400 });
    }

    const newPaidAmount = invoice.paidAmount + amount;
    const newBalanceDue = Math.max(0, invoice.total - newPaidAmount);

    let newStatus = invoice.status;
    if (newBalanceDue === 0) {
      newStatus = "PAID";
    } else {
      newStatus = "PARTIALLY_PAID";
    }

    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount,
          paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
          paymentMethod: body.paymentMethod || "CASH",
          reference: body.reference || null,
          notes: body.notes || null,
        },
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
        include: {
          customer: true,
          items: true,
          payments: {
            orderBy: { paymentDate: "desc" },
          },
        },
      }),
    ]);

    return NextResponse.json({
      payment,
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("POST /api/invoices/[id]/payment error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du règlement" }, { status: 500 });
  }
}
