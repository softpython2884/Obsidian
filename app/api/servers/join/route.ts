import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

const WELCOME_MESSAGES = [
  "Plop ! {user} vient d'arriver !",
  "Hé regardez ! {user} a rejoint la fête !",
  "Bienvenue {user}, on t'attendait !",
  "{user} a atterri sur le serveur !",
  "Un sauvage {user} apparaît !",
];

export async function POST(req: Request) {
  try {
    const { inviteCode, userId } = await req.json();

    if (!inviteCode || !userId) {
      return NextResponse.json({ error: 'Invite code and user ID are required' }, { status: 400 });
    }

    // Find the server with the invite code
    const server = await prisma.server.findUnique({
      where: {
        inviteCode,
      },
      include: {
        categories: {
          include: {
            channels: true
          }
        }
      }
    });

    if (!server) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if user is banned
    const banned = await prisma.serverBan.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId: server.id,
        },
      },
    });

    if (banned) {
      return NextResponse.json({ error: 'You are banned from this server' }, { status: 403 });
    }

    // Check if user is already a member
    const existingMember = await prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId: server.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(server);
    }

    // Add user to server
    const member = await prisma.serverMember.create({
      data: {
        userId,
        serverId: server.id,
        role: 'MEMBER',
      },
      include: {
        user: true,
      }
    });

    // Send welcome message
    try {
      let targetChannelId = server.systemChannelId;

      // If no system channel set, find the first text channel
      if (!targetChannelId) {
        const firstChannel = await prisma.channel.findFirst({
          where: {
            category: {
              serverId: server.id,
            },
            type: 'TEXT',
          },
          orderBy: {
            name: 'asc'
          }
        });
        targetChannelId = firstChannel?.id || null;
      }

      if (targetChannelId) {
        const randomMsg = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
        const content = randomMsg.replace('{user}', `<@${userId}>`);

        await prisma.message.create({
          data: {
            content: encrypt(content),
            userId: 'marcus-system-bot',
            channelId: targetChannelId,
          }
        });
      }
    } catch (e) {
      console.error('Failed to send welcome message:', e);
    }

    return NextResponse.json(server);
  } catch (error) {
    console.error('Error joining server:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
