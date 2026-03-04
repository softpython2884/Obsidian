import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ serverId: string; categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const { name } = await req.json();

        const category = await prisma.category.update({
            where: {
                id: categoryId,
            },
            data: {
                name,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('[CATEGORY_ID_PATCH]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ serverId: string; categoryId: string }> }
) {
    try {
        const { categoryId } = await params;

        // Delete all channels in this category
        await prisma.channel.deleteMany({
            where: { categoryId }
        });

        await prisma.category.delete({
            where: {
                id: categoryId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CATEGORY_ID_DELETE]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
