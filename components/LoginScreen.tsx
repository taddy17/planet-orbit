
import React from 'react';

export const LoginScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex flex-col justify-center items-center p-4 text-center z-20">
      <h1 className="text-4xl sm:text-6xl font-bold mb-4" style={{ textShadow: '0 0 20px #0ea5e9' }}>
        Planet Orbit
      </h1>
      <p className="text-lg sm:text-2xl animate-pulse">Connecting to server...</p>
    </div>
  );
};
