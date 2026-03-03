import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { serverId: string, roleId: string } }) {
  try {
    const { name, color, permissions } = await req.json();
    const role = await prisma.role.update({
      where: { id: params.roleId },
      data: { name, color, permissions },
    });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { serverId: string, roleId: string } }) {
  try {
    await prisma.role.delete({
      where: { id: params.roleId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
