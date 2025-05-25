<h1 align="center">LottiX Grabber</h1>
<h3 align="center">Discover, inspect, modify, and download Lottie and Bodymovin animations from any webpage.</h3>
<div align="center">
  <!-- Note: Update badges if their URLs/content change due to project name or repo changes -->
  <a href="https://david-dm.org/jawish/webextension-lottie-grabber">
    <img src="https://img.shields.io/david/jawish/webextension-lottie-grabber.svg?colorB=orange" alt="DEPENDENCIES" />
  </a>
  <a href="https://github.com/jawish/webextension-lottie-grabber/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/jawish/webextension-lottie-grabber.svg" alt="LICENSE" />
  </a>
</div>
<hr />

![Screenshot](resources/screenshot1.png?raw=true)
<p align="center"><em>Note: The screenshot above is from a previous version and does not reflect the latest UI and features.</em></p>

## Features

LottiX Grabber offers a comprehensive suite of tools for web-sourced Lottie animations:

**Modern User Interface:**
- **Dark Theme**: A sleek, modern dark UI for comfortable viewing, with theme options synced with system preferences or user choice.
- **Flexible Layouts**:
    - **Grid View**: Displays animations in a compact grid with horizontal scrolling, ideal for quickly browsing many files.
    - **List View**: A toggleable vertical list view for more detailed inline information.

**Popup & Thumbnails:**
- **Enhanced Thumbnails**:
    - **Info Reveal**: Hover or click (configurable in settings) an info icon on thumbnails to reveal key metadata.
    - **Metadata Display**: Cleanly presents essential data: Lottie Version, Resolution (Width x Height), Frame Rate, Total Frames, and Layer Count.
    - **Format Tag**: Clearly tags animations as ".lottie" or ".json" format.
- **Multi-Select**: Select multiple animations in the popup for batch operations.

**Downloading Features:**
- **Download Selected**: Download all selected animations with a single click.
- **Custom Download Size (for JSON)**: For Bodymovin JSON files, choose to download in their original size or specify custom dimensions (width/height) for resized exports. Aspect ratio is maintained.
- **Post-Download Cue**: Visual feedback (e.g., "Downloaded ✓" status) on buttons after a successful download.

**Comprehensive Settings Panel:**
- **Default Preview Size**: Set the default size for Lottie animation previews in the popup.
- **Preview Mode Filter**: Filter displayed animations by format: ".lottie" only, ".json" only, or All.
- **Autoplay Toggle**: Enable or disable autoplay for animations in the preview.
- **Download Size Options**: Configure preferred download sizes (original or custom dimensions for JSON).
- **Default Preview Layout**: Set the default view (Grid or List) for the popup.
- **Grid View Rows**: Customize the number of rows displayed in the grid view.
- **Expand-on-Click**: Choose whether thumbnail details are revealed on hover or click.
- **Editor Toggle**: Enable/disable the "Edit Lottie" button integration.

**Basic Lottie Editor:**
- **Load Local Files**: Open and preview `.json` (Bodymovin) or `.lottie` files from your computer.
- **JSON Editing Capabilities**: For `.json` files:
    - **Layer List**: View all layers in the animation with their names and types.
    - **Toggle Layer Visibility**: Show or hide individual layers.
    - **Delete Layers**: Remove layers from the animation.
    - **Basic Color Editing**: Modify solid fill or stroke colors for shapes within shape layers using a color picker.
    - **Preview Changes**: Instantly see your edits in the integrated player.
    - **Download Modified JSON**: Save your edited Lottie animation as a new `.json` file.
- **Playback for `.lottie`**: While direct editing of `.lottie` files is not supported (due to their archive nature), they can be loaded for playback in the editor.

## Browser Support

| [![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](/) | [![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](/) | [![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)](/) | [![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](/) | [![Yandex](https://raw.github.com/alrra/browser-logos/master/src/yandex/yandex_48x48.png)](/) | [![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png)](/) | [![vivaldi](https://raw.github.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png)](/) |
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 49 & later ✔ | 52 & later ✔ | 36 & later ✔ | 79 & later ✔ | Latest ✔ | Latest ✔ | Latest ✔

## Resources

The `resources/` directory contains promotional and store listing assets:
- `large_promo.png`: A larger promotional image, likely for web stores or feature graphics. (1280x800)
- `promo.png`: A standard promotional tile. (440x280)
- `screenshot1.png`: The main screenshot used in this README. **Note: This screenshot is outdated and does not reflect the current UI and features of LottiX Grabber.**

## Documentation

- [jawish/webextension-lottie-grabber](https://github.com/jawish/webextension-lottie-grabber) (Note: Link might need updating if repo name/URL changes)

## Build and Installation

**Prerequisites:**
- [Node.js](https://nodejs.org) (version 10 or later) installed.
- [Yarn](https://yarnpkg.com) (v1 or v2) installed.

**Build Steps:**
1. Open your terminal and navigate to the root directory of the LottiX Grabber extension.
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Build the extension:
   - For a specific browser (e.g., Chrome):
     ```bash
     yarn run build:chrome
     ```
   - To build for Firefox:
     ```bash
     yarn run build:firefox
     ```
   - To build for Opera:
     ```bash
     yarn run build:opera
     ```
   - Alternatively, to build for all supported browsers at once (output usually in `extension/` directory, specifically `extension/<browser_name>`):
     ```bash
     yarn run build
     ```
   (Note: The `dev` scripts like `yarn run dev:chrome`, `yarn run dev:firefox`, and `yarn run dev:opera` are for starting a development server with auto-reloading, useful during active development.)

**Installation (Loading Unpacked Extension):**

After building, you will find the extension files in a distribution directory (commonly `extension/<browser_name>`, e.g., `extension/chrome`).

**Google Chrome:**
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode" (toggle switch, usually in the top-right corner).
3. Click the "Load unpacked" button.
4. Select the directory containing the built extension for Chrome (e.g., `extension/chrome`).

**Mozilla Firefox:**
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click the "Load Temporary Add-on..." button.
3. Navigate to the build directory for Firefox (e.g., `extension/firefox`) and select the `manifest.json` file.

**Opera:**
1. Open Opera and navigate to `opera://extensions`.
2. Enable "Developer mode".
3. Click the "Load unpacked" button.
4. Select the directory containing the built extension for Opera (e.g., `extension/opera`).

**Troubleshooting Build Issues:**

Some common issues you might encounter during the build process:

-   **`node-sass` build failures (especially on Windows):**
    The `node-sass` package sometimes requires C++ build tools to compile. If you see errors related to `node-sass` during `yarn install` or the build process:
    -   Ensure you have Visual Studio Build Tools installed. You can download them from the [Visual Studio website](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
    -   During installation, select the "Desktop development with C++" workload. Make sure the Windows SDK is included.

-   **Node.js Version Compatibility:**
    -   This project is generally tested with Node.js LTS (Long-Term Support) versions. As of recent updates, Node.js >=18.0.0 is recommended or required (check `package.json` for the `engines` field if specified).
    -   If you are using a very new or very old version of Node.js, you might encounter compatibility issues with dependencies.
    -   Consider using a Node Version Manager (like [nvm](https://github.com/nvm-sh/nvm) for Linux/macOS or [nvm-windows](https://github.com/coreybutler/nvm-windows) for Windows) to easily switch between Node.js versions. For example, to install and use Node.js v18:
        ```bash
        nvm install 18
        nvm use 18
        ```
    -   After switching Node.js versions (especially if you switch to a new major version), it's a good practice to delete your `node_modules` folder and `yarn.lock` file, then run `yarn install` again.

## License

MIT © [Jawish Hameed](http://jawish.org)
