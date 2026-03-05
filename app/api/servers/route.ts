import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Custom nanoid with specific alphabet for invite codes
const generateInviteCode = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return code;
};

export async function POST(req: Request) {
  try {
    const { name, imageUrl, ownerId } = await req.json();
    const inviteCode = generateInviteCode();

    const server = await prisma.server.create({
      data: {
        name,
        imageUrl,
        inviteCode,
        ownerId,
        roles: {
          create: [
            {
              name: 'Creator',
              color: '#F04747',
              position: 999,
              permissions: 'ADMIN',
            },
            {
              name: 'Member',
              color: '#99AAB5',
              position: 0,
              permissions: 'VIEW_CHANNELS',
            }
          ]
        },
        categories: {
          create: [
            {
              name: 'General',
              channels: {
                create: [
                  { name: 'general', type: 'TEXT' },
                  { name: 'media', type: 'TEXT' }
                ]
              }
            },
            {
              name: 'Staff Only',
              channels: {
                create: [
                  { name: 'staff-chat', type: 'TEXT' }
                ]
              }
            }
          ]
        }
      },
      include: {
        roles: true,
        categories: {
          include: {
            channels: true
          }
        }
      }
    });

    const generalCategory = server.categories.find(c => c.name === 'General');
    const systemChannel = generalCategory?.channels.find(c => c.name === 'general');
    const staffCategory = server.categories.find(c => c.name === 'Staff Only');
    const logChannel = staffCategory?.channels.find(c => c.name === 'staff-chat');

    const updatedServer = await prisma.server.update({
      where: { id: server.id },
      data: {
        systemChannelId: systemChannel?.id,
        logChannelId: logChannel?.id,
      },
      include: {
        roles: true,
        categories: {
          include: {
            channels: true
          }
        }
      }
    });

    // Assign Creator role to owner
    const creatorRole = server.roles.find(r => r.name === 'Creator');
    if (creatorRole) {
      await prisma.serverMember.create({
        data: {
          userId: ownerId,
          serverId: server.id,
          role: 'ADMIN', // Keep legacy field for now
          roles: {
            connect: { id: creatorRole.id }
          }
        }
      });
    }

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error('Error creating server:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const servers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        categories: {
          include: {
            channels: {
              include: {
                allowedRoles: true,
              }
            }
          }
        },
        roles: true,
        members: {
          include: {
            roles: true
          }
        }
      }
    });

    return NextResponse.json(servers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
