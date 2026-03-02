import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    await prisma.serverMember.create({
      data: {
        userId,
        serverId: server.id,
        role: 'MEMBER',
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error('Error joining server:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
