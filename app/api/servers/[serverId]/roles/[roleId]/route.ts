import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ serverId: string, roleId: string }> }) {
  try {
    const { roleId } = await params;
    const { name, color, permissions } = await req.json();
    const role = await prisma.role.update({
      where: { id: roleId },
      data: { name, color, permissions },
    });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ serverId: string, roleId: string }> }) {
  try {
    const { roleId } = await params;
    await prisma.role.delete({
      where: { id: roleId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
