import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

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

    // Decrypt message content for preview
    const dmsWithDecryptedMessages = dms.map(dm => ({
      ...dm,
      messages: dm.messages.map(msg => ({
        ...msg,
        content: msg.content ? decrypt(msg.content) : msg.content
      }))
    }));

    return NextResponse.json(dmsWithDecryptedMessages);
  } catch (error) {
    console.error('Error fetching DMs:', error);
    return NextResponse.json({ error: 'Failed to fetch DMs' }, { status: 500 });
  }
}
