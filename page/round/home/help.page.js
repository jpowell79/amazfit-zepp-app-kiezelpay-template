// page/round/home/help.page.js

// 1. IMPORTING NECESSARY MODULES
import * as ui from '@zos/ui'; // For creating visual elements (text, buttons, rectangles)
import { back } from '@zos/router'; // Used to go back to the previous page
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from '@zos/device'; // For screen size and shape
import { px } from '@zos/utils'; // VERY IMPORTANT: Scales pixels so the app looks right on big and small watches
import { connectStatus } from '@zos/ble'; // Checks if the watch is connected to the phone via Bluetooth
import { localStorage } from '@zos/storage'; // Access saved data (like our premium unlocked sticker)

Page({
  // 2. STATE MANAGEMENT
  // Instead of redrawing the whole page when something changes, we are going to save
  // the exact "widgets" (the text on the screen) into this state.
  // This allows us to target them directly and change their text/color later.
  state: {
    statusWidget: null, // Will hold the Bluetooth text
    licenseWidget: null, // Will hold the Premium/Free text
  },

  // 3. HELPER FUNCTION TO UPDATE TEXT DYNAMICALLY
  // We call this function whenever the user clicks the "Check Bluetooth" or "Restore" buttons.
  updateStatus() {
    // --- Update Bluetooth Status ---
    const isConnected = connectStatus(); // Returns true if connected to phone

    // If our widget exists on the screen, update its properties
    if (this.state.statusWidget) {
      this.state.statusWidget.setProperty(
        ui.prop.TEXT,
        isConnected ? '● Bluetooth Connected' : '○ Bluetooth Disconnected',
      );
      this.state.statusWidget.setProperty(
        ui.prop.COLOR,
        isConnected ? 0x00ff00 : 0xff4444, // Green if connected, Red if disconnected
      );
    }

    // --- Update License Status ---
    // Check our local save file to see if they have the premium sticker
    const isUnlocked = localStorage.getItem('is_premium_unlocked') === 'true';

    // If the widget exists, update its text and color
    if (this.state.licenseWidget) {
      this.state.licenseWidget.setProperty(
        ui.prop.TEXT,
        isUnlocked ? '★ All Features Unlocked' : 'Free Version',
      );
      this.state.licenseWidget.setProperty(
        ui.prop.COLOR,
        isUnlocked ? 0xffd700 : 0xaaaaaa, // Gold if unlocked, Grey if free
      );
    }
  },

  // 4. MAIN BUILD FUNCTION (Draws the screen)
  build() {
    ui.setStatusBarVisible(false); // Hide the top battery/time bar

    const app = getApp();
    const kpay = app.globalData?.kpay; // Connects to the KPay monetization library

    // Get screen dimensions to center things properly
    const {
      width: screenWidth,
      height: screenHeight,
      screenShape,
    } = getDeviceInfo();
    const isRound = screenShape === SCREEN_SHAPE_ROUND;

    // 5. CREATE A SCROLLABLE CONTAINER
    // Because a help page has a lot of text, it will overflow the screen.
    // A VIEW_CONTAINER acts like a long piece of paper that the user can scroll up and down.
    const scrollContainer = ui.createWidget(ui.widget.VIEW_CONTAINER, {
      x: 0,
      y: 0,
      w: screenWidth,
      h: screenHeight,
      scroll_enable: 1, // 1 turns scrolling ON
    });

    // --- LAYOUT VARIABLES ---
    // We define standard button sizes using px() so they scale nicely on all watch models.
    const btnW = px(300);
    const btnH = px(80);
    const sidePadding = px(40);

    // currentY acts like a typewriter carriage. We start at the top, draw an element,
    // and then add numbers to currentY to move down before drawing the next element.
    let currentY = isRound ? px(80) : px(40);

    // --- 1. TITLE TEXT ---
    // Note: We are attaching this to 'scrollContainer' instead of 'ui' so it scrolls!
    scrollContainer.createWidget(ui.widget.TEXT, {
      x: 0,
      y: currentY,
      w: screenWidth,
      h: px(60),
      text: 'Help',
      color: 0xffffff,
      text_size: px(36),
      align_h: ui.align.CENTER_H,
    });

    currentY += px(80); // Move our "typewriter" down 80 pixels

    // --- 2. EXPLANATION TEXT ---
    scrollContainer.createWidget(ui.widget.TEXT, {
      x: sidePadding,
      y: currentY,
      w: screenWidth - sidePadding * 2, // Subtract padding from both sides so text doesn't hit the edges
      h: px(600), // Give it plenty of height so it doesn't get cut off
      text: 'Here we explain the difference between the free version and the paid version. In order to activate premium features your watch must be connected to your phone via Bluetooth, and your phone will require a Mobile Data or Wifi Connection. If you have already purchased the app, use the Restore button below while connected to your phone to reactivate your features.',
      color: 0xbbbbbb,
      text_size: px(28),
      text_style: ui.text_style.WRAP, // WRAP is vital so the text goes to the next line instead of running off screen
      align_h: ui.align.CENTER_H,
    });

    currentY += px(620); // Move down past that huge block of text

    // --- 3. LICENSE STATUS CARD ---
    // First, draw a dark grey rectangle to act as a background "Card"
    scrollContainer.createWidget(ui.widget.FILL_RECT, {
      x: px(30),
      y: currentY,
      w: screenWidth - px(60),
      h: px(80),
      radius: px(20), // Round the corners of the rectangle
      color: 0x222222,
    });

    // Next, draw the text ON TOP of the rectangle.
    // We save this text widget to our state so updateStatus() can find it later.
    const isUnlocked = localStorage.getItem('is_premium_unlocked') === 'true';
    this.state.licenseWidget = scrollContainer.createWidget(ui.widget.TEXT, {
      x: 0,
      y: currentY, // Same Y as the rectangle so it overlaps
      w: screenWidth,
      h: px(80),
      text: isUnlocked ? '★ All Features Unlocked' : 'Free Version',
      color: isUnlocked ? 0xffd700 : 0xaaaaaa,
      text_size: px(28),
      align_h: ui.align.CENTER_H,
      align_v: ui.align.CENTER_V, // Center it vertically inside the 80px height
    });

    currentY += px(100);

    // --- 4. RESTORE PURCHASE BUTTON ---
    scrollContainer.createWidget(ui.widget.BUTTON, {
      x: (screenWidth - btnW) / 2, // Math to center the button perfectly
      y: currentY,
      w: btnW,
      h: btnH,
      radius: px(40),
      text: 'RESTORE',
      text_size: px(30),
      color: 0xffffff,
      normal_color: 0xaa8800, // Yellowish normal state
      press_color: 0xccaa00, // Slightly brighter yellow when pressed
      click_func: () => {
        if (kpay) {
          if (kpay.isLicensed()) {
            // If KPay says they paid, give them the local sticker, update the text, and show a toast pop-up
            localStorage.setItem('is_premium_unlocked', 'true');
            this.updateStatus();
            ui.showToast({ text: 'Purchase Restored!' });
          } else {
            // If they haven't paid, trigger the phone purchase popup
            if (app.globalData) app.globalData.kpayNeeded = true;
            kpay.startPurchase();
          }
        }
      },
    });

    currentY += px(120);

    // --- 5. BLUETOOTH STATUS CARD ---
    // Another dark grey background rectangle
    scrollContainer.createWidget(ui.widget.FILL_RECT, {
      x: px(30),
      y: currentY,
      w: screenWidth - px(60),
      h: px(80),
      radius: px(20),
      color: 0x222222,
    });

    // The Bluetooth text that sits on top of the rectangle
    // Saved to state for dynamic updates
    const isConnected = connectStatus();
    this.state.statusWidget = scrollContainer.createWidget(ui.widget.TEXT, {
      x: 0,
      y: currentY,
      w: screenWidth,
      h: px(80),
      text: isConnected ? '● Bluetooth Connected' : '○ Bluetooth Disconnected',
      color: isConnected ? 0x00ff00 : 0xff4444,
      text_size: px(28),
      align_h: ui.align.CENTER_H,
      align_v: ui.align.CENTER_V,
    });

    currentY += px(100);

    // --- 6. CHECK BLUETOOTH BUTTON ---
    scrollContainer.createWidget(ui.widget.BUTTON, {
      x: (screenWidth - btnW) / 2,
      y: currentY,
      w: btnW,
      h: btnH,
      radius: px(40),
      text: 'CHECK BLUETOOTH',
      text_size: px(30),
      color: 0xffffff,
      normal_color: 0x007aff, // Blue
      press_color: 0x0055aa, // Darker Blue
      click_func: () => {
        // Run our helper function to ping the Bluetooth status and update the UI
        this.updateStatus();
        ui.showToast({ text: 'Status Updated' }); // Little message confirming it worked
      },
    });

    currentY += px(100);

    // --- 7. GO BACK BUTTON ---
    scrollContainer.createWidget(ui.widget.BUTTON, {
      x: (screenWidth - btnW) / 2,
      y: currentY,
      w: btnW,
      h: btnH,
      radius: px(40),
      text: 'GO BACK',
      text_size: px(30),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      click_func: () => {
        back(); // This router command simply returns to the previous page in history
      },
    });

    // Add extra space at the very bottom so the user can scroll slightly past the last button
    currentY += px(200);
  },
});
