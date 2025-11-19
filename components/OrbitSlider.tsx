import React from 'react';

interface OrbitSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export const OrbitSlider: React.FC<OrbitSliderProps> = ({ value, min, max, onChange }) => {
  if (min >= max) {
    return null; // Don't render if bounds are invalid
  }
  return (
    <div 
      className="absolute bottom-24 left-0 right-0 p-4 z-20 flex justify-center items-center"
      style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}
    >
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="orbit-slider"
        aria-label="Orbit Control"
      />
    </div>
  );
};