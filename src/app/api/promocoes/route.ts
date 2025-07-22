'use server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PromoSchema } from '@/app/schemas/promocao.schema';

type Promo = z.infer<typeof PromoSchema>;
const errosDeValidacao: any[] = [];

export async function GET() {
    if (!process.env.API_KEY) {
        return NextResponse.json(
            { error: 'API key is not set in environment variables.' },
            { status: 500 }
        );
    }

    try {
        const res = await fetch(
            `https://api.isthereanydeal.com/deals/v2?country=BR&offset=0&key=${process.env.API_KEY}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 3600 },
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
                'Erro na API, status: ' + res.status + ', message: ' + errorText
            );
        }
        
        const data = await res.json();
        const filteredData: Promo[] = data.list
            .map((item: any, index: number) => {
                const parsed = PromoSchema.safeParse({
                    title: item.title,
                    type: item.type,
                    assets: {
                        image: item.assets?.banner300,
                    },
                    shop: item.deal?.shop?.name,
                    price: {
                        amount: item.deal?.price?.amount,
                        currency: item.deal?.price?.currency,
                    },
                    expiry: item.deal?.expiry || '',
                    url: item.deal?.url,
                });

                if (!parsed.success) {
                    errosDeValidacao.push({
                        index,
                        item,
                        error: parsed.error.format(),
                    });
                }

                return parsed.success ? parsed.data : null;
            })
            .filter((item: Promo | null): item is Promo => item !== null);

        return NextResponse.json(
            {
                nextOffset: data.nextOffset,
                hasMore: data.hasMore,
                promos: filteredData,
                invalidItems: errosDeValidacao,
            },
            { status: 200 }
        );
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to fetch data: ${message}` },
            { status: 500 }
        );
    }
}
