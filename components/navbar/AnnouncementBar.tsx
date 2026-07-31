'use client';

import { useState } from 'react';

function getInitialVisibility() {
  if (typeof window === 'undefined') return true;
  const isClosed = localStorage.getItem('announcement-bar-closed');
  return !isClosed;
}

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(getInitialVisibility);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('announcement-bar-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-700 dark:bg-blue-600 text-white text-sm py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <p >
          📢 <span className="ml-2 font-medium">Nodo está en fase beta.</span> Tu feedback es valioso para mejorar la plataforma.
        </p>
      </div>
    </div>
  );
}
