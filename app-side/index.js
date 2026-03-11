// app-side/index.js
import { MessageBuilder } from '../shared/message-side';
import { kpayConfig } from '../shared/kpay-config';
import kpayAppSide from 'kpay-amazfit/app-side';

let messageBuilder = null;
let kpay = null;

console.log('✅ APP-SIDE FILE LOADED');

AppSideService({
  onInit() {
    messageBuilder = new MessageBuilder();
    kpay = new kpayAppSide({ ...kpayConfig, messageBuilder });

    kpay.init();

    messageBuilder.listen(() => {
      console.log('SIDE: listening');
    });

    // 1. Intercept "request" messages
    messageBuilder.on('request', (ctx) => {
      try {
        const jsonRpc = messageBuilder.buf2Json(ctx.request.payload);
        console.log('SIDE: request:', JSON.stringify(jsonRpc));

        // 🛑 OUR KILL SWITCH INTERCEPT 🛑
        if (jsonRpc.method === 'KPAY_CANCEL_PURCHASE') {
          console.log('SIDE: Cancelling KPay polling...');
          if (kpay) {
            // Force the library to stop thinking we are buying
            kpay.startedPurchase = false;

            // Murder all the active timers
            if (kpay.recheckTimeout) clearTimeout(kpay.recheckTimeout);
            if (kpay.attemptingFetchTimeout)
              clearTimeout(kpay.attemptingFetchTimeout);
            if (kpay.expectingPingTimeout)
              clearTimeout(kpay.expectingPingTimeout);
          }
          ctx.response({ status: 'cancelled' });
          return; // Stop here! Don't pass this to kpay.onRequest
        }

        const handled = kpay.onRequest(jsonRpc);

        // ✅ Only respond if NOT handled
        if (!handled) {
          ctx.response({ error: 'unknown method' });
        }
      } catch (e) {
        console.log('SIDE error:', e);
        ctx.response({ error: e.message });
      }
    });

    // 2. Intercept "call" (notify) messages just in case
    messageBuilder.on('call', (ctx) => {
      try {
        const jsonRpc = messageBuilder.buf2Json(ctx.payload);

        // 🛑 OUR KILL SWITCH INTERCEPT (Notify format) 🛑
        if (jsonRpc.method === 'KPAY_CANCEL_PURCHASE') {
          console.log('SIDE: Cancelling KPay polling (from call)...');
          if (kpay) {
            kpay.startedPurchase = false;
            if (kpay.recheckTimeout) clearTimeout(kpay.recheckTimeout);
            if (kpay.attemptingFetchTimeout)
              clearTimeout(kpay.attemptingFetchTimeout);
            if (kpay.expectingPingTimeout)
              clearTimeout(kpay.expectingPingTimeout);
          }
        }
      } catch (e) {
        console.log('SIDE call parse error:', e);
      }
    });
  },
});
