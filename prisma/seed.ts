/**
 * SEED SCRIPT - FA Petroli Portale
 *
 * Crea:
 *  1. L'unico utente ADMIN, leggendo le credenziali dalle env vars
 *     ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
 *  2. Il catalogo prodotti FA Petroli
 *
 * Esecuzione: npm run db:seed
 *
 * SICUREZZA: l'admin viene creato SOLO se non esiste già nel DB.
 * Per cambiare la password admin in seguito, fallo direttamente
 * dal pannello admin (sezione Profilo) o eliminandolo da Prisma Studio.
 */

import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Avvio seed FA Petroli...\n");

  // ─── 1. ADMIN UNICO ────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Amministratore";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "❌ ADMIN_EMAIL e ADMIN_PASSWORD devono essere impostate nel file .env"
    );
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (existingAdmin) {
    console.log(`✓ Admin già presente: ${existingAdmin.email}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`✅ Admin creato: ${admin.email}`);
    console.log(`   ⚠️  Salva queste credenziali in luogo sicuro!`);
  }

  // ─── 2. CATALOGO PRODOTTI ─────────────────────────────────────
  const products = [
    { name: "Gasolio Autotrazione", icon: "🚛" },
    { name: "Gasolio Agricolo", icon: "🚜" },
    { name: "Gasolio Riscaldamento", icon: "🏠" },
    { name: "Benzina SSPB Autotrazione", icon: "⛽" },
    { name: "Benzina SSPB Agricola", icon: "🌾" },
    { name: "Oli Lubrificanti", icon: "🔧" },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log(`✅ ${products.length} prodotti nel catalogo\n`);

  console.log("🎉 Seed completato.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
