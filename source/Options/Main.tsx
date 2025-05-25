import React, { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';
import './styles.scss'; // Ensure this path is correct

// Define a type for our settings for better type safety
interface LottiXSettings {
  defaultLottieSize: number;
  previewMode: string; // 'all', 'lottie', 'json'
  autoplay: boolean;
  downloadSizeMode: 'original' | 'custom';
  customDownloadWidth?: number;
  customDownloadHeight?: number; // Primarily for reference if maintaining aspect ratio by width
  defaultLayout: 'grid' | 'list';
  gridRows: number;
  expandOnClick: boolean;
  enableBasicEditor: boolean; // Renamed from enableEditor for clarity
}

const Main: React.FC = () => {
  // Default values for settings
  const defaultSettings: LottiXSettings = {
    defaultLottieSize: 100, // Matched popup's original fixed size
    previewMode: 'all',
    autoplay: true,
    downloadSizeMode: 'original',
    customDownloadWidth: 300, // Default custom width
    customDownloadHeight: 300, // Default custom height (aspect ratio usually preserved from width)
    defaultLayout: 'grid',
    gridRows: 6,
    expandOnClick: false, // Changed default to hover to match previous subtask
    enableBasicEditor: true, // Default to true
  };

  // States for settings
  const [defaultLottieSize, setDefaultLottieSize] = useState<number>(defaultSettings.defaultLottieSize);
  const [previewMode, setPreviewMode] = useState<string>(defaultSettings.previewMode);
  const [autoplay, setAutoplay] = useState<boolean>(defaultSettings.autoplay);
  const [downloadSizeMode, setDownloadSizeMode] = useState<'original' | 'custom'>(defaultSettings.downloadSizeMode);
  const [customDownloadWidth, setCustomDownloadWidth] = useState<number | undefined>(defaultSettings.customDownloadWidth);
  const [customDownloadHeight, setCustomDownloadHeight] = useState<number | undefined>(defaultSettings.customDownloadHeight);
  const [defaultLayout, setDefaultLayout] = useState<'grid' | 'list'>(defaultSettings.defaultLayout);
  const [gridRows, setGridRows] = useState<number>(defaultSettings.gridRows);
  const [expandOnClick, setExpandOnClick] = useState<boolean>(defaultSettings.expandOnClick);
  const [enableBasicEditor, setEnableBasicEditor] = useState<boolean>(defaultSettings.enableBasicEditor);
  
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Fetch all settings using defaultSettings as fallback for any missing keys
        const storedSettings = await browser.storage.local.get(defaultSettings) as LottiXSettings;
        
        setDefaultLottieSize(storedSettings.defaultLottieSize);
        setPreviewMode(storedSettings.previewMode);
        setAutoplay(storedSettings.autoplay);
        setDownloadSizeMode(storedSettings.downloadSizeMode);
        setCustomDownloadWidth(storedSettings.customDownloadWidth);
        setCustomDownloadHeight(storedSettings.customDownloadHeight);
        setDefaultLayout(storedSettings.defaultLayout);
        setGridRows(storedSettings.gridRows);
        setExpandOnClick(storedSettings.expandOnClick);
        setEnableBasicEditor(storedSettings.enableBasicEditor);
      } catch (error) {
        console.error("LottiX Grabber: Error loading settings", error);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    const currentSettings: LottiXSettings = {
      defaultLottieSize,
      previewMode,
      autoplay,
      downloadSizeMode,
      customDownloadWidth: downloadSizeMode === 'custom' ? customDownloadWidth : undefined,
      customDownloadHeight: downloadSizeMode === 'custom' ? customDownloadHeight : undefined,
      defaultLayout,
      gridRows,
      expandOnClick,
      enableBasicEditor,
    };
    try {
      await browser.storage.local.set(currentSettings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("LottiX Grabber: Error saving settings", error);
      setSaveStatus('Failed to save settings.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="options-container">
      <h1>LottiX Grabber Settings</h1>

      <div className="option-group">
        <h2>Preview Settings</h2>
        <div className="option">
          <label htmlFor="defaultLottieSize">Default Lottie Preview Size (px in Popup):</label>
          <input
            type="number"
            id="defaultLottieSize"
            value={defaultLottieSize}
            onChange={(e) => setDefaultLottieSize(Math.max(30, parseInt(e.target.value, 10)))} // Min size 30
            min="30" // Smallest practical preview
            max="300" // Largest practical preview
          />
        </div>
        <div className="option">
          <label htmlFor="previewMode">Filter Animations in Popup:</label>
          <select id="previewMode" value={previewMode} onChange={(e) => setPreviewMode(e.target.value)}>
            <option value="all">All (Lottie & JSON)</option>
            <option value="lottie">Show .lottie only</option>
            <option value="json">Show .json only</option>
          </select>
        </div>
        <div className="option">
          <label>
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
            />
            Autoplay animations in Popup previews
          </label>
        </div>
        <div className="option">
          <label htmlFor="defaultLayout">Default Popup Layout:</label>
          <select id="defaultLayout" value={defaultLayout} onChange={(e) => setDefaultLayout(e.target.value as ('grid' | 'list'))}>
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
        </div>
        <div className="option">
          <label htmlFor="gridRows">Number of Rows for Grid View (Popup):</label>
          <input
            type="number"
            id="gridRows"
            value={gridRows}
            onChange={(e) => setGridRows(Math.max(1, parseInt(e.target.value, 10)))}
            disabled={defaultLayout !== 'grid'}
            min="1"
            max="10"
          />
        </div>
        <div className="option">
          <label>
            <input
              type="checkbox"
              checked={expandOnClick}
              onChange={(e) => setExpandOnClick(e.target.checked)}
            />
            Expand animation details on click (else on hover)
          </label>
        </div>
      </div>

      <div className="option-group">
        <h2>Download Settings (for JSON Bodymovin files)</h2>
        <div className="option">
          <label htmlFor="downloadSizeMode">Preferred Download File Size:</label>
          <select 
            id="downloadSizeMode" 
            value={downloadSizeMode} 
            onChange={(e) => setDownloadSizeMode(e.target.value as ('original' | 'custom'))}
          >
            <option value="original">Original Size</option>
            <option value="custom">Custom Width (maintains aspect ratio)</option>
          </select>
        </div>
        {downloadSizeMode === 'custom' && (
          <>
            <div className="option">
              <label htmlFor="customDownloadWidth">Custom Width (px):</label>
              <input
                type="number"
                id="customDownloadWidth"
                value={customDownloadWidth || 300}
                onChange={(e) => setCustomDownloadWidth(Math.max(10, parseInt(e.target.value, 10)))}
                min="10"
              />
            </div>
            {/* <div className="option"> // Height is usually calculated by aspect ratio
              <label htmlFor="customDownloadHeight">Max Height (px, optional):</label>
              <input
                type="number"
                id="customDownloadHeight"
                value={customDownloadHeight || 300}
                onChange={(e) => setCustomDownloadHeight(Math.max(10, parseInt(e.target.value, 10)))}
                min="10"
              />
            </div> */}
          </>
        )}
      </div>

      <div className="option-group">
        <h2>Editor Integration (Popup Button)</h2>
        <div className="option">
          <label>
            <input
              type="checkbox"
              checked={enableBasicEditor}
              onChange={(e) => setEnableBasicEditor(e.target.checked)}
            />
            Enable "Edit Lottie" button (integrates with LottieFiles editor)
          </label>
        </div>
      </div>

      <button className="save-button" onClick={handleSaveSettings}>
        Save Settings
      </button>
      {saveStatus && <p className="save-status">{saveStatus}</p>}
      
      <div className="about-section">
        <h3>About LottiX Grabber</h3>
        <p>Plugin designed & developed by Neel Litoriya.</p>
        {/* You can add links or more info here if needed */}
      </div>
    </div>
  );
};

export default Main;
