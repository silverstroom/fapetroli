import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  ragioneSociale: z.string().min(2),
  partitaIva: z.string().min(11).max(16),
  pec: z.string().email().optional().or(z.literal("")),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi: " + parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const email = data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Esiste già un account con questa email." },
        { status: 409 }
      );
    }

    const existingCompany = await prisma.company.findUnique({
      where: { partitaIva: data.partitaIva },
    });
    if (existingCompany) {
      return NextResponse.json(
        { error: "Esiste già un'azienda registrata con questa Partita IVA." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // Crea Company + User in transazione
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          ragioneSociale: data.ragioneSociale,
          partitaIva: data.partitaIva,
          pec: data.pec || null,
          indirizzo: data.indirizzo || null,
          citta: data.citta || null,
        },
      });
      const user = await tx.user.create({
        data: {
          name: data.name,
          email,
          phone: data.phone || null,
          passwordHash,
          role: Role.CLIENT,
          status: UserStatus.PENDING,
          companyId: company.id,
        },
      });
      return { company, user };
    });

    return NextResponse.json({ ok: true, userId: result.user.id });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Errore interno. Riprova più tardi." },
      { status: 500 }
    );
  }
}
