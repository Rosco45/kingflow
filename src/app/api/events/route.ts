import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const monthParam = searchParams.get("month"); // YYYY-MM
    const type = searchParams.get("type");

    let whereClause: any = {};

    if (dateParam) {
      const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    } else if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      whereClause.date = { gte: startOfMonth, lte: endOfMonth };
    }

    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json({ error: "Le titre de l'événement est requis" }, { status: 400 });
    }

    const eventDate = body.date ? new Date(body.date) : new Date();

    const created = await prisma.calendarEvent.create({
      data: {
        title: body.title.trim(),
        type: body.type || "AUTRE",
        date: eventDate,
        time: body.time?.trim() || null,
        location: body.location?.trim() || null,
        clientName: body.clientName?.trim() || null,
        notes: body.notes?.trim() || null,
        isDone: Boolean(body.isDone),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Erreur création événement" }, { status: 500 });
  }
}
