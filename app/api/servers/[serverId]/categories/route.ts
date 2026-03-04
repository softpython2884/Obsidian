import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;
        const { name } = await req.json();

        const category = await prisma.category.create({
            data: {
                name,
                serverId,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('[CATEGORIES_POST]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
