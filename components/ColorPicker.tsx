'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Full color palette ───────────────────────────────────────────────────────
const COLOR_PALETTE = [
  // Reds
  { name: 'Dark Red',    hex: '#8B0000' },
  { name: 'Red',         hex: '#FF0000' },
  { name: 'Crimson',     hex: '#DC143C' },
  { name: 'Tomato',      hex: '#FF6347' },
  { name: 'Coral',       hex: '#FF7F50' },
  { name: 'Light Coral', hex: '#F08080' },
  { name: 'Salmon',      hex: '#FA8072' },
  { name: 'Rose',        hex: '#FF007F' },
  // Pinks
  { name: 'Deep Pink',   hex: '#FF1493' },
  { name: 'Hot Pink',    hex: '#FF69B4' },
  { name: 'Pink',        hex: '#FFC0CB' },
  { name: 'Light Pink',  hex: '#FFB6C1' },
  { name: 'Blush',       hex: '#DE5D83' },
  { name: 'Magenta',     hex: '#FF00FF' },
  // Oranges
  { name: 'Dark Orange', hex: '#FF8C00' },
  { name: 'Orange',      hex: '#FFA500' },
  { name: 'Gold',        hex: '#FFD700' },
  { name: 'Amber',       hex: '#FFBF00' },
  { name: 'Peach',       hex: '#FFCBA4' },
  { name: 'Apricot',     hex: '#FBCEB1' },
  // Yellows
  { name: 'Yellow',      hex: '#FFFF00' },
  { name: 'Light Yellow',hex: '#FFFFE0' },
  { name: 'Lemon',       hex: '#FFF44F' },
  { name: 'Khaki',       hex: '#C3B091' },
  { name: 'Mustard',     hex: '#FFDB58' },
  // Greens
  { name: 'Dark Green',  hex: '#006400' },
  { name: 'Forest Green',hex: '#228B22' },
  { name: 'Green',       hex: '#008000' },
  { name: 'Lime Green',  hex: '#32CD32' },
  { name: 'Lime',        hex: '#00FF00' },
  { name: 'Olive',       hex: '#808000' },
  { name: 'Mint',        hex: '#98FF98' },
  { name: 'Sea Green',   hex: '#2E8B57' },
  { name: 'Teal',        hex: '#008080' },
  { name: 'Emerald',     hex: '#50C878' },
  { name: 'Sage',        hex: '#9CAF88' },
  { name: 'Pistachio',   hex: '#93C572' },
  // Blues
  { name: 'Navy',        hex: '#000080' },
  { name: 'Dark Blue',   hex: '#00008B' },
  { name: 'Blue',        hex: '#0000FF' },
  { name: 'Royal Blue',  hex: '#4169E1' },
  { name: 'Cobalt',      hex: '#0047AB' },
  { name: 'Cornflower',  hex: '#6495ED' },
  { name: 'Sky Blue',    hex: '#87CEEB' },
  { name: 'Light Blue',  hex: '#ADD8E6' },
  { name: 'Baby Blue',   hex: '#89CFF0' },
  { name: 'Cyan',        hex: '#00FFFF' },
  { name: 'Turquoise',   hex: '#40E0D0' },
  { name: 'Aqua',        hex: '#00FFFF' },
  { name: 'Steel Blue',  hex: '#4682B4' },
  { name: 'Denim',       hex: '#1560BD' },
  // Purples
  { name: 'Indigo',      hex: '#4B0082' },
  { name: 'Purple',      hex: '#800080' },
  { name: 'Dark Purple', hex: '#4B0050' },
  { name: 'Violet',      hex: '#EE82EE' },
  { name: 'Lavender',    hex: '#E6E6FA' },
  { name: 'Plum',        hex: '#DDA0DD' },
  { name: 'Mauve',       hex: '#E0B0FF' },
  { name: 'Lilac',       hex: '#C8A2C8' },
  { name: 'Amethyst',    hex: '#9966CC' },
  // Browns / Earth
  { name: 'Brown',       hex: '#A52A2A' },
  { name: 'Dark Brown',  hex: '#5C3317' },
  { name: 'Chocolate',   hex: '#7B3F00' },
  { name: 'Caramel',     hex: '#C68642' },
  { name: 'Tan',         hex: '#D2B48C' },
  { name: 'Beige',       hex: '#F5F5DC' },
  { name: 'Cream',       hex: '#FFFDD0' },
  { name: 'Ivory',       hex: '#FFFFF0' },
  { name: 'Wheat',       hex: '#F5DEB3' },
  { name: 'Sand',        hex: '#C2B280' },
  { name: 'Maroon',      hex: '#800000' },
  { name: 'Rust',        hex: '#B7410E' },
  { name: 'Copper',      hex: '#B87333' },
  { name: 'Bronze',      hex: '#CD7F32' },
  // Neutrals
  { name: 'White',       hex: '#FFFFFF' },
  { name: 'Off White',   hex: '#FAF9F6' },
  { name: 'Silver',      hex: '#C0C0C0' },
  { name: 'Light Gray',  hex: '#D3D3D3' },
  { name: 'Gray',        hex: '#808080' },
  { name: 'Dark Gray',   hex: '#A9A9A9' },
  { name: 'Charcoal',    hex: '#36454F' },
  { name: 'Black',       hex: '#000000' },
  // Special / Fashion
  { name: 'Burgundy',    hex: '#800020' },
  { name: 'Wine',        hex: '#722F37' },
  { name: 'Fuchsia',     hex: '#FF00FF' },
  { name: 'Champagne',   hex: '#F7E7CE' },
  { name: 'Nude',        hex: '#E3BC9A' },
  { name: 'Terracotta',  hex: '#E2725B' },
  { name: 'Dusty Rose',  hex: '#DCAE96' },
  { name: 'Blush Pink',  hex: '#FF9999' },
  { name: 'Powder Blue', hex: '#B0C4DE' },
  { name: 'Pastel Green',hex: '#77DD77' },
  { name: 'Pastel Yellow',hex:'#FDFD96' },
  { name: 'Pastel Purple',hex:'#B39EB5' },
  { name: 'Midnight',    hex: '#191970' },
  { name: 'Forest',      hex: '#014421' },
];

