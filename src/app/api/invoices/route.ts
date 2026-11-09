import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "INVOICE" or "QUOTE"
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("q") || "";

    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          type && type !== "ALL" ? { type } : {},
          status && status !== "ALL" ? { status } : {},
          customerId ? { customerId } : {},
          search
            ? {
                OR: [
                  { number: { contains: search } },
                  { customer: { name: { contains: search } } },
                  { customer: { companyName: { contains: search } } },
                ],
              }
            : {},
        ],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = body.type === "QUOTE" ? "QUOTE" : "INVOICE";
    const prefix = type === "QUOTE" ? "DEV" : "FACT";
    const year = new Date().getFullYear();

    // Auto-generate invoice/quote sequence number
    const count = await prisma.invoice.count({
      where: { type },
    });
    const number =
      body.number?.trim() ||
      `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;

    const items = body.items || [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Au moins un article ou service est requis" }, { status: 400 });
    }

    // Calculate subtotal
    let subtotal = 0;
    const computedItems = items.map((it: any) => {
      const qty = parseFloat(it.quantity) || 1;
      const unitPrice = parseFloat(it.unitPrice) || 0;
      const total = Math.round(qty * unitPrice);
      subtotal += total;
      return {
        productId: it.productId || null,
        description: it.description?.trim() || "Article sans nom",
        quantity: qty,
        unitPrice,
        total,
      };
    });

    // Discount
    const discountType = body.discountType === "FIXED" ? "FIXED" : "PERCENT";
    const discountValue = parseFloat(body.discountValue) || 0;
    let discountAmount = 0;
    if (discountType === "PERCENT") {
      discountAmount = Math.round((subtotal * discountValue) / 100);
    } else {
      discountAmount = Math.min(subtotal, discountValue);
    }

    const afterDiscount = Math.max(0, subtotal - discountAmount);

    // Tax
    const taxRate = parseFloat(body.taxRate) !== undefined ? parseFloat(body.taxRate) : 18;
    const taxAmount = Math.round((afterDiscount * taxRate) / 100);

    const total = afterDiscount + taxAmount;
    const initialPaid = parseFloat(body.paidAmount) || 0;
    const paidAmount = Math.min(total, initialPaid);
    const balanceDue = Math.max(0, total - paidAmount);

    let status = body.status || "DRAFT";
    if (type === "INVOICE") {
      if (paidAmount >= total && total > 0) {
        status = "PAID";
      } else if (paidAmount > 0) {
        status = "PARTIALLY_PAID";
      } else if (!body.status || body.status === "DRAFT") {
        status = "SENT";
      }
    }

    const issueDate = body.issueDate ? new Date(body.issueDate) : new Date();
    const dueDate = body.dueDate
      ? new Date(body.dueDate)
      : new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          number,
          type,
          customerId: body.customerId,
          status,
          issueDate,
          dueDate,
          subtotal,
          discountType,
          discountValue,
          discountAmount,
          taxRate,
          taxAmount,
          total,
          paidAmount,
          balanceDue,
          notes: body.notes || null,
          terms: body.terms || null,
          items: {
            create: computedItems,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // If initial payment was provided
      if (paidAmount > 0 && type === "INVOICE") {
        await tx.payment.create({
          data: {
            invoiceId: created.id,
            customerId: body.customerId,
            amount: paidAmount,
            paymentDate: new Date(),
            paymentMethod: body.paymentMethod || "CASH",
            reference: body.paymentReference || "Acompte initial",
            notes: "Paiement enregistré à la création de la facture",
          },
        });
      }

      // If INVOICE is emitted (not draft or quote), deduct stock
      if (type === "INVOICE" && status !== "DRAFT" && status !== "CANCELLED") {
        for (const item of computedItems) {
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
                  referenceDoc: number,
                  notes: `Vente sur facture ${number}`,
                },
              });
            }
          }
        }
      }

      return created;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la création du document" },
      { status: 500 }
    );
  }
}
