import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quote = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    if (quote.type === "INVOICE") {
      return NextResponse.json({ error: "Ce document est déjà une facture" }, { status: 400 });
    }

    // Generate new invoice number
    const year = new Date().getFullYear();
    const invoiceCount = await prisma.invoice.count({
      where: { type: "INVOICE" },
    });
    const newNumber = `FACT-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const convertedInvoice = await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id: quote.id },
        data: {
          type: "INVOICE",
          number: newNumber,
          status: "SENT",
          issueDate: now,
          dueDate,
          notes: `${quote.notes ? quote.notes + " | " : ""}Converti depuis le devis ${quote.number}`,
        },
        include: {
          customer: true,
          items: true,
          payments: true,
        },
      });

      // Deduct stock for products
      for (const item of quote.items) {
        if (item.productId) {
          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (prod && prod.type === "PRODUCT") {
            const newQty = Math.max(0, prod.stockQuantity - item.quantity);
            await tx.product.update({
              where: { id: prod.id },
              data: { stockQuantity: newQty },
            });
            await tx.stockMovement.create({
              data: {
                productId: prod.id,
                type: "OUT",
                quantity: -item.quantity,
                previousStock: prod.stockQuantity,
                newStock: newQty,
                reason: "VENTE_FACTURE",
                referenceDoc: newNumber,
                notes: `Conversion devis ${quote.number} en facture ${newNumber}`,
              },
            });
          }
        }
      }

      return updated;
    });

    return NextResponse.json(convertedInvoice);
  } catch (error) {
    console.error("POST /api/invoices/[id]/convert error:", error);
    return NextResponse.json({ error: "Erreur lors de la conversion du devis" }, { status: 500 });
  }
}
