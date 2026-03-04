import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await params;
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        categories: {
          include: {
            channels: {
              include: {
                allowedRoles: true,
              }
            }
          }
        },
        roles: true,
        members: {
          include: {
            user: true,
            roles: true,
          }
        }
      }
    });
    return NextResponse.json(server);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await params;
    const { name, imageUrl } = await req.json();
    const server = await prisma.server.update({
      where: { id: serverId },
      data: { name, imageUrl },
      include: {
        categories: {
          include: {
            channels: {
              include: {
                allowedRoles: true,
              }
            }
          }
        },
        roles: true,
        members: {
          include: {
            user: true,
            roles: true,
          }
        }
      }
    });
    return NextResponse.json(server);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await params;
    await prisma.server.delete({
      where: { id: serverId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
