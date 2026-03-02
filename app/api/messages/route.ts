import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const { content, userId, channelId, gifUrl, isEmbed, embedData } = await req.json();

    // Encrypt content before saving
    const encryptedContent = encrypt(content);

    const message = await prisma.message.create({
      data: {
        content: encryptedContent,
        userId,
        channelId,
        gifUrl,
        isEmbed: isEmbed || false,
        embedData: embedData ? JSON.stringify(embedData) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            avatarUrl: true,
            role: true,
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            avatarUrl: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
