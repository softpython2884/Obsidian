import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, targetUserId } = await request.json();

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: 'User ID and Target User ID are required' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if DM already exists
    const existingDM = await prisma.channel.findFirst({
      where: {
        type: 'DM',
        AND: [
          { members: { some: { id: userId } } },
          { members: { some: { id: targetUserId } } }
        ]
      },
      include: {
        members: true
      }
    });

    if (existingDM) {
      return NextResponse.json(existingDM);
    }

    // Create new DM
    const newDM = await prisma.channel.create({
      data: {
        name: `dm-${userId}-${targetUserId}`, // Internal name
        type: 'DM',
        members: {
          connect: [
            { id: userId },
            { id: targetUserId }
          ]
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(newDM);
  } catch (error) {
    console.error('Error creating DM:', error);
    return NextResponse.json({ error: 'Failed to create DM' }, { status: 500 });
  }
}
