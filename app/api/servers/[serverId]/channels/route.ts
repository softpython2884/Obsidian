import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;
        const categories = await prisma.category.findMany({
            where: { serverId: serverId },
            include: {
                channels: {
                    include: {
                        allowedRoles: true,
                        members: true,
                    }
                },
            },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('[CHANNELS_GET]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;
        const { name, type, categoryId, isPrivate, roleIds } = await req.json();

        const channel = await prisma.channel.create({
            data: {
                name,
                type: type || 'TEXT',
                categoryId,
                isPrivate: isPrivate || false,
                allowedRoles: {
                    connect: roleIds?.map((id: string) => ({ id })) || []
                }
            },
        });

        return NextResponse.json(channel);
    } catch (error) {
        console.error('[CHANNELS_POST]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
