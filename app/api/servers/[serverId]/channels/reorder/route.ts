import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;
        const { list } = await req.json(); // list: { id: string, position: number, categoryId?: string }[]

        const updatePromises = list.map((channel: { id: string, position: number, categoryId?: string }) => {
            return prisma.channel.update({
                where: { id: channel.id },
                data: {
                    position: channel.position,
                    categoryId: channel.categoryId !== undefined ? (channel.categoryId === 'null' ? null : channel.categoryId) : undefined
                },
            });
        });

        await Promise.all(updatePromises);

        // Return the full updated server to sync state
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
        console.error('Error reordering channels:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
