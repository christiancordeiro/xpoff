import { GET } from '../../app/api/promocoes/route';
import { PromoSchema } from '@/app/schemas/promocao.schema';

it('Retorna a resposta 200 OK', async () => {
    process.env.API_KEY = 'test_api';

    const mockApiResponse = {
        nextOffset: 20,
        hasMore: true,
        list: [
            {
                title: "The Keepers: The Order's Last Secret",
                type: 'dlc',
                assets: {
                    image: '',
                },
                shop: 'MacGameStore',
                price: {
                    amount: 27.76,
                    currency: 'BRL',
                },
                expiry: null,
                url: 'https://itad.link/018d9386-8566-73b6-9cc4-8ebd8af78c75/',
            },
        ],
    };

    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
});

it('valida corretamente dados com PromoSchema', () => {
    const validPromo = {
        title: 'Oferta',
        type: 'game',
        assets: { image: 'imagem.jpg' },
        shop: 'Steam',
        price: { amount: 20, currency: 'BRL' },
        expiry: 'null',
        url: 'https://steam.com',
    };

    const result = PromoSchema.safeParse(validPromo);
    expect(result.success).toBe(true);
});

it('valida se API_KEY está definida', async () => {
    delete process.env.API_KEY;

    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe('API key is not set in environment variables.');
});
