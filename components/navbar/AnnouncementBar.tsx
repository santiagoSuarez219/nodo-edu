'use client';

import { useEffect, useState } from 'react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isClosed = localStorage.getItem('announcement-bar-closed');
    if (isClosed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('announcement-bar-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-700 dark:bg-blue-600 text-white text-sm py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="flex-1">
          📢 <span className="ml-2 font-medium">Nodo está en fase beta.</span> Tu feedback es valioso para mejorar la plataforma.
        </p>
        <button
          onClick={handleClose}
          aria-label="Cerrar anuncio"
          className="flex-shrink-0 hover:bg-blue-800 dark:hover:bg-blue-700 p-1 rounded transition-colors duration-200"
        >
          <svg
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
