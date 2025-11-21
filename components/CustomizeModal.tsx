
import React, { useState } from 'react';
import type { PlayerSettings, MoonSkin } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface CustomizeModalProps {
  settings: PlayerSettings;
  onSave: (newSettings: Partial<PlayerSettings>) => void;
  onClose: () => void;
}

const SkinOption: React.FC<{ 
  value: MoonSkin; 
  current: MoonSkin; 
  onSelect: (v: MoonSkin) => void; 
  label: string 
}> = ({ value, current, onSelect, label }) => (
  <button
    onClick={() => onSelect(value)}
    className={`flex-1 py-2 px-1 text-sm font-bold border-2 rounded-lg transition-all
      ${value === current 
        ? 'bg-sky-500 border-sky-500 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]' 
        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-sky-400'
      }`}
  >
    {label}
  </button>
);

export const CustomizeModal: React.FC<CustomizeModalProps> = ({ settings, onSave, onClose }) => {
  const [planetColor, setPlanetColor] = useState(settings.planetColor);
  const [moonColor, setMoonColor] = useState(settings.moonColor);
  const [trailColor, setTrailColor] = useState(settings.trailColor || '#38bdf8');
  const [moonSkin, setMoonSkin] = useState<MoonSkin>(settings.moonSkin || 'default');

  const handleSave = () => {
    onSave({ planetColor, moonColor, trailColor, moonSkin });
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Customize Ship</h1>
        
        <div className="bg-slate-700/90 backdrop-blur-sm p-6 rounded-xl w-full flex flex-col gap-5 shadow-xl border border-slate-600">
          
          {/* Colors Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <label htmlFor="planet-color" className="text-base font-semibold text-slate-200">Planet Core</label>
                <input
                  id="planet-color"
                  type="color"
                  value={planetColor}
                  onChange={(e) => setPlanetColor(e.target.value)}
                  className="cursor-pointer shadow-sm rounded"
                />
            </div>
            <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <label htmlFor="moon-color" className="text-base font-semibold text-slate-200">Moon Hull</label>
                <input
                  id="moon-color"
                  type="color"
                  value={moonColor}
                  onChange={(e) => setMoonColor(e.target.value)}
                  className="cursor-pointer shadow-sm rounded"
                />
            </div>
            <div className="flex justify-between items-center">
                <label htmlFor="trail-color" className="text-base font-semibold text-slate-200">Thruster Trail</label>
                <input
                  id="trail-color"
                  type="color"
                  value={trailColor}
                  onChange={(e) => setTrailColor(e.target.value)}
                  className="cursor-pointer shadow-sm rounded"
                />
            </div>
          </div>

          {/* Skins Section */}
          <div>
            <h3 className="text-left text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Moon Skin</h3>
            <div className="grid grid-cols-2 gap-2">
               <SkinOption value="default" current={moonSkin} onSelect={setMoonSkin} label="Classic" />
               <SkinOption value="crater" current={moonSkin} onSelect={setMoonSkin} label="Cratered" />
               <SkinOption value="tech" current={moonSkin} onSelect={setMoonSkin} label="Tech" />
               <SkinOption value="smooth" current={moonSkin} onSelect={setMoonSkin} label="Smooth" />
            </div>
          </div>

        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={handleSave} className="w-32 bg-green-600 hover:bg-green-500 shadow-green-500/30">Save</Button>
          <Button onClick={onClose} variant="secondary" className="w-32">Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};
