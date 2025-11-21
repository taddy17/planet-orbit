
import React from 'react';

export const LoginScreen: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center z-20"
      style={{
        paddingTop: `calc(1rem + env(safe-area-inset-top))`,
        paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`,
        paddingLeft: `calc(1rem + env(safe-area-inset-left))`,
        paddingRight: `calc(1rem + env(safe-area-inset-right))`,
      }}
    >
      <h1 className="text-4xl sm:text-6xl font-bold mb-4" style={{ textShadow: '0 0 20px #0ea5e9' }}>
        Planet Orbit
      </h1>
      <p className="text-lg sm:text-2xl animate-pulse font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
        Igniting Thrusters...
      </p>
    </div>
  );
};
