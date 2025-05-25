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
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [useClickToExpand, setUseClickToExpand] = useState<boolean>(false);
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<{ [id: string]: boolean }>({});
  
  // States for settings loaded from storage
  const [defaultPreviewSize, setDefaultPreviewSize] = useState<number>(100);
  const [filterPreviewMode, setFilterPreviewMode] = useState<string>('all'); // 'all', 'lottie', 'json'
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState<boolean>(true);
  const [gridRowCount, setGridRowCount] = useState<number>(6);
  const [isEditorButtonEnabled, setIsEditorButtonEnabled] = useState<boolean>(true);

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
          expandOnClick: false,
          // Settings to be integrated:
          defaultLottieSize: 100,
          previewMode: 'all',
          autoplay: true,
          gridRows: 6,
          enableBasicEditor: true, // Key used in Options
          // Download settings
          downloadSizeMode: 'original',
          customDownloadWidth: 300, // Assuming this key is saved by Options
        });

        // Theme
        if (settings.theme === 'dark') setIsDarkTheme(true);
        else if (settings.theme === 'light') setIsDarkTheme(false);
        else setIsDarkTheme(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
        
        // Layout & Interaction
        setViewMode(settings.defaultLayout as ('grid' | 'list'));
        setUseClickToExpand(settings.expandOnClick);
        
        // UI & Player Settings
        setDefaultPreviewSize(settings.defaultLottieSize);
        setFilterPreviewMode(settings.previewMode);
        setIsAutoplayEnabled(settings.autoplay);
        setGridRowCount(settings.gridRows);
        setIsEditorButtonEnabled(settings.enableBasicEditor);

        // Download Settings
        setDownloadSettings({
          sizeMode: settings.downloadSizeMode as DownloadSizeMode,
          customWidth: settings.customDownloadWidth,
        });

      } catch (error) {
        console.error("LottiX Grabber: Error loading popup settings", error);
      }
    };
    loadPopupSettings();

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

  const handleInfoInteraction = (id: string, isEnter: boolean) => {
    if (!useClickToExpand) setExpandedItemId(isEnter ? id : null);
  };
  const handleInfoClick = (id: string) => {
    if (useClickToExpand) setExpandedItemId(prev => (prev === id ? null : id));
  };
  const handleMouseLeaveItem = (id: string) => {
    if (!useClickToExpand && expandedItemId === id) setExpandedItemId(null);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };

  const handleDownload = async (item: LottieItemData) => {
    const uniqueId = item.lottieUrl || item.fileName;
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
        
        if (originalWidth && originalHeight) { // Ensure w & h exist
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

      setDownloadedItems(prev => ({ ...prev, [uniqueId]: true }));
      setTimeout(() => setDownloadedItems(prev => ({ ...prev, [uniqueId]: false })), 3000);

    } catch (error) {
      console.error(`LottiX Grabber: Error downloading ${item.lottieUrl}`, error);
    }
  };

  const handleDownloadSelected = async () => {
    for (const itemId of selectedItems) {
      const itemToDownload = foundLotties.find(l => getItemId(l, 0) === itemId); // Index 0 is arbitrary for getItemId here
      if (itemToDownload) {
        await handleDownload(itemToDownload); 
      }
    }
    setSelectedItems([]);
  };
  
  const getItemId = (item: LottieItemData, index: number): string => item.lottieUrl || item.fileName || `lottie-${index}`;

  const filteredLotties = foundLotties.filter(item => {
    if (filterPreviewMode === 'lottie') return item.wasDotLottie;
    if (filterPreviewMode === 'json') return !item.wasDotLottie;
    return true; // 'all'
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
            const isExpanded = expandedItemId === uniqueId;
            const isSelected = selectedItems.includes(uniqueId);
            const hasBeenDownloaded = downloadedItems[uniqueId];
            const playerSizeStyle = {
              width: `${defaultPreviewSize}px`,
              height: `${defaultPreviewSize}px`,
            };

            return (
              <li 
                key={uniqueId} 
                onMouseLeave={() => handleMouseLeaveItem(uniqueId)}
                className={`${isExpanded ? 'expanded-item' : ''} ${isSelected ? 'selected-item' : ''}`}
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
                    <button 
                      className="info-icon" 
                      onClick={() => handleInfoClick(uniqueId)}
                      onMouseEnter={() => handleInfoInteraction(uniqueId, true)}
                      aria-expanded={isExpanded}
                      aria-controls={`details-${uniqueId}`}
                    >
                      (i)
                    </button>
                  </div>
                  {isExpanded && (
                    <div id={`details-${uniqueId}`} className="expanded-details" style={{width: `${defaultPreviewSize}px`}}>
                      <div className="detail"><span className="detail-key">Ver:</span><span className="detail-value">{data.bmVersion}</span></div>
                      <div className="detail"><span className="detail-key">Res:</span><span className="detail-value">{data.width}x{data.height}</span></div>
                      <div className="detail"><span className="detail-key">FPS:</span><span className="detail-value">{Number(data.frameRate).toFixed(1)}</span></div>
                      <div className="detail"><span className="detail-key">Frames:</span><span className="detail-value">{Math.ceil(data.numFrames)}</span></div>
                      <div className="detail"><span className="detail-key">Layers:</span><span className="detail-value">{Math.ceil(data.numLayers)}</span></div>
                    </div>
                  )}
                </div>
                <div className="actions" style={ viewMode === 'grid' ? {width: `${defaultPreviewSize}px`} : {} }> 
                  <button
                    className={`btn download-btn ${hasBeenDownloaded ? 'downloaded' : ''}`}
                    onClick={() => handleDownload(data)}
                    disabled={hasBeenDownloaded}
                    title={hasBeenDownloaded ? 'Downloaded' : 'Download Lottie'}
                  >
                    {hasBeenDownloaded ? '✅' : '📥'}
                  </button>
                  <button className="btn" onClick={() => openWebPage(data.lottieUrl)} title="Open Lottie URL in new tab">Open URL</button>
                  {isEditorButtonEnabled && (
                    <button 
                      className="btn" 
                      onClick={() => browser.tabs.create({ url: browser.runtime.getURL(`editor.html?lottieUrl=${encodeURIComponent(data.lottieUrl)}`) })}
                      title="Edit Lottie (JSON only)"
                    >
                      Edit
                    </button>
                  )}
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
    </section>
  );
};

export default Popup;
