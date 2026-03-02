const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.message.findMany();
  let updatedCount = 0;
  for (const msg of messages) {
    if (Math.abs(msg.updatedAt.getTime() - msg.createdAt.getTime()) > 1000) {
      await prisma.message.update({
        where: { id: msg.id },
        data: { updatedAt: msg.createdAt },
      });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} messages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
