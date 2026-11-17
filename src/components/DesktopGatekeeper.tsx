import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, AlertTriangle } from 'lucide-react';

interface DesktopGatekeeperProps {
  children: React.ReactNode;
}

export const DesktopGatekeeper: React.FC<DesktopGatekeeperProps> = ({ children }) => {
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
    const detectNonDesktop = () => {
      const ua = navigator.userAgent || '';

      // 1. Mobile Phone & Tablet User-Agent detection:
      // Covers iPhone, iPad, iPod, Android phones, Android tablets, BlackBerry, Kindle, Silk, etc.
      const isMobileOrTabletUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle|PlayBook/i.test(
          ua
        );

      // 2. iPadOS detection:
      // Modern iPads identify as Macintosh in UA, but have maxTouchPoints > 1
      const isIPadOS =
        navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

      // 3. User-Agent Client Hints (Chromium Android phones and tablets)
      const isClientHintMobile = Boolean(
        (navigator as unknown as { userAgentData?: { mobile?: boolean } })?.userAgentData?.mobile
      );

      // 4. Coarse pointer (touchscreen only devices like tablets/phones without fine mouse pointer)
      const isCoarseTouchOnly =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches &&
        !window.matchMedia('(pointer: fine)').matches;

      // 5. Screen width safety check for small/medium mobile/tablet viewports with touch
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrowTouchScreen = window.innerWidth < 1024 && isTouchDevice;

      // Block if detected as mobile phone, iPad, tablet, or touch-only device
      if (
        isMobileOrTabletUA ||
        isIPadOS ||
        isClientHintMobile ||
        isCoarseTouchOnly ||
        isNarrowTouchScreen
      ) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    };

    detectNonDesktop();
    window.addEventListener('resize', detectNonDesktop);
    return () => window.removeEventListener('resize', detectNonDesktop);
  }, []);

  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-99999 bg-slate-950 text-white flex items-center justify-center p-6 selection:bg-red-500">
        <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-7 text-center space-y-6 shadow-2xl">
          {/* Animated Warning Icon */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
            <div className="relative w-18 h-18 bg-rose-500/20 border-2 border-rose-500 rounded-2xl flex items-center justify-center text-rose-400 shadow-lg">
              <div className="flex items-center -space-x-1.5">
                <Tablet className="w-8 h-8" />
                <Smartphone className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black tracking-wider uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>裝置受限 · 平板與手機無法開啟</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              限定電腦網頁版開啟
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              因雙通路（點子行動 vs FDI）完整規格與多等級即時比價表格需於寬螢幕電腦環境顯示以利前線精確報價，本系統限制無法於平板或手機端開啟。
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-black">
              <Monitor className="w-4 h-4 shrink-0" />
              <span>請使用門市公務電腦或筆記型電腦：</span>
            </div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside leading-relaxed pl-1">
              <li>於桌上型電腦或筆電瀏覽器打開本網址</li>
              <li>或雙擊執行「舊機回收即時報價系統_單機版.html」</li>
            </ul>
          </div>

          <div className="text-[11px] text-slate-500">
            門市舊機回收專用系統 · 電腦網頁版限定
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
