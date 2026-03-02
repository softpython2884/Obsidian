import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    const dms = await prisma.channel.findMany({
      where: {
        type: 'DM',
        members: {
          some: {
            id: userId
          }
        }
      },
      include: {
        members: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(dms);
  } catch (error) {
    console.error('Error fetching DMs:', error);
    return NextResponse.json({ error: 'Failed to fetch DMs' }, { status: 500 });
  }
}
