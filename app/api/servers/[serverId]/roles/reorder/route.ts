import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;
        const { list } = await req.json(); // list: { id: string, position: number }[]

        const updatePromises = list.map((role: { id: string, position: number }) => {
            return prisma.role.update({
                where: { id: role.id, serverId: serverId },
                data: { position: role.position },
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
        console.error('Error reordering roles:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
