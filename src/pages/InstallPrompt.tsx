import React, { useEffect, useState } from 'react';
import { X, Download, AlertTriangle } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showStandaloneWarning, setShowStandaloneWarning] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed and running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;

    if (isStandalone || isIOSStandalone) {
      return; // Running as PWA - everything is fine
    }

    // Check if app was "installed" but user is still in browser
    const wasInstalled = localStorage.getItem('pwa-was-installed');
    if (wasInstalled) {
      // User installed but opened in browser - show warning
      const timer = setTimeout(() => setShowStandaloneWarning(true), 2000);
      return () => clearTimeout(timer);
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    if (dismissedTime > oneDayAgo) {
      return; // User dismissed within last 24 hours
    }

    // Show prompt after 5 seconds
    const timer = setTimeout(() => setShowPrompt(true), 5000);

    // Listen for install prompt event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome - trigger native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
        localStorage.setItem('pwa-was-installed', 'true');
        localStorage.removeItem('pwa-install-dismissed');

        // Show success message
        alert('התקנה הושלמה! כעת פתח את האפליקציה מסמל מסך הבית (לא מהדפדפן)');
      }
      setDeferredPrompt(null);
    } else {
      // iOS or unsupported browser - show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('להתקנה:\n1. לחץ על כפתור השיתוף (⬆️) למטה\n2. גלול למטה ובחר "הוסף למסך הבית"\n3. לחץ "הוסף"\n4. פתח מסמל מסך הבית (לא מהדפדפן!)');
      } else {
        alert('להתקנה:\n1. לחץ על תפריט הדפדפן (⋮)\n2. בחר "התקן אפליקציה"\n3. פתח מסמל מסך הבית (לא מהדפדפן!)');
      }
      setShowPrompt(false);
      localStorage.setItem('pwa-was-installed', 'true');
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleDismissWarning = () => {
    setShowStandaloneWarning(false);
    localStorage.setItem('standalone-warning-dismissed', Date.now().toString());
  };

  // Show warning if user installed but opened in browser
  if (showStandaloneWarning) {
    return (
      <div
        className="fixed bottom-4 left-4 right-4 z-[9999] bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-2xl p-4"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <button
          onClick={handleDismissWarning}
          className="absolute top-2 left-2 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <AlertTriangle className="w-6 h-6 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">⚠️ פתח מסמל מסך הבית!</h3>
            <p className="text-sm text-white/90 mb-2">
              האפליקציה מותקנת, אבל אתה פותח אותה מהדפדפן.
            </p>
            <p className="text-sm text-white/90 font-semibold">
              📱 לחוויה מלאה: סגור את הדפדפן ופתח את האפליקציה מסמל מסך הבית
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showPrompt) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[9999] bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl p-4"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 left-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <Download className="w-6 h-6 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">התקן את האפליקציה</h3>
          <p className="text-sm text-white/90 mb-3">
         !קבל חוויה מלאה ללא סרגל כתובת - האפליקציה תפתח כמו אפליקציה רגילה
          </p>
          <button
            onClick={handleInstall}
            className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
          >
            התקן עכשיו
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;