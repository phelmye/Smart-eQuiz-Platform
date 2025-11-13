const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  console.log('Seeding initial plans and demo tenant...');

  const [essential, growth, premium] = await Promise.all([
    prisma.plan.upsert({ where: { name: 'Essential' }, update: {}, create: { name: 'Essential', features: {} } }),
    prisma.plan.upsert({ where: { name: 'Growth' }, update: {}, create: { name: 'Growth', features: {} } }),
    prisma.plan.upsert({ where: { name: 'Premium' }, update: {}, create: { name: 'Premium', features: {} } }),
  ]);

  let tenant = await prisma.tenant.findFirst({ where: { name: 'Demo Church' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { name: 'Demo Church', planId: growth.id } });
  }

  const pw = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({ where: { email: 'admin@demo.local' }, update: {}, create: { email: 'admin@demo.local', passwordHash: pw, role: 'ORG_ADMIN' } });

  await prisma.userTenant.upsert({ where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } }, update: {}, create: { userId: user.id, tenantId: tenant.id, role: 'ORG_ADMIN' } });

  console.log('Seed complete: tenant:', tenant.name, 'admin:', user.email);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
