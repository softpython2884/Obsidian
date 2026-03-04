import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ serverId: string; memberId: string }> }
) {
    try {
        const { serverId, memberId } = await params;
        const { roleIds } = await req.json();

        // Verify the member exists in the server
        const member = await prisma.serverMember.findFirst({
            where: {
                serverId,
                userId: memberId,
            },
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Update the roles relation
        const updatedMember = await prisma.serverMember.update({
            where: {
                id: member.id,
            },
            data: {
                roles: {
                    set: roleIds.map((id: string) => ({ id }))
                }
            },
            include: {
                user: true,
                roles: true,
            }
        });

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error('Error updating roles:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
