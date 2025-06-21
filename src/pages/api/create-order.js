export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: 'Monto inválido' });
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
    const PAYPAL_API = 'https://api-m.paypal.com';

    try {
        const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!authResponse.ok) {
            const errorDetails = await authResponse.text();
            console.error('Error al obtener el token de PayPal:', errorDetails);
            throw new Error('No se pudo autenticar con PayPal');
        }

        const authData = await authResponse.json();

        const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authData.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: parseFloat(amount).toFixed(2),
                        },
                    },
                ],
            }),
        });

        if (!orderResponse.ok) {
            const errorDetails = await orderResponse.text();
            console.error('Error al crear la orden:', errorDetails);
            throw new Error('No se pudo crear la orden en PayPal');
        }

        const orderData = await orderResponse.json();
        res.status(200).json({ id: orderData.id });
    } catch (error) {
        console.error('Error en la API de PayPal:', error.message);
        res.status(500).json({ error: error.message });
    }
}
