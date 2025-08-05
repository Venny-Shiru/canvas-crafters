import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Enhanced debugging
    console.log('PWA Install Prompt: Component mounted');
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      console.log('PWA Install Check:', { isStandalone, isInWebAppiOS, isInstalled });
      setIsInstalled(isInstalled);
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Install: beforeinstallprompt event fired!');
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        if (!isInstalled) {
          console.log('PWA Install: Showing install prompt');
          setShowInstallPrompt(true);
        }
      }, 1000); // Reduced delay for testing
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA Install: App installed event fired!');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkIfInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: Check if events are supported
    console.log('PWA Install: Event listeners added');

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error during installation:', error);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if recently dismissed
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt || !deferredPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Install Canvas Crafters
              </h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Get faster access and a better experience with our app!
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-gray-600 dark:text-gray-300 text-sm hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
