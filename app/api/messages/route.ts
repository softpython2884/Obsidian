import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const { content, userId, channelId, gifUrl, isEmbed, embedData, isForwarded, forwardedFrom } = await req.json();

    const encryptedContent = content ? encrypt(content) : "";

    // Get serverId via category (Channel has no direct serverId)
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { category: true }
    });
    const serverId = channel?.category?.serverId;

    const message = await prisma.message.create({
      data: {
        content: encryptedContent,
        userId,
        channelId,
        gifUrl,
        isEmbed: isEmbed || false,
        embedData: embedData ? (typeof embedData === 'string' ? embedData : JSON.stringify(embedData)) : null,
        isForwarded: isForwarded || false,
        forwardedFrom: forwardedFrom || null,
      },
      include: {
        user: {
          include: {
            servers: serverId
              ? { where: { serverId }, include: { roles: true } }
              : { where: { id: 'none' }, include: { roles: true } } // empty result for DMs
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

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { category: true }
    });

    if (!channel) {
      return NextResponse.json([], { status: 200 });
    }

    const serverId = channel?.category?.serverId;

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: {
        user: {
          include: {
            servers: serverId
              ? { where: { serverId }, include: { roles: true } }
              : { where: { id: 'none' }, include: { roles: true } } // empty result for DMs
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

