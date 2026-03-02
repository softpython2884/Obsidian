import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.message.findMany();
    
    let updatedCount = 0;
    for (const msg of messages) {
      // If updatedAt is significantly different from createdAt (e.g. > 1s)
      // AND we assume no messages were actually edited before (since schema didn't support it)
      // We reset updatedAt to createdAt
      if (Math.abs(msg.updatedAt.getTime() - msg.createdAt.getTime()) > 1000) {
        await prisma.message.update({
          where: { id: msg.id },
          data: { updatedAt: msg.createdAt },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error) {
    console.error('Error fixing DB:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
