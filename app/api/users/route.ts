import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUserKeys, encrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const { pseudo, avatarUrl } = await req.json();
    const { publicKey, privateKey } = generateUserKeys();
    
    // Encrypt private key with master key for storage
    const encryptedPrivateKey = encrypt(privateKey);

    // Check if it's the first user (Host)
    const userCount = await prisma.user.count();
    const isHost = userCount === 0;

    const user = await prisma.user.create({
      data: {
        pseudo,
        avatarUrl,
        publicKey,
        privateKey: encryptedPrivateKey,
        isHost,
        role: isHost ? 'ADMIN' : 'MEMBER',
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isBanned: false },
      select: {
        id: true,
        pseudo: true,
        avatarUrl: true,
        state: true,
        status: true,
        role: true,
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
