import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { serverId: string } }) {
  try {
    const { name, imageUrl } = await req.json();
    const server = await prisma.server.update({
      where: { id: params.serverId },
      data: { name, imageUrl },
    });
    return NextResponse.json(server);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { serverId: string } }) {
  try {
    await prisma.server.delete({
      where: { id: params.serverId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
