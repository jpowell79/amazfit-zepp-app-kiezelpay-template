// page/round/home/index.style.js
import { getDeviceInfo } from '@zos/device';
import { px } from '@zos/utils';
import { align, text_style } from '@zos/ui';

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export const TEXT_STYLE = {
  x: px(15),
  y: px(15),
  w: DEVICE_WIDTH - px(15 * 2),
  h: DEVICE_HEIGHT - px(15 * 2),
  color: 0xffffff,
  text_size: 32,
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
