// page/round/home/menu.page.js

// 1. IMPORTING NECESSARY MODULES
import * as ui from '@zos/ui'; // For drawing text and buttons
import { back, replace } from '@zos/router'; // For navigation (back goes back 1 page, replace destroys current page and loads a new one)
import { localStorage } from '@zos/storage'; // For deleting the save file if the user quits
import { getDeviceInfo } from '@zos/device'; // For getting screen width/shape

Page({
  // 2. INITIALIZATION
  // Runs once when the page is opened.
  onInit() {
    // In this simple template, we don't necessarily need to load complex state
    // data here, but this is where you would do it if your menu needed to know
    // the current score, player name, etc.
  },

  // 3. MAIN BUILD FUNCTION
  build() {
    ui.setStatusBarVisible(false); // Hide the OS top bar (battery, time)

    const { width: screenWidth, screenShape } = getDeviceInfo();

    // 🌟 DYNAMIC VERTICAL PADDING
    // If the watch is round (1), we start drawing further down (50px) so the top
    // text doesn't get cut off by the curve. If square, start higher (20px).
    let currentY = screenShape === 1 ? 50 : 20;

    // --- 1. TITLE TEXT ---
    ui.createWidget(ui.widget.TEXT, {
      x: 0,
      y: currentY,
      w: screenWidth,
      h: 50,
      text: 'Menu', // Changed from "Scorecard"
      color: 0x0078d7, // Nice blue color
      text_size: 36,
      align_h: ui.align.CENTER_H, // Center the text horizontally
    });

    currentY += 80; // Move our "typewriter" down 80 pixels

    // --- 2. PLACEHOLDER TEXT ---
    // This is where you might put settings toggles, volume controls, or stats in the future
    ui.createWidget(ui.widget.TEXT, {
      x: 20,
      y: currentY,
      w: screenWidth - 40,
      h: 100,
      text: 'Add your app settings or pause menu options here.',
      color: 0xaaaaaa, // Grey text
      text_size: 28,
      align_h: ui.align.CENTER_H,
      text_style: ui.text_style.WRAP, // Wraps to the next line if it's too long
    });

    // --- 3. BOTTOM BUTTONS (BACK & QUIT) ---
    // We want these pinned near the bottom.
    // We use Math.max to ensure they are pushed down far enough, but not *too* far on square screens.
    const buttonY = Math.max(screenShape === 1 ? 340 : 280, currentY + 120);

    // Math to dynamically size and center two buttons side-by-side
    const btnGap = 20; // 20px gap between the two buttons
    // The button width shrinks slightly if on a very narrow watch screen
    const btnW = Math.min(160, (screenWidth - 60) / 2);
    const btnsStartX = (screenWidth - (btnW * 2 + btnGap)) / 2; // Exact X coordinate to start drawing the first button

    // --- BACK BUTTON ---
    ui.createWidget(ui.widget.BUTTON, {
      x: btnsStartX, // Start at the calculated X coordinate
      y: buttonY,
      w: btnW,
      h: 60,
      text: 'BACK',
      color: 0xffffff,
      text_size: 28,
      radius: 30, // Rounded pill shape
      normal_color: 0x333333, // Dark grey
      press_color: 0x555555, // Lighter grey on press
      click_func: () => {
        back(); // Built-in router function that goes back to the previous screen (game.page)
      },
    });

    // --- QUIT BUTTON ---
    ui.createWidget(ui.widget.BUTTON, {
      x: btnsStartX + btnW + btnGap, // Draw this one to the right of the Back button
      y: buttonY,
      w: btnW,
      h: 60,
      text: 'QUIT',
      color: 0xffffff,
      text_size: 28,
      radius: 30,
      normal_color: 0xaa0000, // Dark red
      press_color: 0xcc0000, // Bright red on press
      click_func: () => {
        // 1. Delete the local save file so the app doesn't try to "resume" next time
        localStorage.removeItem('app_save'); // Note: Make sure this matches the filename we used in index.page.js!

        // 2. Destroy this menu page and load the index setup screen
        replace({ url: 'page/round/home/index.page' });
      },
    });

    // Bottom spacer (just in case you add elements that push the layout down and make it scrollable later)
    ui.createWidget(ui.widget.TEXT, {
      x: 0,
      y: buttonY + 80,
      w: screenWidth,
      h: 60,
      text: ' ',
    });
  },
});
