// page/round/home/game.page.js

// 1. IMPORTING NECESSARY MODULES
import * as ui from '@zos/ui'; // For creating text, buttons, and visual elements
import { push } from '@zos/router'; // For navigating to other pages (like the Menu)
import { getDeviceInfo } from '@zos/device'; // For checking the screen width and shape

// Note: We removed the Vibrator and localStorage imports because this basic
// template page doesn't need to vibrate or save complex arrays anymore!

Page({
  // 2. STATE MANAGEMENT
  // Keep track of the elements on the screen, and what mode the app is in.
  state: {
    widgets: [], // Holds our on-screen elements so we can easily delete them on refresh
    appMode: 1, // We will use 1 for Free, and 2 for Paid. Defaulting to 1.
  },

  // 3. INITIALIZATION
  // This runs once exactly when the page opens.
  // It's the perfect place to grab data passed over from the index page.
  onInit() {
    const appInfo = getApp();

    // Check if globalData exists and if it has a 'mode' saved from our index page
    if (appInfo._options.globalData && appInfo._options.globalData.mode) {
      this.state.appMode = appInfo._options.globalData.mode; // Update our state to match
    }
  },

  // 4. HELPER FUNCTION TO CREATE WIDGETS
  // A shortcut that draws an element on screen and simultaneously logs it
  // into our widgets array so we can wipe the screen clean later if needed.
  _addW(type, props) {
    const w = ui.createWidget(type, props);
    this.state.widgets.push(w);
    return w;
  },

  // 5. MAIN BUILD FUNCTION
  // Called to draw the screen.
  build() {
    ui.setStatusBarVisible(false); // Hide the top battery/time bar for a full-screen app

    // Clear any existing widgets before drawing (a best practice for avoiding overlapping text)
    this.state.widgets.forEach((w) => ui.deleteWidget(w));
    this.state.widgets = [];

    // Call the function that actually draws our buttons and text
    this.buildMainScreen();
  },

  // 6. DRAW THE UI ELEMENTS
  buildMainScreen() {
    // Get the exact width of the user's watch screen, and whether it is round or square
    const { width: screenWidth, screenShape } = getDeviceInfo();

    // Push our starting Y coordinate down slightly more if the watch is round (1)
    // so our top button doesn't get clipped by the curved edge.
    let currentY = screenShape === 1 ? 50 : 20;

    // --- MENU BUTTON ---
    const btnWidth = 220;
    this._addW(ui.widget.BUTTON, {
      x: (screenWidth - btnWidth) / 2, // Math to center the button perfectly horizontally
      y: currentY,
      w: btnWidth,
      h: 55,
      radius: 27, // Rounded corners
      text: 'Menu',
      color: 0xffffff,
      text_size: 32,
      normal_color: 0x333333, // Dark grey background
      press_color: 0x555555, // Slightly lighter grey when tapped by the user
      click_func: () => {
        // When tapped, navigate to the menu page
        // (Make sure you create a menu.page.js file next!)
        push({ url: 'page/round/home/menu.page' });
      },
    });

    // Move our "typewriter" down the page past the button
    currentY += 120;

    // --- STATUS MESSAGE ---
    // Let's make the text dynamic! If state.appMode is 2, they clicked PAID on the index screen.
    const isPaid = this.state.appMode === 2;

    const messageText = isPaid
      ? 'You are now in the PAID version of the App!'
      : 'You are now in the FREE version of the App!';

    const messageColor = isPaid ? 0xffd700 : 0xaaaaaa; // Gold color for paid, grey for free

    // Draw the text onto the screen
    this._addW(ui.widget.TEXT, {
      x: 20, // 20 pixels of padding on the left
      y: currentY,
      w: screenWidth - 40, // Subtract 40 from total width (20 padding on left + 20 on right)
      h: 150, // Give it plenty of height box so the text has room to wrap
      text: messageText,
      color: messageColor,
      text_size: 32,
      align_h: ui.align.CENTER_H, // Center the text inside its invisible bounding box
      text_style: ui.text_style.WRAP, // Extremely important: Forces long text to the next line
    });
  },
});
