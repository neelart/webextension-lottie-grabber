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
  const [playerKey, setPlayerKey] = useState<number>(Date.now());

  // --- Phase 1: Initial Sanity Check (Hardcoded Data) ---
  const [useHardcodedData, setUseHardcodedData] = useState(false); // Set to true to test
  const hardcodedLottieJson = {
    v: "5.5.2", fr: 30, ip: 0, op: 30, w: 100, h: 100, nm: "Hardcoded Test",
    ddd: 0, assets: [], layers: [
      { ty: 4, ddd: 0, ind: 1, ao: 0, ip: 0, op: 30, st: 0, nm: "Shape Layer 1",
        shapes: [
          { ty: "gr", it: [
            { ty: "rc", d: 1, s: { a: 0, k: [50, 50] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 } },
            { ty: "fl", c: { a: 0, k: [0.8, 0.2, 0.2, 1] } } // Red fill
          ], nm: "Rectangle" }
        ]
      }
    ]
  };

  useEffect(() => {
    if (useHardcodedData) {
      console.log("TESTING: Using hardcoded Lottie data.");
      setEditableLottieJson(hardcodedLottieJson);
      setPlayerSrc(deepClone(hardcodedLottieJson));
      setFileName("hardcoded_test.json");
      setIsDotLottieFile(false);
      setError('');
      setPlayerKey(Date.now());
    }
    // Temporarily set an error to test visibility
    // setError("TESTING: Error display check.");
  }, [useHardcodedData]);
  // --- End Phase 1 ---

  // Effect for cleaning up Object URLs
  useEffect(() => {
    return () => {
      if (playerSrc && typeof playerSrc === 'string' && playerSrc.startsWith('blob:')) {
        console.log("CLEANUP: Revoking Object URL:", playerSrc);
        URL.revokeObjectURL(playerSrc);
      }
    };
  }, [playerSrc]);

  // URL loading
  useEffect(() => {
    if (useHardcodedData) return; // Don't process URL if hardcoded data is active

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
    console.log("--- handleFileChange triggered ---"); // Phase 2

    if (playerSrc && typeof playerSrc === 'string' && playerSrc.startsWith('blob:')) {
      console.log("CLEANUP (handleFileChange): Revoking previous Object URL:", playerSrc);
      URL.revokeObjectURL(playerSrc);
    }

    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected.");
      setError('No file selected.');
      setPlayerSrc(null);
      setEditableLottieJson(null);
      setIsDotLottieFile(false);
      setFileName('');
      return;
    }

    console.log("File selected:", { // Phase 2
      name: file.name,
      type: file.type, // This might be empty/unreliable; extension check is better
      size: file.size,
    });

    setFileName(file.name);
    setError(''); 
    setEditableLottieJson(null); 
    setIsDotLottieFile(file.name.endsWith('.lottie'));

    if (file.name.endsWith('.json')) {
      console.log("Processing JSON file..."); // Phase 3
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        console.log("JSON FileReader onload - raw text:", textContent?.substring(0, 100) + "..."); // Phase 3
        try {
          console.log("Attempting JSON.parse..."); // Phase 3
          const parsedJson = JSON.parse(textContent);
          console.log("JSON parsed successfully. Version:", parsedJson?.v, "Layers:", parsedJson?.layers?.length); // Phase 3
          
          setEditableLottieJson(parsedJson);
          const playerJsonCopy = deepClone(parsedJson);
          setPlayerSrc(playerJsonCopy); 
          setPlayerKey(Date.now());

          console.log("State after JSON load:", { // Phase 5
            playerSrc: playerJsonCopy, // Log the copy
            editableLottieJson: parsedJson,
            isDotLottieFile: false,
            fileName: file.name,
          });

        } catch (err) {
          console.error('Error parsing JSON file:', err); // Phase 3
          setError('Error loading JSON. Make sure it is a valid Lottie JSON file.');
          setEditableLottieJson(null);
          setPlayerSrc(null);
        }
      };
      reader.onerror = () => {
        console.error("FileReader error for JSON.");
        setError('Error reading file.');
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.lottie')) {
      console.log("Processing .lottie file..."); // Phase 4
      const fileUrl = URL.createObjectURL(file);
      console.log(".lottie Object URL created:", fileUrl); // Phase 4
      
      setPlayerSrc(fileUrl);
      // editableLottieJson remains null as per logic
      setError('Editing .lottie files is not directly supported. Playback only. Modify original JSON if available.');
      setPlayerKey(Date.now());

      console.log("State after .lottie load:", { // Phase 5
        playerSrc: fileUrl,
        editableLottieJson: null,
        isDotLottieFile: true,
        fileName: file.name,
      });

    } else {
      console.log("Unsupported file type.");
      setError('Unsupported file type. Please upload .json or .lottie files.');
      setPlayerSrc(null);
      // editableLottieJson is already null
    }
  };
  
  const handlePlayerEvents = (event: PlayerEvents) => {
    console.log("Player Event:", event, "File:", fileName);
    if (event === PlayerEvents.Error) {
      setError(`Lottie player error. Source: ${fileName || 'unknown'}. Is the file valid?`);
    } else if (event === PlayerEvents.Ready && !error.startsWith("Editing .lottie files")) { 
      // Clear non-.lottie related errors when player is ready
      setError(''); 
    }
  };

  const getLayerTypeName = (type: number): string => { // No changes needed here
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
