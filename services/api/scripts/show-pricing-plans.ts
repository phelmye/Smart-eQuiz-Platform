import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showPricingPlans() {
  try {
    const plans = await prisma.marketingPricingPlan.findMany({
      select: { 
        id: true, 
        name: true, 
        interval: true,
        createdAt: true,
      },
      orderBy: [
        { name: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    
    console.log('\nAll Pricing Plans in Database:\n');
    console.log('ID'.padEnd(30) + 'Name'.padEnd(15) + 'Interval'.padEnd(10) + 'Created');
    console.log('-'.repeat(80));
    
    plans.forEach(plan => {
      console.log(
        plan.id.padEnd(30) + 
        plan.name.padEnd(15) + 
        plan.interval.padEnd(10) + 
        plan.createdAt.toISOString()
      );
    });
    
    console.log(`\nTotal: ${plans.length} plans`);
    
    // Find duplicates
    const nameGroups = plans.reduce((acc, plan) => {
      if (!acc[plan.name]) acc[plan.name] = [];
      acc[plan.name].push(plan);
      return acc;
    }, {} as Record<string, typeof plans>);
    
    console.log('\n\nDuplicates Found:');
    Object.entries(nameGroups).forEach(([name, group]) => {
      if (group.length > 1) {
        console.log(`\n${name} (${group.length} copies):`);
        group.forEach((plan, i) => {
          console.log(`  ${i + 1}. ${plan.id} - ${plan.createdAt.toISOString()}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showPricingPlans();
