import React from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Zap, 
  WifiOff, 
  Compass, 
  Share2, 
  PlusSquare, 
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInstallModal: React.FC<AppInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-modal-backdrop">
      <div 
        className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-app-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 relative flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Close install modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-2 shadow-xl ring-4 ring-emerald-500/30 mb-3 flex items-center justify-center">
            <img src="/icon.svg" alt="FUNAAB Map App Icon" className="w-16 h-16 object-contain" />
          </div>

          <h3 id="install-app-title" className="text-lg font-black tracking-tight">
            Install FUNAAB Map
          </h3>
          <p className="text-xs text-emerald-200/90 mt-1 max-w-xs">
            Add to your home screen for instant 1-tap campus navigation & offline maps
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-5 flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-slate-700/60">
              <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  100% Offline Capability
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Navigate seamlessly even when mobile data or network is poor in lecture halls.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-slate-700/60">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 flex-shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Live GPS Blue Dot & Turns
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Real-time turn chimes, distance meters, and compass bearing directly on campus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-slate-700/60">
              <div className="p-2 rounded-xl bg-teal-600 text-white flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Zero App Store Hassle
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Takes less than 2 MB of storage, launches instantly, and stays up-to-date automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Action / Instructions depending on OS */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center flex flex-col items-center gap-1.5">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                FUNAAB Map is already installed on this device!
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Open it anytime from your mobile home screen or app launcher.
              </p>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-700/20 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 animate-bounce" />
              Install FUNAAB Map Now
            </button>
          ) : isIOS ? (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                How to install on iPhone & iPad (Safari):
              </h5>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside pl-1">
                <li>
                  Tap the <span className="font-semibold text-emerald-600 dark:text-emerald-400">Share icon</span>{' '}
                  <Share2 className="inline w-3.5 h-3.5 mx-0.5 text-slate-500" /> at the bottom of Safari.
                </li>
                <li>
                  Scroll down the share sheet and tap{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Add to Home Screen"</span>{' '}
                  <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-slate-500" />.
                </li>
                <li>
                  Tap <span className="font-bold text-emerald-600 dark:text-emerald-400">Add</span> in the top right corner.
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Install via Browser Menu:
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tap your browser menu (<strong>⋮</strong> three dots) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official PWA • 100% Free for FUNAABites</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
