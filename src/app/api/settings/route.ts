import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          id: "default",
          name: "KingFlow Commerce SARL",
          currency: "XOF",
          defaultVatRate: 18.0,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des paramètres" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await prisma.companySettings.upsert({
      where: { id: "default" },
      update: {
        name: body.name,
        tagline: body.tagline,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp,
        address: body.address,
        city: body.city,
        country: body.country,
        taxId: body.taxId,
        currency: body.currency,
        defaultVatRate: parseFloat(body.defaultVatRate) || 18,
        invoiceTerms: body.invoiceTerms,
        receiptFooter: body.receiptFooter,
      },
      create: {
        id: "default",
        name: body.name || "KingFlow SARL",
        currency: body.currency || "XOF",
        defaultVatRate: parseFloat(body.defaultVatRate) || 18,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour des paramètres" }, { status: 500 });
  }
}
