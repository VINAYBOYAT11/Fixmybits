import React from 'react';

interface PixelAvatarProps {
  power: string;
  size?: number;
  className?: string;
  showGlow?: boolean;
}

const POWER_MAPPING: Record<string, { sheet: 'elementals' | 'heroes'; x: number; y: number; color: string }> = {
  // Row 0
  'Fire': { sheet: 'elementals', x: 0, y: 0, color: '#ef4444' },
  'Water': { sheet: 'elementals', x: 1, y: 0, color: '#3b82f6' },
  'Electric': { sheet: 'elementals', x: 2, y: 0, color: '#eab308' },
  'Wizard': { sheet: 'elementals', x: 3, y: 0, color: '#a855f7' },
  'Magic': { sheet: 'elementals', x: 4, y: 0, color: '#ec4899' },
  // Row 1
  'Shadow': { sheet: 'elementals', x: 0, y: 1, color: '#1f2937' },
  'Nature': { sheet: 'elementals', x: 1, y: 1, color: '#166534' },
  'Ice': { sheet: 'elementals', x: 2, y: 1, color: '#06b6d4' },
  'Tech': { sheet: 'elementals', x: 3, y: 1, color: '#22c55e' },
  'Wind': { sheet: 'elementals', x: 4, y: 1, color: '#0ea5e9' },
  // Row 2
  'Earth': { sheet: 'elementals', x: 0, y: 2, color: '#92400e' },
  'Light': { sheet: 'elementals', x: 1, y: 2, color: '#facc15' },
  'Chaos': { sheet: 'elementals', x: 2, y: 2, color: '#f97316' },
  'Ghost': { sheet: 'elementals', x: 3, y: 2, color: '#94a3b8' },
  'Gravity': { sheet: 'elementals', x: 4, y: 2, color: '#4c1d95' },
  // Row 3
  'Time': { sheet: 'elementals', x: 0, y: 3, color: '#d97706' },
  'Order': { sheet: 'elementals', x: 1, y: 3, color: '#f8fafc' },
  'Metal': { sheet: 'elementals', x: 2, y: 3, color: '#64748b' },
  'Toxic': { sheet: 'elementals', x: 3, y: 3, color: '#84cc16' },
  'Dragon': { sheet: 'elementals', x: 4, y: 3, color: '#991b1b' },

  // Heroes
  'Spiderman': { sheet: 'heroes', x: 0, y: 0, color: '#f43f5e' },
  'Batman': { sheet: 'heroes', x: 1, y: 0, color: '#1f2937' },
  'Hulk': { sheet: 'heroes', x: 2, y: 0, color: '#22c55e' },
  'Thor': { sheet: 'heroes', x: 0, y: 1, color: '#3b82f6' },
  'Captain America': { sheet: 'heroes', x: 1, y: 1, color: '#2563eb' },
  'Doremon': { sheet: 'heroes', x: 2, y: 1, color: '#0ea5e9' },
};

export function PixelAvatar({ power, size = 48, className = '', showGlow = false }: PixelAvatarProps) {
  const config = POWER_MAPPING[power] || POWER_MAPPING['Tech'];
  
  let posX = 0;
  let posY = 0;
  let bgSize = '500% 400%'; 
  let sheetUrl = '/avatars/elementals.png';

  if (config.sheet === 'elementals') {
    posX = config.x * 25;
    posY = config.y * 33.333;
    bgSize = '500% 400%';
    sheetUrl = '/avatars/elementals.png';
  } else {
    posX = config.x * 50;
    posY = config.y * 100;
    bgSize = '300% 200%';
    sheetUrl = '/avatars/heroes.png';
  }

  return (
    <div 
      className={`relative border-[4px] border-black dark:border-white overflow-hidden bg-[#0A0A0A] ${className}`}
      style={{ 
        width: size, 
        height: size,
        boxShadow: showGlow ? `0 0 30px ${config.color}, inset 0 0 20px ${config.color}44` : 'none',
        flexShrink: 0,
        borderRadius: '0px' // Hard brutalist edges
      }}
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${sheetUrl})`,
          backgroundSize: bgSize,
          backgroundPosition: `${posX}% ${posY}%`,
          imageRendering: 'pixelated',
          transform: 'scale(1.1)', // Slight zoom to focus on portrait
        }}
      />
      {/* Subtle Scanline Overlay for Overdrive look */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}
