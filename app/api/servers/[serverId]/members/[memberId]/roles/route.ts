import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ serverId: string; memberId: string }> }
) {
    try {
        const { serverId, memberId } = await params;
        const { roleIds, modId } = await req.json();

        // Verify the member exists in the server and fetch current roles
        const member = await prisma.serverMember.findFirst({
            where: {
                serverId,
                userId: memberId,
            },
            include: {
                user: true,
                roles: true,
            }
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        const oldRoleIds = member.roles.map(r => r.id);
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { logChannelId: true }
        });

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

        // Log the change if log channel exists
        if (server?.logChannelId) {
            const addedRoles = updatedMember.roles.filter(r => !oldRoleIds.includes(r.id));
            const removedRoles = member.roles.filter(r => !roleIds.includes(r.id));

            if (addedRoles.length > 0 || removedRoles.length > 0) {
                const mod = modId ? await prisma.user.findUnique({ where: { id: modId } }) : null;
                let logContent = `🛡️ **Roles Updated**: ${member.user.pseudo} (ID: ${member.user.id})${mod ? ` by ${mod.pseudo}` : ''}`;

                if (addedRoles.length > 0) {
                    logContent += `\n✅ **Added**: ${addedRoles.map(r => r.name).join(', ')}`;
                }
                if (removedRoles.length > 0) {
                    logContent += `\n❌ **Removed**: ${removedRoles.map(r => r.name).join(', ')}`;
                }

                await prisma.message.create({
                    data: {
                        content: encrypt(logContent),
                        userId: 'marcus-system-bot',
                        channelId: server.logChannelId,
                    }
                });
            }
        }

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error('Error updating roles:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

