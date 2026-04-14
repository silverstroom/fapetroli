import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  type: z.literal("profile"),
  name: z.string().min(2),
  phone: z.string().optional(),
  pec: z.string().email().optional().or(z.literal("")),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
});

const passwordSchema = z.object({
  type: z.literal("password"),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await req.json();

  if (body.type === "profile") {
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Dati non validi" },
        { status: 400 }
      );
    const d = parsed.data;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { name: d.name, phone: d.phone || null },
      }),
      ...(session.user.companyId
        ? [
            prisma.company.update({
              where: { id: session.user.companyId },
              data: {
                pec: d.pec || null,
                indirizzo: d.indirizzo || null,
                citta: d.citta || null,
              },
            }),
          ]
        : []),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (body.type === "password") {
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "La nuova password deve avere almeno 8 caratteri" },
        { status: 400 }
      );
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }
    const ok = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash
    );
    if (!ok) {
      return NextResponse.json(
        { error: "Password attuale non corretta" },
        { status: 400 }
      );
    }
    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
}
