import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
    try {
        const { serverId, channelId } = await params;
        const { name, type, isPrivate, roleIds } = await req.json();

        const channel = await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                name,
                type,
                isPrivate,
                allowedRoles: {
                    set: roleIds?.map((id: string) => ({ id })) || []
                }
            },
        });

        return NextResponse.json(channel);
    } catch (error) {
        console.error('[CHANNEL_ID_PATCH]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
    try {
        const { channelId } = await params;

        await prisma.channel.delete({
            where: {
                id: channelId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CHANNEL_ID_DELETE]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
