import React, { useRef, useState } from 'react';
import {
  HardDrive,
  FolderOpen,
  Upload,
  FileSpreadsheet,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface UnloadedLandingProps {
  designatedPath: string;
  onSelectFile: () => void;
  onUploadFile: (file: File) => void;
  isLoading: boolean;
  errorMsg: string | null;
}

export const UnloadedLanding: React.FC<UnloadedLandingProps> = ({
  designatedPath,
  onSelectFile,
  onUploadFile,
  isLoading,
  errorMsg,
}) => {
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyPath = () => {
    navigator.clipboard.writeText(designatedPath);
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
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Vibrant Gradient Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-red-500 p-8 text-white text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-white shadow-lg">
            <FileSpreadsheet className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            舊機回收即時報價平台
          </h2>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            系統目前處於未載入狀態。請啟動連結匯入指定 Excel 報價檔以開始作業。
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 space-y-8">
          {/* Path Information Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
              <span className="flex items-center gap-1.5 text-sm">
                <HardDrive className="w-4 h-4 text-red-400" />
                <span>唯一指定來源路徑</span>
              </span>
              <button
                onClick={copyPath}
                className="hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 bg-white/10 rounded-md"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-300">已複製路徑</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製路徑</span>
                  </>
                )}
              </button>
            </div>

            <code className="block bg-black/50 text-red-300 p-4 rounded-xl font-mono text-sm break-all select-all border border-red-500/30">
              {designatedPath}
            </code>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-center gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {/* Action 1: Big Connect Button */}
          <div className="text-center space-y-4">
            <button
              onClick={onSelectFile}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <FolderOpen className="w-6 h-6" />
              )}
              <span>啟動連線並匯入指定檔案</span>
            </button>
            <p className="text-xs text-slate-400">
              點擊後選取上述路徑中的「舊機回收價格比較.xlsx」，系統將即時載入最新報價
            </p>
          </div>

          {/* Action 2: Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-red-500 bg-red-50 scale-102'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              或直接將「舊機回收價格比較.xlsx」拖曳至此處
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              每次匯入新檔案皆會自動徹底覆蓋清除前次舊資料，確保報價絕對即時準確
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
