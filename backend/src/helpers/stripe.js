import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51Nxxxxxxx'); // test key

const createStripePayment = async (datVe, tongTien) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: 'Vé xem phim',
          },
          unit_amount: tongTien,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:5173/payment-success',
    cancel_url: 'http://localhost:5173/payment-failed',
  });

  return session.url;
}


export default createStripePayment;