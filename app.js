// app.js
import './shared/device-polyfill';
import { MessageBuilder } from './shared/message';
import { getPackageInfo } from '@zos/app';
import * as ble from '@zos/ble';
import { kpayConfig } from './shared/kpay-config';
import kpayApp from 'kpay-amazfit/app';

App({
  globalData: {
    messageBuilder: null,
    kpay: null,
    kpayStatus: null, // Optional: { status, paymentCode }
  },

  onCreate() {
    console.log('app on create invoke');

    const { appId } = getPackageInfo();

    // 1. Re-added the 'ble' parameter here
    const messageBuilder = new MessageBuilder({
      appId,
      appDevicePort: 20,
      appSidePort: 0,
      ble,
    });

    this.globalData.messageBuilder = messageBuilder;

    // 2. UNCOMMENTED connect() so the watch can actually talk to the phone
    messageBuilder.connect();
    // messageBuilder.listen() is usually called automatically by connect in the Zepp boilerplate,
    // but if your specific message.js polyfill requires it, you can leave it uncommented:
    // messageBuilder.listen();

    // 3. Initialize KPay
    const kpay = new kpayApp({
      ...kpayConfig,
      dialogPath: 'page/kpay/index.page',
      messageBuilder,
    });

    this.globalData.kpay = kpay;
    kpay.init();

    // 4. (Optional) Your manual debug listener.
    // You can keep this to watch the logs, but kpay.init() above is already
    // doing the heavy lifting to show the KPay screen!
    messageBuilder.on('call', (fullPayload) => {
      try {
        const msg = messageBuilder.buf2Json(fullPayload.payload);
        console.log('DEVICE: call from app-side:', JSON.stringify(msg));

        if (msg?.method === 'KPAY_STATUS') {
          this.globalData.kpayStatus = msg.data;
          console.log('DEVICE: KPAY_STATUS:', JSON.stringify(msg.data));
        }
      } catch (e) {
        console.log('DEVICE: call parse error:', String(e?.message || e));
      }
    });
  },

  onDestroy() {
    console.log('app on destroy invoke');
    this.globalData.messageBuilder &&
      this.globalData.messageBuilder.disConnect();
  },
});
