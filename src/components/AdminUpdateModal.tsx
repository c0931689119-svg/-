import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  AlertCircle,
  Upload,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ActualDeviceItem } from '../types/pricing';
import { parseExcelWorkbookData } from '../utils/pricingDataParser';

interface AdminUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: (
    devices: ActualDeviceItem[],
    meta: { name: string; size: number; lastModified: number; count: number }
  ) => void;
  currentDeviceCount: number;
  lastUpdated: string;
}

export const AdminUpdateModal: React.FC<AdminUpdateModalProps> = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  currentDeviceCount,
  lastUpdated,
}) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSuccessUpdated, setIsSuccessUpdated] = useState(false);
  const [updatedMeta, setUpdatedMeta] = useState<{
    name: string;
    count: number;
    lastModified?: number;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatDateTime = (ts?: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day} ${hh}:${mm}`;
  };

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setIsParsing(true);
    setErrorMsg('');
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const { items } = parseExcelWorkbookData(workbook);

      if (items.length === 0) {
        throw new Error(
          '未能在上傳的 Excel 檔案中解析出「舊機回收價格」報價機型資料，請確認工作表內容是否包含品牌、機款與報價金額。'
        );
      }

      const meta = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified || Date.now(),
        count: items.length,
      };

      // Automatically apply update immediately upon upload
      onUpdateSuccess(items, meta);
      setUpdatedMeta({
        name: file.name,
        count: items.length,
        lastModified: meta.lastModified,
      });
      setIsSuccessUpdated(true);
      setIsParsing(false);
    } catch (err: unknown) {
      setIsParsing(false);
      const msg =
        err instanceof Error
          ? err.message
          : '檔案解析錯誤，請確認上傳有效的 Excel (.xlsx / .xls) 檔案';
      setErrorMsg(msg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleModalClose = () => {
    setErrorMsg('');
    setIsSuccessUpdated(false);
    setUpdatedMeta(null);
    onClose();
  };

  const fileInputId = 'admin-modal-excel-file-picker';

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-indigo-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">
                報價庫半月定期更新
              </h3>
              <p className="text-xs text-slate-400">
                直接上傳「舊機回收價格比較.xlsx」· 免密碼快速更新
              </p>
            </div>
          </div>
          {!isSuccessUpdated && (
            <button
              type="button"
              onClick={handleModalClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* USER REQUIREMENT 1:
              在使用更新報價庫時完成上傳，只需剩下一個按鈕(關閉視窗)即可，不用有其他功能 */}
          {isSuccessUpdated && updatedMeta ? (
            <div className="p-6 bg-red-50 border-2 border-red-400 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-red-950">
                  報價庫已成功更新！
                </h4>
                <p className="text-xs text-red-800 font-medium">
                  已完成匯入「{updatedMeta.name}」，共收錄{' '}
                  <strong className="text-red-950 font-black">
                    {updatedMeta.count} 款機型
                  </strong>{' '}
                  最新雙通路底價。
                </p>
                {updatedMeta.lastModified && (
                  <p className="text-xs font-bold text-red-950 bg-red-100 py-1.5 px-3 rounded-lg border border-red-300 font-mono inline-block">
                    📅 檔案更新時間：{formatDateTime(updatedMeta.lastModified)}
                  </p>
                )}
                <p className="text-[11px] text-red-700 pt-1">
                  系統已解鎖各手機品牌報價與比價卡片，請點選下方按鈕返回主畫面查看！
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm shadow-md shadow-red-700/20 transition-all cursor-pointer"
                >
                  關閉視窗
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Status info */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1 text-xs text-slate-600">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-red-600" />
                  <span>現行報價狀態</span>
                </div>
                <p>
                  收錄最新雙通路（點子行動 vs FDI）底價比價資料。每半個月更新報價檔案時，請直接選取或拖曳新版 Excel 檔案進行套用。
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  目前線上資料：
                  {currentDeviceCount > 0
                    ? `收錄 ${currentDeviceCount} 款機型 · 上次更新：${lastUpdated}`
                    : '尚未更新檔案'}
                </div>
              </div>

              {/* Upload Dropzone using NATIVE LABEL (100% reliable click in all browsers & iframes) */}
              <label
                htmlFor={fileInputId}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(false);
                }}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-red-500 bg-red-50 scale-[1.01]'
                    : 'border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/30'
                }`}
              >
                {/* Native hidden file input linked by htmlFor */}
                <input
                  id={fileInputId}
                  type="file"
                  accept=".xlsx,.xls,.csv,.XLSX,.XLS,.CSV,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*"
                  className="sr-only"
                  onChange={handleFileChange}
                />

                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2 pointer-events-none">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-black text-slate-800 pointer-events-none">
                  點擊此處選取 或 拖曳新版「舊機回收價格比較.xlsx」至此
                </div>
                <p className="text-xs text-slate-500 mt-1 pointer-events-none">
                  支援 Microsoft Excel 活頁簿 (.xlsx / .xls / .csv) · 免密碼即時匯入
                </p>

                <div className="mt-4 pointer-events-none">
                  <span className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-xs">
                    選取本機電腦檔案上傳
                  </span>
                </div>
              </label>

              {isParsing && (
                <div className="p-4 bg-slate-50 border rounded-2xl text-center space-y-2 text-xs font-bold text-slate-600">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-red-600" />
                  <div>正在讀取並解析 Excel 各品牌報價資料中...</div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>上傳解析提示：</span>
                  </div>
                  <div className="text-rose-700 font-normal pl-6">
                    {errorMsg}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccessUpdated && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>每半月定時維護 · 即時匯入雙通路報價</span>
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors cursor-pointer"
            >
              取消關閉
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
