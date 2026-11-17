import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ActualDeviceItem } from './types/pricing';
import { DesktopGatekeeper } from './components/DesktopGatekeeper';
import { Header } from './components/Header';
import { BrandSelectionGrid } from './components/BrandSelectionGrid';
import { PriceTable } from './components/PriceTable';
import { QuoteCalculatorModal } from './components/QuoteCalculatorModal';
import { AdminUpdateModal } from './components/AdminUpdateModal';
import { ShareStoreModal } from './components/ShareStoreModal';
import { RecyclingPrecautionsBanner } from './components/RecyclingPrecautionsBanner';
import { downloadStandaloneHtml } from './utils/standaloneHtmlGenerator';
import { ArrowLeft, CheckCircle2, Upload, FileSpreadsheet, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseExcelWorkbookData } from './utils/pricingDataParser';

// Use a fresh clean storage key so any stale preloaded caches are discarded
const STORAGE_KEY = 'MANGO_CUSTOM_UPLOAD_V9';

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
  count: number;
  importedAt?: number;
}

export default function App() {
  // Requirement: 初始畫面應該是空的，沒有手機資訊
  const [devices, setDevices] = useState<ActualDeviceItem[]>([]);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priceDesc' | 'diffDesc' | 'modelAsc'>('priceDesc');

  // Modals & loading states
  const [selectedDevice, setSelectedDevice] = useState<ActualDeviceItem | null>(null);
  const [isAdminUpdateOpen, setIsAdminUpdateOpen] = useState(false);
  const [isShareStoreOpen, setIsShareStoreOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHomeDragOver, setIsHomeDragOver] = useState(false);

  // Clear any existing localStorage data on mount to ensure fresh empty initial state
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('MANGO_CUSTOM_UPLOAD_V9');
      localStorage.removeItem('MANGO_CUSTOM_UPLOAD_V8');
      localStorage.removeItem('MANGO_TRADE_IN_PRICING_V7');
      localStorage.removeItem('MANGO_TRADE_IN_PRICING');
      localStorage.removeItem('MANGO_OFFLINE_PRICING_V7');
      localStorage.removeItem('MANGO_OFFLINE_PRICING_V8');
      localStorage.removeItem('MANGO_TRADE_IN_UPLOADED_V8');
    } catch {
      // ignore
    }
  }, []);

  const lastUpdatedDisplay = useMemo(() => {
    if (!fileMeta) return '尚未更新';
    const d = new Date(fileMeta.lastModified);
    const dateStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${dateStr} ${timeStr}`;
  }, [fileMeta]);

  // Handle Admin Update from Excel File
  const handleAdminUpdate = useCallback(
    (newDevices: ActualDeviceItem[], meta: { name: string; size: number; lastModified: number; count: number; importedAt?: number }) => {
      const fullMeta: FileMetadata = {
        ...meta,
        importedAt: meta.importedAt || Date.now(),
      };
      setDevices(newDevices);
      setFileMeta(fullMeta);
      setSelectedBrand(null);

      const d = new Date(fullMeta.lastModified);
      const dateStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      setToastMessage(`✅ 報價檔案已成功匯入！檔案更新時間：${dateStr}（共收錄 ${newDevices.length} 款機型）`);
      setTimeout(() => setToastMessage(null), 5000);
    },
    []
  );

  // Direct File Upload from Main Home Screen
  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const { items } = parseExcelWorkbookData(workbook);
      if (items.length === 0) {
        setToastMessage('⚠️ 未能在該 Excel 檔案中解析出報價機型資料，請確認工作表格式');
        setTimeout(() => setToastMessage(null), 5000);
        return;
      }
      handleAdminUpdate(items, {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified || Date.now(),
        count: items.length,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '檔案解析錯誤';
      setToastMessage(`❌ 解析失敗：${msg}`);
      setTimeout(() => setToastMessage(null), 5000);
    }
    if (e.target) e.target.value = '';
  };

  // Direct Drag & Drop onto Main Home Screen
  const handleHomeDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHomeDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const { items } = parseExcelWorkbookData(workbook);
      if (items.length === 0) {
        setToastMessage('⚠️ 未能在該 Excel 檔案中解析出報價機型資料，請確認工作表格式');
        setTimeout(() => setToastMessage(null), 5000);
        return;
      }
      handleAdminUpdate(items, {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified || Date.now(),
        count: items.length,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '檔案解析錯誤';
      setToastMessage(`❌ 解析失敗：${msg}`);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Clear database handler (Requirement 3: 要有一個清除上傳資料庫的按鈕)
  const handleClearDatabase = useCallback(() => {
    const confirmed = window.confirm(
      '確定要清除目前已上傳的報價資料庫嗎？\n清除後將恢復為未更新初始狀態，需重新上傳檔案才能查看品牌報價。'
    );
    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('MANGO_TRADE_IN_PRICING_V7');
      localStorage.removeItem('MANGO_TRADE_IN_PRICING');
      localStorage.removeItem('MANGO_OFFLINE_PRICING_V7');
    } catch {
      // ignore
    }

    setDevices([]);
    setFileMeta(null);
    setSelectedBrand(null);
    setSelectedDevice(null);
    setToastMessage('🗑️ 已成功清除報價資料庫，恢復為未更新初始狀態！');
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Filtered devices by selected brand & exact selectedModel or keyword search query
  const filteredDevices = useMemo(() => {
    if (!selectedBrand) return [];
    let result = devices.filter((d) => d.brand === selectedBrand);

    // 1. Exact model filter (from dropdown selection: e.g. iPhone 15 only, NOT iPhone 15 Pro)
    if (selectedModel) {
      const targetExact = selectedModel.trim().toLowerCase();
      result = result.filter(
        (d) => d.model.trim().toLowerCase() === targetExact
      );
    } else if (searchQuery.trim()) {
      // 2. Free keyword search
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.model.toLowerCase().includes(q) ||
          d.capacity.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.maxPriceA - a.maxPriceA);
    } else if (sortBy === 'diffDesc') {
      result.sort((a, b) => b.diffA - a.diffA);
    } else if (sortBy === 'modelAsc') {
      result.sort((a, b) => a.model.localeCompare(b.model, 'zh-TW'));
    }

    return result;
  }, [devices, selectedBrand, selectedModel, searchQuery, sortBy]);

  // Brand display title
  const currentBrandDisplay = useMemo(() => {
    if (!selectedBrand) return '';
    if (selectedBrand === 'APPLE') return 'Apple (iPhone / iPad)';
    if (selectedBrand === 'SAMSUNG') return 'Samsung (Galaxy 系列)';
    if (selectedBrand === 'MI') return '小米 (Xiaomi 徠卡系列)';
    if (selectedBrand === 'moto') return 'Motorola (razr / edge)';
    return selectedBrand;
  }, [selectedBrand]);

  const hasData = devices.length > 0;

  return (
    <DesktopGatekeeper>
      <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-red-950 text-white px-6 py-3.5 rounded-2xl shadow-2xl border-2 border-red-400 flex items-center gap-2.5 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header with Admin Update & Share Store File */}
        <Header
          deviceCount={devices.length}
          lastUpdated={lastUpdatedDisplay}
          hasUpdatedData={hasData}
          onOpenAdminUpdateModal={() => setIsAdminUpdateOpen(true)}
          onOpenShareStoreModal={() => setIsShareStoreOpen(true)}
          onDownloadStandaloneHtml={() => downloadStandaloneHtml(devices, fileMeta || undefined)}
          onClearDatabase={handleClearDatabase}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
          {!hasData ? (
            /* USER REQUIREMENT 2:
               打開網頁時，只要看到(請選擇舊機回收品牌
               點選以下手機品牌，立即查看 點子行動 與 FDI 雙通路完整報價與比價)文字即可，
               下方品牌都先不用露出，要完成資料檔更新才可以揭露新資訊 */
            <div className="space-y-8 max-w-7xl mx-auto py-4">
              {/* Header Title strictly matching user requirement */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  請選擇舊機回收品牌
                </h2>
                <p className="text-base font-medium text-slate-600">
                  點選以下手機品牌，立即查看 點子行動 與 FDI 雙通路完整報價與比價
                </p>
              </div>

              {/* Waiting for file update card with direct upload interaction */}
              <div className="max-w-2xl mx-auto">
                <label
                  htmlFor="home-screen-excel-input"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsHomeDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsHomeDragOver(false);
                  }}
                  onDrop={handleHomeDrop}
                  className={`block bg-white border-2 border-dashed rounded-3xl p-8 text-center shadow-md cursor-pointer transition-all ${
                    isHomeDragOver
                      ? 'border-red-500 bg-red-50 scale-[1.01]'
                      : 'border-slate-300 hover:border-red-500 hover:bg-red-50/20'
                  }`}
                >
                  <input
                    id="home-screen-excel-input"
                    type="file"
                    accept=".xlsx,.xls,.csv,.XLSX,.XLS,.CSV,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*"
                    className="sr-only"
                    onChange={handleDirectFileUpload}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 pointer-events-none">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 pointer-events-none">
                    尚未完成報價資料檔更新
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed pointer-events-none">
                    本系統依規定需先完成最新「舊機回收價格比較.xlsx」資料檔更新後，方會揭露顯示各品牌機型與比價資訊。
                  </p>

                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all pointer-events-none">
                      <Upload className="w-4 h-4" />
                      <span>點擊選取新版「舊機回收價格比較.xlsx」</span>
                    </span>
                  </div>
                </label>
              </div>
            </div>
          ) : !selectedBrand ? (
            /* BRAND SELECTION HOME SCREEN: AFTER DATA FILE UPDATE, BRANDS REVEALED */
            <div>
              {/* Brand Grid */}
              <BrandSelectionGrid
                devices={devices}
                fileMeta={fileMeta}
                onSelectBrand={(brand) => {
                  setSelectedBrand(brand);
                  setSelectedModel(null);
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectModel={(brand, model) => {
                  setSelectedBrand(brand);
                  setSelectedModel(model);
                  setSearchQuery(model);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onShareStoreFile={() => setIsShareStoreOpen(true)}
              />
            </div>
          ) : (
            /* BRAND MODEL LIST & COMPARISON TABLE */
            <div className="space-y-4">
              {/* Back Bar & Controls */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-300 gap-3 flex-wrap">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                      setSelectedModel(null);
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-2 text-sm font-black text-white bg-slate-900 hover:bg-red-600 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:scale-105 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>返回品牌首頁</span>
                  </button>

                  <h2 className="text-2xl font-black text-slate-950">
                    {currentBrandDisplay}
                  </h2>
                  <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    共 <strong className="text-slate-900">{filteredDevices.length}</strong> 款機型
                  </span>
                  {selectedModel && (
                    <span className="text-xs font-black text-red-800 bg-red-100 px-3 py-1 rounded-lg border border-red-300 flex items-center gap-1.5 shadow-2xs">
                      <span>🎯 鎖定機型：{selectedModel}</span>
                      <button
                        onClick={() => {
                          setSelectedModel(null);
                          setSearchQuery('');
                        }}
                        className="text-red-700 hover:text-red-950 font-bold ml-1 cursor-pointer"
                        title="解除鎖定，查看該品牌所有機型"
                      >
                        ✕ 查看全部
                      </button>
                    </span>
                  )}
                  {fileMeta && (
                    <span className="text-xs font-bold text-red-800 bg-red-100 px-3 py-1.5 rounded-lg border border-red-300 font-mono shadow-2xs">
                      📅 檔案更新時間：{lastUpdatedDisplay}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search box for filtering within brand */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        // If user manual edits, release exact locked model
                        if (selectedModel && val !== selectedModel) {
                          setSelectedModel(null);
                        }
                      }}
                      placeholder="搜尋型號、容量..."
                      className="w-48 sm:w-64 pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-2xs"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedModel(null);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 門市舊機回收注意事項 (3大必要檢核項目) */}
              <RecyclingPrecautionsBanner compact />

              {/* Price Table with Clean Model + Capacity */}
              <PriceTable
                devices={filteredDevices}
                onSelectDevice={(device) => setSelectedDevice(device)}
                vendorFilter="ALL"
              />
            </div>
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="font-semibold text-slate-600">
              舊機回收價格比較 (點子行動 vs FDI) · 門市專用即時比價系統 · 半月定期更新
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              電腦網頁版專用 · 平板與手機端受限不可開啟 · 報價以門市系統判定為準
            </div>
          </div>
        </footer>

        {/* Modals */}
        <QuoteCalculatorModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />

        <AdminUpdateModal
          isOpen={isAdminUpdateOpen}
          onClose={() => setIsAdminUpdateOpen(false)}
          onUpdateSuccess={handleAdminUpdate}
          currentDeviceCount={devices.length}
          lastUpdated={lastUpdatedDisplay}
        />

        <ShareStoreModal
          isOpen={isShareStoreOpen}
          onClose={() => setIsShareStoreOpen(false)}
          devices={devices}
          fileMeta={fileMeta}
          lastUpdatedStr={lastUpdatedDisplay}
        />
      </div>
    </DesktopGatekeeper>
  );
}
