// page/round/home/index.page.js

// 1. IMPORTING NECESSARY MODULES
// These are built-in Zepp OS libraries needed to make the app work.
import * as ui from '@zos/ui'; // Used for creating text, buttons, and UI elements
import { push } from '@zos/router'; // Used for navigating between pages
import { log } from '@zos/utils'; // Used for logging messages to the console for debugging
import { localStorage } from '@zos/storage'; // Used to save data on the watch so it persists after closing
import { getDeviceInfo } from '@zos/device'; // Used to get screen width and shape

// Set up a logger to help us track bugs in the Zepp simulator console
const logger = log.getLogger('setup-page');

Page({
  // 2. STATE MANAGEMENT
  // Think of 'state' as the memory of this specific page.
  // When these values change, we usually rebuild the screen to show the updates.
  state: {
    selectedMode: 1, // 1 = FREE mode, 2 = PAID mode
    setupWidgets: [], // This array holds all our screen elements so we can delete them when refreshing the screen
  },

  // Runs once when the page is first loaded
  onInit() {
    logger.debug('Setup page initialized');
  },

  // 3. HELPER FUNCTION TO CREATE WIDGETS
  // This is a custom shortcut function. It creates an element (text, button),
  // adds it to our tracker array, and returns it.
  _addBtn(type, props) {
    const w = ui.createWidget(type, props);
    this.state.setupWidgets.push(w);
    return w;
  },

  // 4. MAIN BUILD FUNCTION
  // This draws the screen. We call this whenever we need to update what the user sees.
  build() {
    ui.setStatusBarVisible(false); // Hides the watch's top status bar (time, battery) for a full-screen app

    // Clear the screen of old elements before drawing new ones
    this.state.setupWidgets.forEach((w) => ui.deleteWidget(w));
    this.state.setupWidgets = [];

    // Check if the user has a saved game/session in the watch's local storage
    const savedString = localStorage.getItem('app_save');

    if (savedString) {
      // If a save exists, show the resume screen
      this.buildResumeScreen(savedString);
    } else {
      // If no save exists, show the main setup screen
      this.buildSetupScreen();
    }
  },

  // 5. RESUME SCREEN
  // Drawn if there is an active session saved in memory
  buildResumeScreen(savedString) {
    const { width: screenWidth } = getDeviceInfo();

    // "App in Progress" Title
    this._addBtn(ui.widget.TEXT, {
      x: 0,
      y: 80,
      w: screenWidth,
      h: 50,
      text: 'Session in Progress!',
      color: 0xffd700, // Gold color
      text_size: 36,
      align_h: ui.align.CENTER_H,
    });

    // RESUME Button
    const resumeBtnW = Math.min(320, screenWidth - 40);
    this._addBtn(ui.widget.BUTTON, {
      x: (screenWidth - resumeBtnW) / 2, // Centers the button horizontally
      y: 210,
      w: resumeBtnW,
      h: 60,
      radius: 30, // Rounds the corners
      text: 'RESUME',
      text_size: 40,
      color: 0xffffff,
      normal_color: 0x00aa00, // Green button
      click_func: () => {
        try {
          // Load the saved state into the app's global data memory
          const savedState = JSON.parse(savedString);
          const gd = getApp()._options.globalData;
          gd.mode = savedState.mode;

          // Navigate to the main app/game page
          push({ url: 'page/round/home/game.page' });
        } catch (e) {
          // If the save file is broken, delete it and rebuild the setup screen
          logger.error('Corrupt save file');
          localStorage.removeItem('app_save');
          this.build();
        }
      },
    });

    // START OVER Button
    const startOverBtnW = 200;
    this._addBtn(ui.widget.BUTTON, {
      x: (screenWidth - startOverBtnW) / 2,
      y: 340,
      w: startOverBtnW,
      h: 60,
      radius: 24,
      text: 'START OVER',
      text_size: 28,
      color: 0xffffff,
      normal_color: 0xaa0000, // Red button
      click_func: () => {
        // Delete the save file and redraw the screen to show the Setup menu
        localStorage.removeItem('app_save');
        this.build();
      },
    });
  },

  // 6. SETUP SCREEN
  // The main menu where users pick Free/Paid and start the app
  buildSetupScreen() {
    const app = getApp();
    const kpay = app.globalData?.kpay; // Connects to KPay monetization if you use it
    const { width: screenWidth, screenShape } = getDeviceInfo();

    // Adjust starting Y coordinate based on if the watch is round (1) or square
    let currentY = screenShape === 1 ? 60 : 25;

    // Main App Title
    this._addBtn(ui.widget.TEXT, {
      x: 0,
      y: currentY,
      w: screenWidth,
      h: 40,
      text: 'My Cool New App', // Replaced "Game Setup"
      color: 0xffffff,
      text_size: 28,
      align_h: ui.align.CENTER_H,
    });

    currentY += 80;

    // "Select Version" Label
    this._addBtn(ui.widget.TEXT, {
      x: 0,
      y: currentY,
      w: screenWidth,
      h: 30,
      text: 'Select Version',
      color: 0xaaaaaa,
      text_size: 24,
      align_h: ui.align.CENTER_H,
    });

    currentY += 50;

    // MATH FOR CENTERING THE 3 BUTTONS (FREE, PAID, HELP)
    const btnGap = 15;
    const mainBtnWidth = 120;
    const helpBtnWidth = 60;
    const totalRowWidth = mainBtnWidth * 2 + helpBtnWidth + btnGap * 2;
    const startX = (screenWidth - totalRowWidth) / 2;

    // FREE BUTTON
    this._addBtn(ui.widget.BUTTON, {
      x: startX,
      y: currentY,
      w: mainBtnWidth,
      h: 55,
      radius: 10,
      text: 'FREE',
      text_size: 28,
      color: this.state.selectedMode === 1 ? 0xffffff : 0xaaaaaa,
      normal_color: this.state.selectedMode === 1 ? 0x0078d7 : 0x333333, // Turns blue if selected
      press_color: 0x555555,
      click_func: () => {
        // Update state and refresh screen to show this is selected
        this.state.selectedMode = 1;
        this.build();
      },
    });

    // PAID BUTTON
    this._addBtn(ui.widget.BUTTON, {
      x: startX + mainBtnWidth + btnGap,
      y: currentY,
      w: mainBtnWidth,
      h: 55,
      radius: 10,
      text: 'PAID',
      text_size: 28,
      color: this.state.selectedMode === 2 ? 0xffffff : 0xffd700, // Gold text for premium
      normal_color: this.state.selectedMode === 2 ? 0x0078d7 : 0x333333, // Turns blue if selected
      press_color: 0x555555,
      click_func: () => {
        try {
          // Check for local "Paid" sticker
          const isUnlocked =
            localStorage.getItem('is_premium_unlocked') === 'true';

          // Logic: User has local sticker OR KPay library sees a license
          if (isUnlocked || (kpay && kpay.isLicensed())) {
            // Stamp local sticker if it's missing but KPay says they paid
            if (!isUnlocked) {
              localStorage.setItem('is_premium_unlocked', 'true');
            }

            if (app.globalData) app.globalData.kpayNeeded = false;
            this.state.selectedMode = 2; // Set mode to PAID
            this.build(); // Refresh screen

            // Trigger KPay purchase popup if they haven't paid
          } else if (kpay) {
            if (app.globalData) app.globalData.kpayNeeded = true;
            kpay.startPurchase();
          } else {
            // Fallback for testing in simulator without KPay enabled
            this.state.selectedMode = 2;
            this.build();
          }
        } catch (e) {
          logger.error(`Mode Selection Error: ${e}`);
        }
      },
    });

    // HELP BUTTON (?)
    this._addBtn(ui.widget.BUTTON, {
      x: startX + mainBtnWidth * 2 + btnGap * 2,
      y: currentY,
      w: helpBtnWidth,
      h: 55,
      radius: 30,
      text: '?',
      text_size: 32,
      color: 0xffffff,
      normal_color: 0x555555,
      press_color: 0xaaaaaa,
      click_func: () => {
        // Navigates to your help page
        push({ url: 'page/round/home/help.page' });
      },
    });

    currentY += 120; // Skip down the page since names are removed

    // START APP BUTTON
    const startBtnW = 200;
    this._addBtn(ui.widget.BUTTON, {
      x: (screenWidth - startBtnW) / 2,
      y: currentY,
      w: startBtnW,
      h: 60,
      radius: 30,
      text: 'START',
      text_size: 32,
      color: 0xffffff,
      normal_color: 0x00aa00,
      press_color: 0x00cc00,
      click_func: () => {
        // Ensure globalData object exists
        const appInfo = getApp();
        if (!appInfo._options.globalData) appInfo._options.globalData = {};
        const gd = appInfo._options.globalData;

        // Save our basic app data
        gd.mode = this.state.selectedMode;

        // Save session locally so the user can resume if the app closes
        localStorage.setItem(
          'app_save',
          JSON.stringify({
            mode: gd.mode,
            isFinished: false,
          }),
        );

        // Go to the main app page!
        push({ url: 'page/round/home/game.page' });
      },
    });
  },
});
