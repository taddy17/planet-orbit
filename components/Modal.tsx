
import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  show: boolean;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose, show }) => {
  if (!show) {
    return null;
  }
  
  // Prevents clicks inside the modal content from closing it
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex flex-col justify-center items-center p-4 text-center z-20 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div onClick={handleContentClick}>
        {children}
      </div>
    </div>
  );
};
