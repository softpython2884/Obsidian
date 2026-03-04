import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { memberId, modId } = await req.json();
    const { serverId } = await params;

    const member = await prisma.serverMember.findUnique({
      where: { id: memberId },
      include: { user: true }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { logChannelId: true }
    });

    await prisma.serverMember.delete({
      where: { id: memberId },
    });

    // Log the kick
    if (server?.logChannelId) {
      const mod = modId ? await prisma.user.findUnique({ where: { id: modId } }) : null;
      const logContent = `🛡️ **Member Kicked**: ${member.user.pseudo} (ID: ${member.user.id})${mod ? ` by ${mod.pseudo}` : ''}`;

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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
