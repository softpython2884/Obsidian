import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const marcus = await prisma.user.upsert({
        where: { username: 'marcus_system' },
        update: {},
        create: {
            id: 'marcus-system-bot',
            username: 'marcus_system',
            pseudo: 'Marcus',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
            role: 'ADMIN',
            status: 'System Bot',
            bio: 'System bot for Obsidian',
        },
    });
    console.log('Marcus bot ready:', marcus.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
