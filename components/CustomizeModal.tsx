
import React, { useState } from 'react';
import type { PlayerSettings } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface CustomizeModalProps {
  settings: PlayerSettings;
  onSave: (newSettings: PlayerSettings) => void;
  onClose: () => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({ settings, onSave, onClose }) => {
  const [planetColor, setPlanetColor] = useState(settings.planetColor);
  const [moonColor, setMoonColor] = useState(settings.moonColor);

  const handleSave = () => {
    onSave({ ...settings, planetColor, moonColor });
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-white">Customize</h1>
        <div className="bg-slate-700 p-6 rounded-lg w-full">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="planet-color" className="text-lg">Planet Color:</label>
            <input type="color" id="planet-color" value={planetColor} onChange={(e) => setPlanetColor(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="moon-color" className="text-lg">Moon Color:</label>
            <input type="color" id="moon-color" value={moonColor} onChange={(e) => setMoonColor(e.target.value)} />
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
