import React from 'react';
import {
  FileSpreadsheet,
  MonitorCheck,
  Upload,
  Share2,
} from 'lucide-react';

interface HeaderProps {
  deviceCount: number;
  lastUpdated: string;
  hasUpdatedData: boolean;
  onOpenAdminUpdateModal: () => void;
  onOpenShareStoreModal?: () => void;
  onDownloadStandaloneHtml?: () => void;
  onClearDatabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  deviceCount,
  lastUpdated,
  hasUpdatedData,
  onOpenAdminUpdateModal,
  onOpenShareStoreModal,
}) => {
  return (
    <header className="bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b-2 border-indigo-900/50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg border border-red-400/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>舊機回收即時報價平台</span>
              {hasUpdatedData ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/30">
                  ● 報價庫已更新
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  待更新檔案
                </span>
              )}
            </h1>
            <div className="text-xs text-slate-300 font-medium flex items-center gap-2 mt-0.5">
              <span>門市專用即時比價系統</span>
              <span className="text-slate-500">·</span>
              <span className="text-red-300 font-bold">半月定期維護更新</span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Computer Indicator & Update Status */}
        <div className="hidden lg:flex items-center gap-2.5 bg-black/40 px-4 py-2 rounded-xl border border-white/10 text-xs">
          <MonitorCheck className="w-4 h-4 text-red-400 shrink-0" />
          {hasUpdatedData ? (
            <>
              <span className="text-slate-300">
                電腦版專用 · 已收錄 <strong className="text-red-300">{deviceCount}</strong> 款機型最新雙通路底價
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-red-300 font-mono text-xs font-bold">
                檔案更新時間：{lastUpdated}
              </span>
            </>
          ) : (
            <span className="text-amber-300 font-medium">
              電腦版專用 · 尚未更新報價檔，請先選取新版報價檔
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {!hasUpdatedData ? (
            <button
              type="button"
              onClick={onOpenAdminUpdateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl transition-all shadow-md hover:scale-105 cursor-pointer text-white bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-2 border-red-400 animate-pulse"
              title="更新 Excel 報價庫"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>更新報價庫</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenShareStoreModal && (
                <button
                  type="button"
                  onClick={onOpenShareStoreModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-sm hover:scale-105 cursor-pointer text-white bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-400"
                  title="分享門市專用檔案 (已完成吃檔)"
                >
                  <Share2 className="w-3.5 h-3.5 text-white" />
                  <span>📤 分享門市專用檔 (已吃檔)</span>
                </button>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-950/80 border border-red-500/40 rounded-xl text-xs font-bold text-red-300 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-slate-300 font-normal">檔案更新：</span>
                <span className="font-mono text-white font-extrabold">{lastUpdated}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
