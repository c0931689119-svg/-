import React, { useRef, useState } from 'react';
import {
  X,
  HardDrive,
  FolderOpen,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { FileSyncState } from '../types/pricing';

interface PathSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: FileSyncState;
  onUploadFile: (file: File) => void;
  onSelectViaFilePicker: () => void;
  isLoading: boolean;
  errorMsg: string | null;
}

export const PathSyncModal: React.FC<PathSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onUploadFile,
  onSelectViaFilePicker,
  isLoading,
  errorMsg,
}) => {
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const copyPath = () => {
    navigator.clipboard.writeText(syncState.designatedPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onUploadFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-red-400" />
            <h3 className="font-bold text-sm">指定路徑報價同步</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Strictly locked designated path */}
          <div>
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span>唯一指定檔案路徑：</span>
              <button
                onClick={copyPath}
                className="text-red-700 hover:text-red-800 flex items-center gap-1"
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
            <code className="block bg-slate-900 text-red-300 p-3 rounded-lg font-mono text-xs break-all select-all">
              {syncState.designatedPath}
            </code>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Single Action Button */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
            <p className="text-slate-600">
              點擊下方按鈕，直接選取該路徑之「<strong>舊機回收價格比較.xlsx</strong>」完成更新：
            </p>

            <button
              onClick={onSelectViaFilePicker}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FolderOpen className="w-4 h-4" />
              )}
              <span>讀取指定路徑檔案進行更新</span>
            </button>
          </div>

          {/* Drag & Drop strictly for 舊機回收價格比較.xlsx */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-red-500 bg-red-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleInputChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-slate-700">
              或將「舊機回收價格比較.xlsx」拖曳至此處套入
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              系統將自動讀取點子行動與 FDI 最新報價
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
