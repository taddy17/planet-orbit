import React, { useState } from 'react';
import type { PlayerSettings } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface CustomizeModalProps {
  settings: PlayerSettings;
  onSave: (newSettings: Pick<PlayerSettings, 'planetColor' | 'moonColor'>) => void;
  onClose: () => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({ settings, onSave, onClose }) => {
  const [planetColor, setPlanetColor] = useState(settings.planetColor);
  const [moonColor, setMoonColor] = useState(settings.moonColor);

  const handleSave = () => {
    onSave({ planetColor, moonColor });
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-white">Customize</h1>
        <div className="bg-slate-700 p-6 rounded-lg w-full flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <label htmlFor="planet-color" className="text-lg font-semibold">Planet Color</label>
            <input
              id="planet-color"
              type="color"
              value={planetColor}
              onChange={(e) => setPlanetColor(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="moon-color" className="text-lg font-semibold">Moon Color</label>
            <input
              id="moon-color"
              type="color"
              value={moonColor}
              onChange={(e) => setMoonColor(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={handleSave} className="w-32">Save</Button>
          <Button onClick={onClose} variant="secondary" className="w-32">Close</Button>
        </div>
      </div>
    </Modal>
  );
};