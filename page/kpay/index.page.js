// page/kpay/index.page.js
import { log } from '@zos/utils';
import * as ui from '@zos/ui';
import { back } from '@zos/router';
import { getDeviceInfo } from '@zos/device';

const logger = log.getLogger('kpay-page');

Page({
  onInit() {
    const app = getApp();
    this.kpay = app.globalData?.kpay;
    this.kpayStarted = false;

    if (this.kpay && app.globalData.kpayNeeded) {
      this.kpay.pageInit();
      this.kpayStarted = true;
    }
  },

  build() {
    ui.setStatusBarVisible(false);
    const app = getApp();

    if (!app.globalData.kpayNeeded) {
      logger.debug('KPay flag false. Bouncing.');
      back();
      return;
    }

    if (this.kpay) {
      this.kpay.pageBuild();
    }

    const { width: screenWidth, height: screenHeight } = getDeviceInfo();
    const btnW = 200;
    const btnH = 60;

    ui.createWidget(ui.widget.BUTTON, {
      x: (screenWidth - btnW) / 2,
      y: screenHeight - btnH - 15,
      w: btnW,
      h: btnH,
      radius: 30,
      text: 'CANCEL',
      color: 0xffffff,
      text_size: 28,
      normal_color: 0xaa0000,
      press_color: 0xcc0000,
      click_func: () => {
        logger.debug('User cancelled purchase.');
        app.globalData.kpayNeeded = false;

        if (app.globalData.messageBuilder) {
          app.globalData.messageBuilder.call({
            method: 'KPAY_CANCEL_PURCHASE',
          });
        }
        back();
      },
    });
  },

  onDestroy() {
    if (this.kpay && this.kpayStarted) {
      this.kpay.pageDestroy();
    }
  },
});
