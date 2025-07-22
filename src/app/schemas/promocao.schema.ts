import { z } from 'zod';

export const PromoSchema = z.object({
    title: z.string(),
    type: z.string(),
    assets: z.object({
        image: z.string().default(''),
    }),
    shop: z.string(),
    price: z.object({
        amount: z.number().default(0),
        currency: z.string().default('BRL'),
    }),
    expiry: z.string().transform((date) => new Date(date)),
    url: z.string(),
});
