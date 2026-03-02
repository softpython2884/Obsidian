import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await params;

    const members = await prisma.serverMember.findMany({
      where: {
        serverId,
      },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            avatarUrl: true,
            state: true,
            status: true,
          }
        }
      }
    });

    const formattedMembers = members.map(member => ({
      ...member.user,
      role: member.role, // Use the server-specific role
      joinedAt: member.joinedAt,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching server members:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
