import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ serverId: string; memberId: string }> }
) {
  try {
    const { serverId, memberId } = await params;
    const { role } = await req.json();

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

    // Update the role
    const updatedMember = await prisma.serverMember.update({
      where: {
        id: member.id,
      },
      data: {
        role,
      },
    });

    // Also update the user's global role if it's the main server context
    // For simplicity in this clone, we might sync them or just rely on serverMember role.
    // However, the MemberList uses member.role which comes from serverMember in the API.

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
