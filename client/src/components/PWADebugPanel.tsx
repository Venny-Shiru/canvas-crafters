import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWADebugPanel: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        isStandalone: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,
        isInWebAppiOS: (window.navigator as any).standalone === true,
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        hasServiceWorker: 'serviceWorker' in navigator,
        manifestSupported: 'manifest' in window.document.createElement('link'),
      });
    };

    updateDebugInfo();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 PWA: beforeinstallprompt fired!');
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA: App installed!');
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      console.log('Install result:', result);
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  const forceShowInstallInstructions = () => {
    alert(`
PWA Installation Instructions:

For Chrome/Edge Desktop:
1. Click the install icon in the address bar
2. Or use Chrome menu → Install Canvas Crafters

For Chrome Mobile:
1. Tap the menu (3 dots)
2. Select "Install app" or "Add to Home screen"

For Safari iOS:
1. Tap the share button
2. Select "Add to Home Screen"

Note: HTTPS is required for PWA installation in production.
Current protocol: ${window.location.protocol}
    `);
  };

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm z-50">
      <div className="flex items-center space-x-2 mb-3">
        <Download className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">PWA Debug Panel</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Standalone:</span>
          <span className={debugInfo.isStandalone ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.isStandalone ? '✅' : '❌'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>HTTPS:</span>
          <span className={debugInfo.isSecureContext ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.isSecureContext ? '✅' : '❌'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>SW Support:</span>
          <span className={debugInfo.hasServiceWorker ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.hasServiceWorker ? '✅' : '❌'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Install Event:</span>
          <span className={installPrompt ? 'text-green-600' : 'text-orange-600'}>
            {installPrompt ? '✅ Ready' : '⏳ Waiting'}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {installPrompt && (
          <button
            onClick={handleInstall}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Install App
          </button>
        )}
        
        <button
          onClick={forceShowInstallInstructions}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Show Install Instructions
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Protocol: {debugInfo.protocol}
      </div>
    </div>
  );
};

export default PWADebugPanel;
