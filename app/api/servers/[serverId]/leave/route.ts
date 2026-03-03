import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { serverId: string } }) {
  try {
    const { userId } = await req.json();
    
    // Check if user is owner
    const server = await prisma.server.findUnique({
      where: { id: params.serverId },
    });

    if (server?.ownerId === userId) {
      return NextResponse.json({ error: 'Owner cannot leave server. Delete it instead.' }, { status: 400 });
    }

    await prisma.serverMember.delete({
      where: {
        userId_serverId: {
          userId,
          serverId: params.serverId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
