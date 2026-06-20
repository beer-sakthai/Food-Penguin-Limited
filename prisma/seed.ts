import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { initialOrders } from '../src/data';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data to prevent duplicates on re-seeding
  await prisma.salesOrder.deleteMany({});
  console.log('Deleted records in salesOrder table');

  for (const order of initialOrders) {
    // Exclude the original 'id' field from the static data,
    // as the database will auto-generate a new unique ID.
    const { id, ...orderData } = order;
    await prisma.salesOrder.create({
      data: orderData,
    });
  }
  console.log(`Seeding finished. ${initialOrders.length} orders created.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
