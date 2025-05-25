import React, { useState, useEffect, ChangeEvent } from 'react';
import { browser, Tabs } from 'webextension-polyfill-ts';

import './styles.scss';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface PopupProps {
  foundLotties: { [lottieUrl: string]: any };
}

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({ url });
}

function copyClipboard(url: string): void {
  navigator.clipboard.writeText(url);
}

interface LottieItemData {
  lottieUrl: string;
  bmVersion: string;
  width: number;
  height: number;
  frameRate: number;
  numFrames: number;
  numLayers: number;
  wasDotLottie: boolean;
  jsonData?: any; // Store fetched JSON data if needed for resizing
  fileName: string; // Added for easier download naming
  [key: string]: any; // For other potential properties like meta
}

interface PopupProps {
  foundLotties: LottieItemData[];
}

const Popup: React.FC<PopupProps> = ({ foundLotties }) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // expandedItemId and useClickToExpand are no longer needed for card expansion via info icon
  // const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  // const [useClickToExpand, setUseClickToExpand] = useState<boolean>(false); 
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<{ [id: string]: boolean }>({});
  
  // States for settings loaded from storage
  const [defaultPreviewSize, setDefaultPreviewSize] = useState<number>(100);
  const [filterPreviewMode, setFilterPreviewMode] = useState<string>('all'); // 'all', 'lottie', 'json'
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState<boolean>(true); // For main player
  const [gridRowCount, setGridRowCount] = useState<number>(6);
  const [isEditorButtonEnabled, setIsEditorButtonEnabled] = useState<boolean>(true);

  // Tooltip State
  interface TooltipInfo {
    x: number;
    y: number;
    lottieUrl: string;
    name: string;
  }
  const [tooltipData, setTooltipData] = useState<TooltipInfo | null>(null);

  type DownloadSizeMode = 'original' | 'custom';
  interface DownloadSettings {
    sizeMode: DownloadSizeMode;
    customWidth?: number;
    // customHeight is not directly used for scaling logic if aspect ratio is maintained by width
  }
  const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({ sizeMode: 'original' });

  useEffect(() => {
    const loadPopupSettings = async () => {
      try {
        const settings = await browser.storage.local.get({
          // Defaults from Options/Main.tsx defaultSettings
          theme: 'system',
          defaultLayout: 'grid',
          // expandOnClick: false, // No longer used for card expansion by info icon
          defaultLottieSize: 100,
          previewMode: 'all',
          autoplay: true,
          gridRows: 6,
          enableBasicEditor: true, // Key used in Options
          // Download settings
          downloadSizeMode: 'original',
          customDownloadWidth: 300, 
        });

        // Apply settings
        if (settings.theme === 'dark') setIsDarkTheme(true);
        else if (settings.theme === 'light') setIsDarkTheme(false);
        else setIsDarkTheme(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
        
        setViewMode(settings.defaultLayout as ('grid' | 'list'));
        setDefaultPreviewSize(settings.defaultLottieSize);
        setFilterPreviewMode(settings.previewMode);
        setIsAutoplayEnabled(settings.autoplay);
        setGridRowCount(settings.gridRows);
        setIsEditorButtonEnabled(settings.enableBasicEditor);
        setDownloadSettings({
          sizeMode: settings.downloadSizeMode as DownloadSizeMode,
          customWidth: settings.customDownloadWidth,
        });

      } catch (error) {
        console.error("LottiX Grabber: Error loading popup settings", error);
      }
    };
    
    const initializeDownloadedState = () => {
      if (foundLotties && foundLotties.length > 0) {
        const initialDownloaded: { [id: string]: boolean } = {};
        foundLotties.forEach((item, index) => {
          const uniqueId = getItemId(item, index);
          if (sessionStorage.getItem(uniqueId) === 'downloaded') {
            initialDownloaded[uniqueId] = true;
          }
        });
        setDownloadedItems(initialDownloaded);
      }
    };

    loadPopupSettings();
    initializeDownloadedState(); // Initialize after settings and when foundLotties is available

    // System theme change listener
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      browser.storage.local.get({ theme: 'system' }).then(s => {
        if (s.theme === 'system') setIsDarkTheme(e.matches);
      });
    };
    if (mediaQuery) {
      browser.storage.local.get({ theme: 'system' }).then(s => {
        if (s.theme === 'system') mediaQuery.addEventListener('change', handleSystemThemeChange);
      });
    }
    return () => {
      if (mediaQuery) mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleViewMode = () => setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  const openOptionsPage = () => browser.runtime.openOptionsPage();

  // Tooltip Handlers for the new Info Icon Button
  const handleInfoIconMouseEnter = (event: React.MouseEvent<HTMLButtonElement>, lottieItem: LottieItemData) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Position tooltip above the icon, centered. Adjust as needed.
    // These are relative to viewport. Tooltip needs to be fixed or use portal.
    // For simplicity, let's try to position it within the popup boundaries.
    // X: center of icon. Y: above icon.
    
    // Get popup's own bounding rect to calculate relative positions if tooltip is absolute to popup
    const popupRect = (event.currentTarget.closest('#popup') as HTMLElement)?.getBoundingClientRect();
    const popupX = popupRect ? popupRect.left : 0;
    const popupY = popupRect ? popupRect.top : 0;

    setTooltipData({
      x: rect.left + rect.width / 2 - popupX, // Adjust X to be relative to popup
      y: rect.top - popupY - 10,             // Adjust Y, 10px above the icon, relative to popup
      lottieUrl: lottieItem.lottieUrl,
      name: lottieItem.meta?.nm || lottieItem.fileName || 'Lottie Animation',
    });
  };

  const handleInfoIconMouseLeave = () => {
    setTooltipData(null);
  };

  // Card expansion logic (handleInfoInteraction, handleInfoClick, handleMouseLeaveItem) is removed
  // as the info icon now triggers a tooltip, not card expansion.

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };

  const handleDownload = async (item: LottieItemData) => {
    const uniqueId = getItemId(item, 0); // Use consistent ID generation
    try {
      const response = await fetch(item.lottieUrl);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

      let dataToDownload: string | Blob;
      let fileName = item.fileName || (item.wasDotLottie ? 'animation.lottie' : 'animation.json');
      let contentType = item.wasDotLottie ? 'application/zip' : 'application/json';

      if (!item.wasDotLottie && downloadSettings.sizeMode === 'custom' && downloadSettings.customWidth) {
        const jsonData = await response.json();
        const originalWidth = jsonData.w;
        const originalHeight = jsonData.h;
        
        if (originalWidth && originalHeight) { 
            const aspectRatio = originalHeight / originalWidth;
            jsonData.w = downloadSettings.customWidth;
            jsonData.h = Math.round(downloadSettings.customWidth * aspectRatio);
            fileName = `resized_${fileName.replace(/\.json$/, '')}_${jsonData.w}w.json`;
        }        
        dataToDownload = JSON.stringify(jsonData);
      } else {
        if (item.wasDotLottie) {
          dataToDownload = await response.blob();
        } else {
          dataToDownload = await response.text();
        }
      }
      
      const blob = new Blob([dataToDownload], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Persist to sessionStorage and update state
      sessionStorage.setItem(uniqueId, 'downloaded');
      setDownloadedItems(prev => ({ ...prev, [uniqueId]: true }));
      // The setTimeout to reset the visual cue is removed for session persistence.
      // If temporary feedback is still desired on top of sticky, it needs different handling.

    } catch (error) {
      console.error(`LottiX Grabber: Error downloading ${item.lottieUrl}`, error);
    }
  };

  const handleDownloadSelected = async () => {
    for (const itemId of selectedItems) {
      // Ensure foundLotties is an array before calling find
      const lottiesArray = Array.isArray(foundLotties) ? foundLotties : Object.values(foundLotties);
      const itemToDownload = lottiesArray.find(l => getItemId(l, 0) === itemId);
      if (itemToDownload) {
        await handleDownload(itemToDownload); 
      }
    }
    setSelectedItems([]);
  };
  
  const getItemId = (item: LottieItemData, index: number): string => {
    // Ensure a consistent and unique ID. Using lottieUrl if available, otherwise fileName.
    // Fallback to index should be rare if data is well-formed.
    return item.lottieUrl || item.fileName || `lottie-item-${index}`;
  };

  // Ensure foundLotties is treated as an array for filtering and mapping
  const lottiesArray = Array.isArray(foundLotties) ? foundLotties : Object.values(foundLotties);
  const filteredLotties = lottiesArray.filter(item => {
    if (!item || typeof item.wasDotLottie === 'undefined') return false; // Basic check for valid item structure
    if (filterPreviewMode === 'lottie') return item.wasDotLottie;
    if (filterPreviewMode === 'json') return !item.wasDotLottie;
    return true;
  });

  const gridStyles = viewMode === 'grid' ? { gridTemplateRows: `repeat(${gridRowCount}, auto)` } : {};

  return (
    <section id="popup" className={isDarkTheme ? 'dark-theme' : ''}>
      <div className="header-controls">
        {selectedItems.length > 0 && (
          <button 
            className="icon-button download-selected-btn" 
            onClick={handleDownloadSelected}
            aria-label={`Download ${selectedItems.length} Selected Lotties`}
          >
            Download Sel. ({selectedItems.length})
          </button>
        )}
        <button className="icon-button" aria-label="Toggle View" onClick={toggleViewMode}>
          {viewMode === 'grid' ? 'List' : 'Grid'}
        </button>
        <button className="icon-button" aria-label="Settings" onClick={openOptionsPage}>
          Settings
        </button>
      </div>
      <h2 className="popup-title">LottiX Grabber</h2>
      <p className="lottie-count-display">Found: {filteredLotties.length} animation(s)</p>
      <ul 
        className={viewMode === 'grid' ? 'grid-view' : 'list-view'}
        style={gridStyles}
      >
        {filteredLotties.length > 0 ? (
          filteredLotties.map((data, index) => {
            const uniqueId = getItemId(data, index);
            // isExpanded is no longer used for card expansion based on info icon
            const isSelected = selectedItems.includes(uniqueId);
            const hasBeenDownloaded = downloadedItems[uniqueId];
            const playerSizeStyle = {
              width: `${defaultPreviewSize}px`,
              height: `${defaultPreviewSize}px`,
            };

            return (
              // onMouseLeave for card-level item expansion removed
              <li 
                key={uniqueId} 
                className={`${isSelected ? 'selected-item' : ''}`} // Removed isExpanded class
              >
                <div className="selection-checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleSelectItem(uniqueId, e.target.checked)}
                    aria-label={`Select ${data.fileName || 'Lottie animation'}`}
                  />
                </div>
                <div className="thumbnail-container">
                  <div className="preview" style={playerSizeStyle}>
                    <DotLottiePlayer
                      src={data.lottieUrl}
                      background="transparent"
                      className='player'
                      loop
                      autoplay={isAutoplayEnabled}
                    />
                    <div className="lottie-tag">{data.wasDotLottie ? '.lottie' : '.json'}</div>
                    {/* Old info icon on preview is removed */}
                  </div>
                  {/* Old expanded-details div is removed */}
                </div>
              <div className="lottie-item-actions" style={ viewMode === 'grid' ? {width: `${defaultPreviewSize}px`} : {} }>
                  <button
                    className="icon-btn info-btn"
                    title="View Info"
                    onMouseEnter={(e) => handleInfoIconMouseEnter(e, data)}
                    onMouseLeave={handleInfoIconMouseLeave}
                  >
                  ℹ️
                  </button>
                <button
                  className="icon-btn copy-url-btn"
                  title="Copy Lottie URL"
                  onClick={() => copyClipboard(data.lottieUrl)}
                >
                  🔗
                </button>
                  {isEditorButtonEnabled && (
                  <button
                    className="icon-btn edit-btn"
                      title="Edit Lottie (JSON only)"
                    onClick={() => browser.tabs.create({ url: browser.runtime.getURL(`editor.html?lottieUrl=${encodeURIComponent(data.lottieUrl)}`) })}
                    >
                    ✏️
                    </button>
                  )}
                <button
                  className={`icon-btn download-btn ${hasBeenDownloaded ? 'downloaded' : ''}`}
                  title="Download Lottie"
                  onClick={() => handleDownload(data)}
                  disabled={hasBeenDownloaded}
                >
                  {hasBeenDownloaded ? '✅' : '📥'}
                </button>
                </div>
              </li>
            )
          })
        ) : (
          <div className="empty-state-container">
            <img 
              src="https://img.artora.in/images/2023/05/08/banner_Lottixe41bcda494e78e02.png" 
              alt="No Lottie animations found." 
            />
          </div>
        )}
      </ul>
      {/* The old <p className="no-lotties-found"> is now handled by the empty-state-container above */}
      
      {tooltipData && (
        <div 
          className="info-tooltip" 
          style={{ 
            left: `${tooltipData.x}px`, 
            top: `${tooltipData.y}px`,
            // transform: 'translate(-50%, -100%)' // To center above and on top of icon
          }}
        >
          <p className="tooltip-name">{tooltipData.name}</p>
          <DotLottiePlayer 
            src={tooltipData.lottieUrl} 
            autoplay 
            loop 
            className="tooltip-player" // Use class for styling player
          />
        </div>
      )}
    </section>
  );
};

export default Popup;
