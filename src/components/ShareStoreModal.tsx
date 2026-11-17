import React, { useState } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  FileCode2,
  CheckCircle2,
  Sparkles,
  Laptop,
  ShieldCheck,
  Clock,
  Smartphone,
} from 'lucide-react';
import { ActualDeviceItem } from '../types/pricing';
import { downloadStandaloneHtml, generateStoreShareText } from '../utils/standaloneHtmlGenerator';

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: ActualDeviceItem[];
  fileMeta?: {
    name: string;
    size: number;
    lastModified: number;
    count: number;
    importedAt?: number;
  } | null;
  lastUpdatedStr: string;
}

export const ShareStoreModal: React.FC<ShareStoreModalProps> = ({
  isOpen,
  onClose,
  devices,
  fileMeta,
  lastUpdatedStr,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fileName = '舊機回收即時報價系統_門市專用版(已完成吃檔).html';
  const shareText = generateStoreShareText(
    devices.length,
    lastUpdatedStr,
    fileMeta?.name
  );

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownload = async () => {
    if (!devices || devices.length === 0) {
      setErrorMsg('⚠️ 目前尚未匯入任何報價機型資料，請先上傳 Excel 檔案後再下載門市版！');
      return;
    }
    setDownloading(true);
    setErrorMsg(null);
    try {
      await downloadStandaloneHtml(devices, fileMeta || undefined, fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: unknown) {
      console.error('Download error:', err);
      const msg = err instanceof Error ? err.message : '下載門市檔案時發生異常';
      setErrorMsg(`❌ 下載失敗：${msg}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-red-950 text-white px-7 py-5 flex items-center justify-between border-b border-red-500/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 border border-red-400/30 flex items-center justify-center shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  分享門市專用檔案
                </h3>
                <span className="text-[11px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">
                  已完成吃檔
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                此檔案已完整內建最新報價 · 門市雙擊開啟即可即時查詢 · 免再匯入資料
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl p-4 text-xs font-black flex items-center justify-between gap-3 animate-in fade-in">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-rose-500 hover:text-rose-800 text-sm font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Status banner */}
          <div className="bg-linear-to-r from-red-50 via-rose-50 to-slate-50 border-2 border-red-400/70 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-red-900 bg-red-200/80 px-2.5 py-0.5 rounded-full">
                    ● 門市開箱即用檔
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {fileName}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900">
                  雙通路最新回收報價已 100% 寫入單機 HTML 檔
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>報價時間：<strong className="text-slate-900 font-mono">{lastUpdatedStr}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>收錄機型：<strong className="text-slate-900">{devices.length} 款</strong> (由多到少排序)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Major Store Guarantees */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>門市專用檔案三大特性</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-red-700 font-black text-xs mb-1.5">
                  <Laptop className="w-4 h-4 shrink-0 text-red-600" />
                  <span>雙擊即開即用</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  門市免裝軟體、免聯網、免資料庫，直接用 Chrome / Edge 瀏覽器雙擊即可開啟。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-red-700 font-black text-xs mb-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-red-600" />
                  <span>已完成吃檔</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  所有最新價格已封裝在內，開啟後直接顯示品牌與比價，不需門市再次匯入 Excel。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-red-700 font-black text-xs mb-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-red-600" />
                  <span>防呆純淨介面</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  已自動隱藏「更新報價庫」與「清除資料庫」按鈕，避免門市人員誤按。
                </p>
              </div>
            </div>
          </div>

          {/* Announcement text preview for LINE / Mail */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-500 flex items-center gap-1.5">
                <span>📋 門市發送公告範本 (可複製貼到 LINE 門市群或 Email)</span>
              </h4>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-red-600" />
                    <span>已複製！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>一鍵複製說明文</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-xl font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-36 overflow-y-auto selection:bg-red-500 selection:text-white">
              {shareText}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-7 py-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>點擊下方按鈕即可下載已完成吃檔的 HTML 檔案發送給門市</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors"
            >
              關閉
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>封裝檔案中...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-red-200" />
                  <span>已完成下載！</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>📥 一鍵下載門市專用檔案 (.html)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
