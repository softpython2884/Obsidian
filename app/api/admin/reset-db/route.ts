import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (code !== '3044') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all data in reverse order of dependencies
    await prisma.reaction.deleteMany();
    await prisma.message.deleteMany();
    await prisma.serverMember.deleteMany();
    await prisma.channel.deleteMany();
    await prisma.category.deleteMany();
    await prisma.server.deleteMany();
    await prisma.user.deleteMany();

    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    console.error('Error resetting DB:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
