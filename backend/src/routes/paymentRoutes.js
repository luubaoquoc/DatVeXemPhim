import express from 'express';
import { momoIPN, createVNPay, vnpayReturn, stripeWebhook } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/momo-ipn', momoIPN);
router.post('/create-vnpay', createVNPay)
router.get('/vnpay-return', vnpayReturn)
// router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
