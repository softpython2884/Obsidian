import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await params;
    const { memberId, modId } = await req.json();

    const member = await prisma.serverMember.findUnique({
      where: { id: memberId },
      include: { user: true }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const targetUser = member.user;

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { logChannelId: true }
    });

    // Create ban record
    await prisma.serverBan.create({
      data: {
        userId: targetUser.id,
        serverId: serverId,
      },
    });

    // Remove member
    await prisma.serverMember.delete({
      where: { id: memberId },
    });

    // Log the ban
    if (server?.logChannelId) {
      const mod = modId ? await prisma.user.findUnique({ where: { id: modId } }) : null;
      const logContent = `🚫 **Member Banned**: ${targetUser.pseudo} (ID: ${targetUser.id})${mod ? ` by ${mod.pseudo}` : ''}`;

      await prisma.message.create({
        data: {
          content: encrypt(logContent),
          userId: 'marcus-system-bot',
          channelId: server.logChannelId,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ban error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
