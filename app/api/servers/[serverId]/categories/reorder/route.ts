import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;
        const { list } = await req.json(); // list: { id: string, position: number }[]

        const updatePromises = list.map((category: { id: string, position: number }) => {
            return prisma.category.update({
                where: { id: category.id, serverId: serverId },
                data: { position: category.position },
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
        console.error('Error reordering categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
