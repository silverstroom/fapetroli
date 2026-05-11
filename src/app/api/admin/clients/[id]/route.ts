import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@prisma/client";

const statusSchema = z.object({
  action: z.literal("status"),
  status: z.nativeEnum(UserStatus),
});

const updateSchema = z.object({
  action: z.literal("update"),
  firstName: z.string().min(1, "Nome obbligatorio").optional(),
  lastName: z.string().min(1, "Cognome obbligatorio").optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6, "Telefono troppo corto").optional().nullable(),
  // Dati azienda
  ragioneSociale: z.string().min(2).optional(),
  partitaIva: z.string().min(11).max(16).optional(),
  pec: z.string().email().optional().nullable().or(z.literal("")),
  indirizzo: z.string().optional().nullable(),
  citta: z.string().optional().nullable(),
});

const resetPasswordSchema = z.object({
  action: z.literal("reset_password"),
});

// Legacy: supporta ancora { status } senza action per backward compat
const legacyStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

// Genera password temporanea leggibile (12 char, evita ambigui: 0/O/1/l/I)
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const len = 12;
  let pwd = "";
  for (let i = 0; i < len; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    include: { company: true },
  });
  if (!target || target.role !== "CLIENT") {
    return NextResponse.json({ error: "Cliente non trovato" }, { status: 404 });
  }

  const body = await req.json();

  // STATUS CHANGE (con o senza discriminator)
  const statusParsed = statusSchema.safeParse(body);
  const legacyParsed = legacyStatusSchema.safeParse(body);
  if (statusParsed.success || legacyParsed.success) {
    const newStatus = statusParsed.success
      ? statusParsed.data.status
      : legacyParsed.data!.status;
    await prisma.user.update({
      where: { id: params.id },
      data: { status: newStatus },
    });
    return NextResponse.json({ ok: true });
  }

  // UPDATE PROFILO + AZIENDA
  const updateParsed = updateSchema.safeParse(body);
  if (updateParsed.success) {
    const d = updateParsed.data;

    // Controllo unicità email se cambiata
    if (d.email && d.email.toLowerCase() !== target.email) {
      const existing = await prisma.user.findUnique({
        where: { email: d.email.toLowerCase() },
      });
      if (existing && existing.id !== target.id) {
        return NextResponse.json(
          { error: "Esiste già un account con questa email." },
          { status: 409 }
        );
      }
    }

    // Controllo unicità P.IVA se cambiata
    if (
      d.partitaIva &&
      target.company &&
      d.partitaIva !== target.company.partitaIva
    ) {
      const existing = await prisma.company.findUnique({
        where: { partitaIva: d.partitaIva },
      });
      if (existing && existing.id !== target.company.id) {
        return NextResponse.json(
          { error: "Esiste già un'azienda con questa Partita IVA." },
          { status: 409 }
        );
      }
    }

    const userUpdate: Record<string, unknown> = {};
    if (d.firstName !== undefined) userUpdate.firstName = d.firstName;
    if (d.lastName !== undefined) userUpdate.lastName = d.lastName;
    if (d.firstName !== undefined && d.lastName !== undefined) {
      userUpdate.name = `${d.firstName} ${d.lastName}`.trim();
    }
    if (d.email !== undefined) userUpdate.email = d.email.toLowerCase();
    if (d.phone !== undefined) userUpdate.phone = d.phone || null;

    const companyUpdate: Record<string, unknown> = {};
    if (d.ragioneSociale !== undefined)
      companyUpdate.ragioneSociale = d.ragioneSociale;
    if (d.partitaIva !== undefined) companyUpdate.partitaIva = d.partitaIva;
    if (d.pec !== undefined) companyUpdate.pec = d.pec || null;
    if (d.indirizzo !== undefined) companyUpdate.indirizzo = d.indirizzo || null;
    if (d.citta !== undefined) companyUpdate.citta = d.citta || null;

    await prisma.$transaction([
      ...(Object.keys(userUpdate).length > 0
        ? [prisma.user.update({ where: { id: target.id }, data: userUpdate })]
        : []),
      ...(target.companyId && Object.keys(companyUpdate).length > 0
        ? [
            prisma.company.update({
              where: { id: target.companyId },
              data: companyUpdate,
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true });
  }

  // RESET PASSWORD
  const resetParsed = resetPasswordSchema.safeParse(body);
  if (resetParsed.success) {
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await prisma.user.update({
      where: { id: target.id },
      data: { passwordHash },
    });
    return NextResponse.json({
      ok: true,
      tempPassword,
      message:
        "Password temporanea generata. Comunicala al cliente che dovrà cambiarla dal proprio profilo.",
    });
  }

  return NextResponse.json(
    { error: "Operazione non supportata o dati non validi" },
    { status: 400 }
  );
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    include: { company: true },
  });
  if (!target || target.role !== "CLIENT") {
    return NextResponse.json({ error: "Cliente non trovato" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({ where: { userId: target.id } });
    await tx.user.delete({ where: { id: target.id } });
    if (target.companyId) {
      const others = await tx.user.count({
        where: { companyId: target.companyId },
      });
      if (others === 0) {
        await tx.order.deleteMany({ where: { companyId: target.companyId } });
        await tx.deliveryPoint.deleteMany({
          where: { companyId: target.companyId },
        });
        await tx.company.delete({ where: { id: target.companyId } });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
