import React from 'react';
import ReactDOM from 'react-dom';
// import { browser } from 'webextension-polyfill-ts'; // Not strictly needed for basic render

import Editor from './Editor'; // Assuming Editor.tsx is the main component

// // Placeholder: Apply theme based on settings - similar to Options/index.tsx
// const applyTheme = async () => {
//   try {
//     const settings = await browser.storage.sync.get({ theme: 'system' });
//     if (settings.theme === 'dark') {
//       document.body.classList.add('dark-theme');
//     } else if (settings.theme === 'light') {
//       document.body.classList.remove('dark-theme');
//     } else { // System preference
//       if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//         document.body.classList.add('dark-theme');
//       }
//     }
//   } catch (error) {
//     console.error("LottiX Grabber: Error applying theme to editor", error);
//   }
// };
// applyTheme(); // Call this to apply theme on load

const rootElement = document.getElementById('editor-root');
if (rootElement) {
  ReactDOM.render(
    <React.StrictMode>
      <Editor />
    </React.StrictMode>,
    rootElement
  );
} else {
  console.error('Editor root element not found. Cannot mount React app.');
}
