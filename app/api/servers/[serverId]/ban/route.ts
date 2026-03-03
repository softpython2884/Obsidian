import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { serverId: string } }) {
  try {
    const { memberId } = await req.json();
    const member = await prisma.serverMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Create ban record
    await prisma.serverBan.create({
      data: {
        userId: member.userId,
        serverId: params.serverId,
      },
    });

    // Remove member
    await prisma.serverMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ban error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
