import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, imageUrl, ownerId } = await req.json();

    const server = await prisma.server.create({
      data: {
        name,
        imageUrl,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'ADMIN',
          }
        },
        categories: {
          create: {
            name: 'General',
            channels: {
              create: {
                name: 'general',
                type: 'TEXT',
              }
            }
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
