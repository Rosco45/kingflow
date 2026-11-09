import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    if (product.type === "SERVICE") {
      return NextResponse.json({ error: "Les services n'ont pas de stock physique" }, { status: 400 });
    }

    const type = body.type; // "IN", "OUT", "ADJUSTMENT"
    const rawQuantity = parseInt(body.quantity) || 0;
    const reason = body.reason || "AJUSTEMENT_MANUEL";
    const notes = body.notes || null;
    const referenceDoc = body.referenceDoc || null;

    if (rawQuantity <= 0 && type !== "ADJUSTMENT") {
      return NextResponse.json({ error: "La quantité doit être supérieure à 0" }, { status: 400 });
    }

    let diff = 0;
    let newStock = product.stockQuantity;

    if (type === "IN") {
      diff = rawQuantity;
      newStock = product.stockQuantity + diff;
    } else if (type === "OUT") {
      diff = -rawQuantity;
      newStock = Math.max(0, product.stockQuantity - rawQuantity);
    } else if (type === "ADJUSTMENT") {
      // Body can send target stock directly or relative change
      if (body.targetStock !== undefined) {
        newStock = Math.max(0, parseInt(body.targetStock) || 0);
        diff = newStock - product.stockQuantity;
      } else {
        diff = rawQuantity;
        newStock = Math.max(0, product.stockQuantity + diff);
      }
    }

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { stockQuantity: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId: product.id,
          type,
          quantity: diff,
          previousStock: product.stockQuantity,
          newStock,
          reason,
          referenceDoc,
          notes,
        },
      }),
    ]);

    return NextResponse.json({
      product: updatedProduct,
      movement,
    });
  } catch (error) {
    console.error("POST /api/products/[id]/stock error:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajustement du stock" }, { status: 500 });
  }
}