interface ColorPickerProps {
  selected: string[];                         // array of hex strings
  onChange: (colors: string[]) => void;
}

export default function ColorPicker({ selected, onChange }: ColorPickerProps) {
  const [search, setSearch]           = useState('');
  const [customHex, setCustomHex]     = useState('#');
  const [customErr, setCustomErr]     = useState('');
  const [showPicker, setShowPicker]   = useState(false);
  const pickerRef                     = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = COLOR_PALETTE.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.hex.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (hex: string) => {
    const norm = hex.toUpperCase();
    onChange(
      selected.includes(norm)
        ? selected.filter(c => c !== norm)
        : [...selected, norm]
    );
  };

  const addCustom = () => {
    const hex = customHex.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setCustomErr('Valid hex likho jaise #FF5733');
      return;
    }
    const norm = hex.toUpperCase();
    if (!selected.includes(norm)) onChange([...selected, norm]);
    setCustomHex('#');
    setCustomErr('');
  };

  const removeColor = (hex: string) => onChange(selected.filter(c => c !== hex));

  const getLabel = (hex: string) =>
    COLOR_PALETTE.find(c => c.hex.toUpperCase() === hex.toUpperCase())?.name ?? hex;

  return (
    <div className="space-y-2">
      {/* Selected colors row */}
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {selected.length === 0 && (
          <span className="text-xs text-gray-400 italic self-center">Koi color select nahi hua</span>
        )}
        {selected.map(hex => (
          <div
            key={hex}
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm"
          >
            <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
              style={{ backgroundColor: hex }} />
            <span className="text-xs text-gray-700 font-medium">{getLabel(hex)}</span>
            <button
              type="button"
              onClick={() => removeColor(hex)}
              className="text-gray-400 hover:text-red-500 transition text-xs leading-none ml-0.5"
            >×</button>
          </div>
        ))}
      </div>

      {/* Toggle picker button */}
      <div ref={pickerRef} className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(p => !p)}
          className="flex items-center gap-2 px-4 py-2.5 w-full border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition font-medium"
        >
          <span className="text-base">🎨</span>
          {showPicker ? 'Color picker band karo' : `Colors choose karo (${selected.length} selected)`}
          <svg className={`w-4 h-4 ml-auto transition-transform ${showPicker ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPicker && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Color search karo... (Red, Blue, Pink, #FF0000)"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>

            {/* Color grid */}
            <div className="grid grid-cols-8 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <p className="col-span-8 text-center text-xs text-gray-400 py-4">Koi color nahi mila</p>
              ) : filtered.map(color => {
                const isSelected = selected.includes(color.hex.toUpperCase());
                return (
                  <button
                    key={color.hex}
                    type="button"
                    title={`${color.name} (${color.hex})`}
                    onClick={() => toggle(color.hex.toUpperCase())}
                    className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                      isSelected ? 'border-purple-500 shadow-md scale-110' : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-3 h-3 drop-shadow" fill="white" viewBox="0 0 20 20">
                          <path fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    {/* White outline for light colors */}
                    {['#FFFFFF','#FAF9F6','#FFFFF0','#FFFFE0','#FFFDD0','#F5F5DC','#E6E6FA','#FFC0CB','#FFB6C1'].includes(color.hex) && (
                      <span className="absolute inset-0 rounded-lg border border-gray-200 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result count */}
            <p className="text-xs text-gray-400 text-center">
              {filtered.length} colors — {selected.length} selected
            </p>

            {/* Custom hex input */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Custom Hex Color</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(customHex) ? customHex : '#fff' }} />
                  <input
                    type="text"
                    value={customHex}
                    onChange={e => { setCustomHex(e.target.value); setCustomErr(''); }}
                    onKeyDown={e => e.key === 'Enter' && addCustom()}
                    placeholder="#FF5733"
                    maxLength={7}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(customHex) ? customHex : '#ffffff'}
                  onChange={e => { setCustomHex(e.target.value.toUpperCase()); setCustomErr(''); }}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                  title="Color wheel se choose karo"
                />
                <button
                  type="button"
                  onClick={addCustom}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
              {customErr && <p className="text-red-500 text-xs mt-1">{customErr}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}