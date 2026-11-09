import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: {
        title: body.title?.trim(),
        type: body.type,
        date: body.date ? new Date(body.date) : undefined,
        time: body.time?.trim() || null,
        location: body.location?.trim() || null,
        clientName: body.clientName?.trim() || null,
        notes: body.notes?.trim() || null,
        isDone: body.isDone !== undefined ? Boolean(body.isDone) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json({ error: "Erreur modification événement" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.calendarEvent.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Erreur suppression événement" }, { status: 500 });
  }
}
