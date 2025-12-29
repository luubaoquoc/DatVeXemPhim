import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // test key

const createStripePayment = async (datVe, tongTien) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],


    metadata: { orderId: datVe.maDatVe.toString() },
    line_items: [
      {
        price_data: {
          currency: 'VND',
          product_data: {
            name: `Vé xem phim - Đơn #${datVe.maDatVe}`,
          },
          unit_amount: Math.round(tongTien),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/dat-ve-thanh-cong?status=00&maDatVe=${datVe.maDatVe}`,
    cancel_url: `${process.env.CLIENT_URL}/lich-su-dat-ve`,
  });

  return session.url;
}


export default createStripePayment;