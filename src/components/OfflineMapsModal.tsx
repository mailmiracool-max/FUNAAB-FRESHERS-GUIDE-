import React, { useState, useEffect } from 'react';
import { 
  CloudOff, 
  Download, 
  Check, 
  Trash2, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  X, 
  Sparkles, 
  MapPin, 
  Eye, 
  RefreshCw,
  Info,
  ShieldCheck
} from 'lucide-react';
import { 
  CAMPUS_REGIONS, 
  CampusRegion, 
  CachedRegionMeta, 
  getSavedRegionsMeta, 
  saveRegionOffline, 
  removeRegionOffline, 
  clearAllOfflineMaps, 
  getTotalOfflineStorageUsedMB 
} from '../utils/offlineMapManager';

interface OfflineMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  isOnline: boolean;
  onHighlightRegion: (region: CampusRegion) => void;
}

export const OfflineMapsModal: React.FC<OfflineMapsModalProps> = ({
  isOpen,
  onClose,
  isOfflineMode,
  setIsOfflineMode,
  isOnline,
  onHighlightRegion,
}) => {
  const [cachedMeta, setCachedMeta] = useState<Record<string, CachedRegionMeta>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [storageMB, setStorageMB] = useState<number>(0);

  const refreshMeta = () => {
    setCachedMeta(getSavedRegionsMeta());
    setStorageMB(getTotalOfflineStorageUsedMB());
  };

  useEffect(() => {
    if (isOpen) {
      refreshMeta();
    }
  }, [isOpen]);

  const handleDownloadRegion = async (region: CampusRegion) => {
    try {
      setDownloadingId(region.id);
      setDownloadProgress(10);
      await saveRegionOffline(region.id, (p) => setDownloadProgress(p));
      refreshMeta();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    await removeRegionOffline(regionId);
    refreshMeta();
  };

  const handleDownloadAll = async () => {
    for (const region of CAMPUS_REGIONS) {
      if (!cachedMeta[region.id]) {
        await handleDownloadRegion(region);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Remove all cached campus offline maps? You can re-download anytime.')) {
      await clearAllOfflineMaps();
      refreshMeta();
    }
  };

  if (!isOpen) return null;

  const totalSavedCount = Object.keys(cachedMeta).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-modal-backdrop">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <CloudOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Offline Campus Maps
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {totalSavedCount}/{CAMPUS_REGIONS.length} Saved
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save regions to navigate Alabata campus without internet connection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network & Storage Summary Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Offline Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isOnline ? 'Online (Connected)' : 'Offline (No Internet)'}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Simulate Offline Mode:
              </span>
              <input
                type="checkbox"
                checked={isOfflineMode}
                onChange={(e) => setIsOfflineMode(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Storage & Quick Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-mono">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              {storageMB} MB stored
            </span>

            {totalSavedCount < CAMPUS_REGIONS.length && (
              <button
                onClick={handleDownloadAll}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3 h-3" />
                Save All
              </button>
            )}

            {totalSavedCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
              >
                Clear Cache
              </button>
            )}
          </div>
        </div>

        {/* Region List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex flex-col gap-3">
            {CAMPUS_REGIONS.map((region) => {
              const isCached = !!cachedMeta[region.id];
              const isDownloading = downloadingId === region.id;
              const meta = cachedMeta[region.id];

              return (
                <div
                  key={region.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                    isCached
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: region.highlightColor }}></span>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {region.name}
                        </h4>
                        {isCached && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Offline Ready
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                        {region.tagline}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>{region.buildingIds.length} Buildings</span>
                        <span>•</span>
                        <span>~{region.estimatedSizeMB} MB</span>
                        {meta && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400">Cached on {meta.savedAt}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          onHighlightRegion(region);
                          onClose();
                        }}
                        title="Highlight region bounds on map"
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isCached ? (
                        <button
                          onClick={() => handleDeleteRegion(region.id)}
                          title="Remove from offline cache"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadRegion(region)}
                          disabled={isDownloading}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition disabled:opacity-60 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {isDownloading ? 'Saving...' : 'Save Offline'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar during download */}
                  {isDownloading && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-200"
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Notes */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cached regions support full GPS location tracking &amp; turn directions without cellular service.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
