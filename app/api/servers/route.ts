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
        members: {
          create: {
            userId: ownerId,
            role: 'ADMIN',
          }
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
        categories: {
          include: {
            channels: true
          }
        }
      }
    });

    return NextResponse.json(server);
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
            channels: true
          }
        }
      }
    });

    return NextResponse.json(servers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
