import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await params;
    const roles = await prisma.role.findMany({
      where: { serverId: serverId },
      orderBy: { position: 'desc' },
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await params;
    const { name, color, permissions } = await req.json();
    const role = await prisma.role.create({
      data: {
        name,
        color,
        permissions,
        serverId: serverId,
        position: 0, // Default position
      },
    });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
