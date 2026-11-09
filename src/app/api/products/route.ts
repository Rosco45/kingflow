import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const stockStatus = searchParams.get("stockStatus");

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { sku: { contains: search } },
                  { category: { contains: search } },
                ],
              }
            : {},
          category && category !== "ALL" ? { category } : {},
          type && type !== "ALL" ? { type } : {},
        ],
      },
      include: {
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filtered = products;
    if (stockStatus === "LOW") {
      filtered = products.filter(
        (p) => p.type === "PRODUCT" && p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert
      );
    } else if (stockStatus === "OUT") {
      filtered = products.filter((p) => p.type === "PRODUCT" && p.stockQuantity <= 0);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Le nom de l'article est requis" }, { status: 400 });
    }

    const sku =
      body.sku?.trim() ||
      `ART-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json({ error: `La référence SKU "${sku}" existe déjà` }, { status: 400 });
    }

    const initialStock = parseInt(body.stockQuantity) || 0;

    const product = await prisma.product.create({
      data: {
        sku,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        category: body.category?.trim() || "Général",
        type: body.type === "SERVICE" ? "SERVICE" : "PRODUCT",
        purchasePrice: parseFloat(body.purchasePrice) || 0,
        sellingPrice: parseFloat(body.sellingPrice) || 0,
        stockQuantity: body.type === "SERVICE" ? 999 : initialStock,
        minStockAlert: parseInt(body.minStockAlert) || 5,
        unit: body.unit?.trim() || "unité",
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    if (product.type === "PRODUCT" && initialStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: initialStock,
          previousStock: 0,
          newStock: initialStock,
          reason: "RECEPTION_FOURNISSEUR",
          referenceDoc: "INITIAL",
          notes: "Création de la fiche article et stock initial.",
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}
