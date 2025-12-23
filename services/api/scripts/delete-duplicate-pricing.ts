import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDuplicatePricing() {
  console.log('Deleting duplicate pricing plans...\n');

  // IDs to delete (older ones starting with cmjet)
  const idsToDelete = [
    'cmjet14f7001tf0aiia9c20rw', // Starter (old)
    'cmjet14u9001uf0aijq6z6ine', // Professional (old)
    'cmjet158w001vf0aitiupfrkb', // Enterprise (old)
  ];

  try {
    for (const id of idsToDelete) {
      const deleted = await prisma.marketingPricingPlan.delete({
        where: { id },
      });
      console.log(`✓ Deleted: ${deleted.name} (${id})`);
    }

    console.log('\n✓ All duplicates deleted successfully!');
    
    // Show remaining plans
    const remaining = await prisma.marketingPricingPlan.findMany({
      select: { id: true, name: true, interval: true },
      orderBy: { name: 'asc' },
    });
    
    console.log('\nRemaining pricing plans:');
    remaining.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.interval}): ${plan.id}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDuplicatePricing();
