import React, { useState, ChangeEvent, useEffect, useCallback } from 'react';
import { DotLottiePlayer, PlayerEvents } from '@dotlottie/react-player';
import './styles.scss';

// Helper for deep cloning
const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

// Helper to convert Lottie color array to hex and vice-versa
const lottieColorToHex = (colorArray: number[]): string => {
  const r = Math.round(colorArray[0] * 255);
  const g = Math.round(colorArray[1] * 255);
  const b = Math.round(colorArray[2] * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const hexToLottieColor = (hex: string): number[] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1]; // Assuming alpha is 1
};


const Editor: React.FC = () => {
  const [playerSrc, setPlayerSrc] = useState<any | null>(null); // For player (URL or JSON object)
  const [editableLottieJson, setEditableLottieJson] = useState<any | null>(null); // For direct JSON manipulation
  const [isDotLottieFile, setIsDotLottieFile] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [playerKey, setPlayerKey] = useState<number>(Date.now()); // To force player re-render

  // Placeholder for URL loading (not part of this subtask's core)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lottieUrl = params.get('lottieUrl');
    if (lottieUrl) {
      console.log('Editor opened with Lottie URL (fetching not implemented):', lottieUrl);
      // Basic fetch for JSON if URL is direct JSON link
      if (lottieUrl.endsWith('.json')) {
        fetch(lottieUrl)
          .then(res => res.json())
          .then(data => {
            setEditableLottieJson(data);
            setPlayerSrc(deepClone(data)); // Use a copy for the player initially
            setFileName(lottieUrl.substring(lottieUrl.lastIndexOf('/') + 1));
            setIsDotLottieFile(false);
          })
          .catch(err => {
            console.error("Error fetching Lottie JSON from URL:", err);
            setError('Failed to load Lottie from URL.');
          });
      } else if (lottieUrl.endsWith('.lottie')) {
         setPlayerSrc(lottieUrl); // Player can handle .lottie URLs
         setIsDotLottieFile(true);
         setEditableLottieJson(null); // Editing .lottie internals not supported
         setError('Editing .lottie files is not supported. Playback only.');
         setFileName(lottieUrl.substring(lottieUrl.lastIndexOf('/') + 1));
      }
    }
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('No file selected.');
      setPlayerSrc(null);
      setEditableLottieJson(null);
      setIsDotLottieFile(false);
      setFileName('');
      return;
    }

    setFileName(file.name);
    setError('');
    setIsDotLottieFile(file.name.endsWith('.lottie'));

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedJson = JSON.parse(content);
          setEditableLottieJson(parsedJson);
          setPlayerSrc(deepClone(parsedJson)); // Use a fresh copy for the player
          setPlayerKey(Date.now()); // Force re-render of player
        } catch (err) {
          console.error('Error parsing JSON file:', err);
          setError('Error loading JSON. Make sure it is a valid Lottie JSON file.');
          setEditableLottieJson(null);
          setPlayerSrc(null);
        }
      };
      reader.onerror = () => setError('Error reading file.');
      reader.readAsText(file);
    } else if (file.name.endsWith('.lottie')) {
      const fileUrl = URL.createObjectURL(file);
      setPlayerSrc(fileUrl);
      setEditableLottieJson(null); // Clear any existing editable JSON
      setError('Editing .lottie files is not directly supported. Only playback is enabled. Modify original JSON if available.');
      setPlayerKey(Date.now());
    } else {
      setError('Unsupported file type. Please upload .json or .lottie files.');
      setPlayerSrc(null);
      setEditableLottieJson(null);
    }
  };
  
  const handlePlayerEvents = (event: PlayerEvents) => {
    if (event === PlayerEvents.Error) {
      setError(`Lottie player error. Source: ${fileName}`);
    } else if (event === PlayerEvents.Ready) {
      setError(''); 
    }
  };

  const getLayerTypeName = (type: number): string => {
    const types: { [key: number]: string } = {
      0: 'Composition', 1: 'Solid', 2: 'Image', 3: 'Null',
      4: 'Shape', 5: 'Text', 6: 'Audio', 13: 'Data',
    };
    return types[type] || 'Unknown';
  };

  const updateLottieJson = useCallback((updatedJson: any) => {
    setEditableLottieJson(updatedJson);
    setPlayerSrc(deepClone(updatedJson)); // Update player with a new copy
    setPlayerKey(Date.now()); // Force player re-render
  }, []);

  const toggleLayerVisibility = (layerIndex: number) => {
    if (!editableLottieJson) return;
    const newJson = deepClone(editableLottieJson);
    const layer = newJson.layers[layerIndex];
    if (layer) {
      layer.hd = !layer.hd;
      updateLottieJson(newJson);
    }
  };

  const deleteLayer = (layerIndex: number) => {
    if (!editableLottieJson) return;
    const newJson = deepClone(editableLottieJson);
    newJson.layers.splice(layerIndex, 1);
    updateLottieJson(newJson);
  };
  
  const handleColorChange = (layerIndex: number, shapeItemIndex: number, newHexColor: string) => {
    if (!editableLottieJson) return;
    const newJson = deepClone(editableLottieJson);
    try {
      const shapeItem = newJson.layers[layerIndex].shapes[shapeItemIndex];
      if (shapeItem && shapeItem.it) { // Legacy: it, Modern: shapes
         // Look for fill (fl) or stroke (st)
        const target = shapeItem.it.find((item: any) => item.ty === 'fl' || item.ty === 'st');
        if (target && target.c && target.c.k) {
             target.c.k = hexToLottieColor(newHexColor);
             if (target.c.k.length === 4 && target.c.k[3] === undefined) target.c.k[3] = 1; // ensure alpha
             updateLottieJson(newJson);
        }
      } else if (shapeItem && shapeItem.c && shapeItem.c.k) { // Direct color on some shape items (less common for complex shapes)
         shapeItem.c.k = hexToLottieColor(newHexColor);
         if (shapeItem.c.k.length === 4 && shapeItem.c.k[3] === undefined) shapeItem.c.k[3] = 1;
         updateLottieJson(newJson);
      } else {
         // Attempt to find color in modern 'shapes' array (often nested)
        const findColorAndUpdate = (items: any[]): boolean => {
            for (const item of items) {
                if ((item.ty === 'fl' || item.ty === 'st') && item.c && item.c.k) {
                    item.c.k = hexToLottieColor(newHexColor);
                    if (item.c.k.length === 4 && item.c.k[3] === undefined) item.c.k[3] = 1;
                    return true;
                }
                if (item.it && findColorAndUpdate(item.it)) return true; // Recurse for nested items
                if (item.shapes && findColorAndUpdate(item.shapes)) return true; // Recurse for modern nested shapes
            }
            return false;
        };
        if (findColorAndUpdate(newJson.layers[layerIndex].shapes)) {
             updateLottieJson(newJson);
        } else {
            console.warn("Could not find a solid fill/stroke color property for this shape item.", shapeItem);
        }
      }
    } catch (e) {
      console.error("Error changing color: ", e);
    }
  };


  const downloadModifiedJson = () => {
    if (!editableLottieJson) {
      setError('No editable Lottie JSON data to download.');
      return;
    }
    const jsonString = JSON.stringify(editableLottieJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.(json|lottie)$/, '')}_modified.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="editor-container">
      <header className="editor-header">
        <h1>Lottie Editor (Basic)</h1>
        <div className="file-loader">
          <label htmlFor="lottieFile">Load Lottie:</label>
          <input type="file" id="lottieFile" accept=".json,.lottie" onChange={handleFileChange} />
          {fileName && <span className="file-name">Loaded: {fileName}</span>}
        </div>
        {editableLottieJson && (
          <button onClick={downloadModifiedJson} className="download-json-btn">
            Download Modified JSON
          </button>
        )}
      </header>

      {error && <div className="error-message">{error}</div>}

      <main className="editor-main-content">
        <div className="lottie-player-panel">
          {playerSrc ? (
            <DotLottiePlayer key={playerKey} src={playerSrc} autoplay loop controls onEvent={handlePlayerEvents} />
          ) : (
            <div className="player-placeholder">Upload a Lottie file (.json or .lottie) to view and edit.</div>
          )}
        </div>
        <aside className="editor-sidebar">
          <div className="layer-list">
            <h2>Layers</h2>
            {isDotLottieFile && <p className="notice">Layer editing is not available for .lottie files. Please load a raw JSON file.</p>}
            {!editableLottieJson && !isDotLottieFile && <p>Load a JSON Lottie file to see layers.</p>}
            {editableLottieJson?.layers?.map((layer: any, index: number) => (
              <div key={layer.ind || index} className={`layer-item ${layer.hd ? 'hidden' : ''}`}>
                <span className="layer-name">{layer.nm || `Layer ${index + 1}`} ({getLayerTypeName(layer.ty)})</span>
                <div className="layer-controls">
                  <button onClick={() => toggleLayerVisibility(index)} title={layer.hd ? "Show Layer" : "Hide Layer"}>
                    {layer.hd ? '🙈' : '👁️'}
                  </button>
                  <button onClick={() => deleteLayer(index)} title="Delete Layer">🗑️</button>
                </div>
                {/* Basic Color Editing for Shape Layers */}
                {layer.ty === 4 && layer.shapes && (
                  <div className="shape-colors">
                    {layer.shapes.map((shape: any, shapeIndex: number) => {
                      // Attempt to find a fill or stroke color
                      let colorPath: string | null = null;
                      let currentColorVal: number[] | null = null;
                      
                      const findColor = (items: any[]): {item: any, path: string} | null => {
                        for(let i=0; i<items.length; ++i) {
                            const item = items[i];
                            if ((item.ty === 'fl' || item.ty === 'st') && item.c && item.c.k && !item.c.k[0]?.s) { // !item.c.k[0].s checks if it's not an animated color property for simplicity
                                return {item: item.c.k, path: `${shapeIndex}.it[${i}].c.k`}; // Path is illustrative
                            }
                            if(item.it) { // Legacy items
                                const foundInIt = findColor(item.it);
                                if(foundInIt) return foundInIt;
                            }
                             if(item.shapes) { // Modern items (nested shapes)
                                const foundInShapes = findColor(item.shapes);
                                if(foundInShapes) return foundInShapes;
                            }
                        }
                        return null;
                      };
                      
                      const colorInfo = findColor(shape.it || shape.shapes || []);
                      if (colorInfo) currentColorVal = colorInfo.item;

                      return currentColorVal ? (
                        <div key={shapeIndex} className="color-control">
                          <label htmlFor={`color-${index}-${shapeIndex}`}>Shape {shapeIndex+1} Fill/Stroke:</label>
                          <input
                            type="color"
                            id={`color-${index}-${shapeIndex}`}
                            value={lottieColorToHex(currentColorVal)}
                            onChange={(e) => handleColorChange(index, shapeIndex, e.target.value)}
                          />
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* <div className="property-controls-placeholder"> // Further controls can be added here
            <h2>Properties</h2>
            <p>(Select an element to see properties)</p>
          </div> */}
        </aside>
      </main>
    </div>
  );
};

export default Editor;
