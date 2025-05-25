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

## Development

Ensure you have

- [Node.js](https://nodejs.org) 10 or later installed
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Then run the following:

- `yarn install` to install dependencies.
- `yarn run dev:chrome` to start the development server for chrome extension
- `yarn run dev:firefox` to start the development server for firefox addon
- `yarn run dev:opera` to start the development server for opera extension
- `yarn run build:chrome` to build chrome extension
- `yarn run build:firefox` to build firefox addon
- `yarn run build:opera` to build opera extension
- `yarn run build` builds and packs extensions all at once to extension/ directory

### Steps

- `yarn install` to install dependencies.
- To watch file changes in developement

  - Chrome
    - `yarn run dev:chrome`
  - Firefox
    - `yarn run dev:firefox`
  - Opera
    - `yarn run dev:opera`

- **Load extension in browser**

- ### Chrome

  - Go to the browser address bar and type `chrome://extensions`
  - Check the `Developer Mode` button to enable it.
  - Click on the `Load Unpacked Extension…` button.
  - Select your extension’s extracted directory.

- ### Firefox

  - Load the Add-on via `about:debugging` as temporary Add-on.
  - Choose the `manifest.json` file in the extracted directory

- ### Opera

  - Load the extension via `opera:extensions`
  - Check the `Developer Mode` and load as unpacked from extension’s extracted directory.

### Production

- `yarn run build` builds the extension for all the browsers to `extension/BROWSER` directory respectively.

## License

MIT © [Jawish Hameed](http://jawish.org)
