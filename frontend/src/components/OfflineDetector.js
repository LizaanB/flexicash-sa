import React, { useState, useEffect } from 'react';

function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '12px',
      textAlign: 'center',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: '500'
    }}>
      📡 No Internet Connection - Some features may not work
    </div>
  );
}

export default OfflineDetector;
