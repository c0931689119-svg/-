import React, { useState, useRef } from 'react';
import {
  HardDrive,
  Copy,
  Check,
  FolderOpen,
  Zap,
  Building2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface LaunchHubProps {
  designatedPath: string;
  onLaunchImport: () => void;
  onFileSelected?: (file: File) => void;
  isLoading: boolean;
}

export const LaunchHub: React.FC<LaunchHubProps> = ({
  designatedPath,
  onLaunchImport,
  onFileSelected,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPasteTip, setShowPasteTip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeCopyPath = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(designatedPath);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // ignore
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = designatedPath;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePrimaryConnect = async () => {
    // 1. Safe copy to clipboard in background (never throws error)
    safeCopyPath();
    // 2. Immediately execute genuine 1-click connection and Excel parsing
    onLaunchImport();
  };

  const handleOpenFileDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    safeCopyPath();
    setShowPasteTip(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const validateAndProcessFile = (file: File) => {
    const name = file.name.trim();
    if (!name.includes('舊機回收價格比較')) {
      alert(
        `❌ 檔案選取錯誤！您選取的檔案為「${file.name}」。\n系統已嚴格鎖定指定來源，僅能載入指定路徑之「舊機回收價格比較.xlsx」，無法選擇其他無關檔案。\n\n請於檔案選取視窗的檔名欄位直接按 Ctrl + V 貼上指定路徑並按 Enter 選取「舊機回收價格比較.xlsx」！`
      );
      return;
    }
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Hero Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`bg-linear-to-b from-white to-slate-50 border-2 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6 relative overflow-hidden transition-all ${
          isDragOver
            ? 'border-red-500 ring-4 ring-red-400/30 bg-red-50/20'
            : 'border-indigo-200/80'
        }`}
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-red-500 via-blue-500 to-indigo-600" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300 font-bold text-xs uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span>系統待命狀態 · 預設尚未載入資料</span>
        </div>

        {/* Big Heading with Enhanced Typography */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            舊機回收雙通路即時報價平台
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto font-medium">
            依系統安全規範，預設不顯示資料。請點選下方按鈕連線讀取指定路徑之最新報價 Excel 檔案。
          </p>
        </div>

        {/* Designated Path Display Card */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 max-w-2xl mx-auto border border-slate-800 shadow-inner text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <HardDrive className="w-4 h-4 text-red-400" />
              <span>唯一指定資料來源路徑（真實連線讀取）：</span>
            </span>
            <button
              onClick={safeCopyPath}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製路徑</span>
                </>
              )}
            </button>
          </div>
          <code className="block font-mono text-xs sm:text-sm text-red-300 font-semibold break-all bg-black/50 p-3 rounded-xl border border-white/10 select-all leading-relaxed">
            {designatedPath}
          </code>
        </div>

        {/* Path Paste Tip Banner when Dialog Opens */}
        {showPasteTip && (
          <div className="bg-red-50 border-2 border-red-400 text-red-950 p-4 rounded-2xl max-w-2xl mx-auto text-left flex items-start gap-3 shadow-md animate-in fade-in duration-200">
            <Check className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="text-sm font-black text-red-900">
                已自動為您複製指定路徑！
              </strong>
              <p className="leading-relaxed">
                在剛彈出的 Windows 檔案選取視窗下方【<strong>檔案名稱</strong>】處，直接按「<strong>Ctrl + V</strong>」貼上並按 Enter，即可直接開啟該網路路徑的「舊機回收價格比較.xlsx」！
              </p>
            </div>
          </div>
        )}

        {/* ACTION BUTTON: Real File Fetch Only */}
        <div className="pt-2 flex flex-col items-center justify-center gap-3.5 max-w-xl mx-auto">
          {/* PRIMARY: 1-Click Connect and parse designated file */}
          <button
            onClick={handlePrimaryConnect}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-linear-to-r from-red-600 via-rose-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>正在連線讀取並解析「舊機回收價格比較.xlsx」中...</span>
              </>
            ) : (
              <>
                <FolderOpen className="w-6 h-6 text-yellow-300" />
                <span>一鍵連線套入指定路徑檔案</span>
              </>
            )}
          </button>

          <div className="flex flex-col items-center gap-1.5 text-xs text-slate-500 font-medium text-center">
            <div>
              已鎖定唯一檔案：<strong className="text-red-700">舊機回收價格比較.xlsx</strong>（僅允許套入指定路徑檔案）
            </div>
            <button
              type="button"
              onClick={handleOpenFileDialog}
              className="text-slate-500 hover:text-red-700 underline font-semibold flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <FolderOpen className="w-3.5 h-3.5 text-red-600" />
              <span>若欲從公務電腦本機/網路共用磁碟手動瀏覽選取，請點此開啟檔案視窗</span>
            </button>
          </div>
        </div>

        {/* 3 Colorful Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 text-left">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="font-bold text-red-950 flex items-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4 text-red-700" />
              <span>點子行動 (愛鋒派)</span>
            </div>
            <p className="text-xs text-red-800 mt-1">完整 A / B / C 等級門市回收底價與即時評級</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>FutureDial (FDI)</span>
            </div>
            <p className="text-xs text-blue-800 mt-1">包含 S / A / B / C 等級與各款原廠機況標準</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <span>智慧最佳推薦</span>
            </div>
            <p className="text-xs text-amber-800 mt-1">兩家通路即時利差對比，一秒看出最高回收商</p>
          </div>
        </div>
      </div>
    </div>
  );
};
