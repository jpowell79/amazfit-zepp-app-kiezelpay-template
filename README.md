# Amazfit Zepp App Template + KPay Integration ⌚💰

Welcome to the ultimate starter template for building Amazfit smartwatch apps using Zepp OS! This repository is designed specifically for developers who want to hit the ground running with a pre-built app structure and **built-in KiezelPay (KPay) monetization**.

Whether you are a complete beginner to Zepp OS or just want to save time on your next project, this template has all the heavy lifting done for you. The code has been stripped of complex app-specific logic and is **heavily commented** line-by-line to explain exactly *what* is happening and *why*.

## ✨ Key Features

* **Pre-Built 4-Page Architecture:** Includes `index` (Setup/Launch), `game` (Main App Area), `menu` (Settings/Options), and `help` (Status & Support).
* **Instant Monetization:** Integrated KPay logic to handle "Free" vs "Paid" application modes, complete with local sticker saving so users don't have to re-verify constantly.
* **Save & Resume:** Automatically saves app state to the watch's local storage so users can close the app and pick up right where they left off.
* **Responsive Layouts:** Dynamic coordinate math ensures the UI looks great and doesn't clip on both round and square watch faces.
* **Beginner-Friendly:** Clean slate code tailored for novice coders learning the `@zos` environment.

## 📁 Project Structure

* `/page/round/home/` - Contains the core UI views (`index.page.js`, `game.page.js`, `menu.page.js`, `help.page.js`).
* `app.js` - Global application data and KPay initialization.
* `/assets/` - Where you drop your images and icons.
* `/app-side/` - For companion phone-side scripts (if needed).

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/jpowell79/amazfit-zepp-app-kiezelpay-template.git](https://github.com/jpowell79/amazfit-zepp-app-kiezelpay-template.git)
   

## 📖 Full Step-by-Step Guide

Need more help setting up your environment or understanding how the monetization works? I wrote a guide on Medium explaining exactly how to create Amazfit apps and integrate KiezelPay from scratch. 

👉 **[Read the full tutorial on Medium here!](https://waxlyrical.medium.com/creating-amazfit-apps-for-the-zepp-app-store-with-kiezelpay-d4eebf4a08ce)**


## ☕ Support This Project

If this template saved you time, headaches, or helped you launch your first Zepp OS app, consider buying me a coffee! 

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/waxlyrical)
