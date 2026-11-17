import React from 'react';
import { ActualDeviceItem } from '../types/pricing';
import { ArrowRight, CalendarClock, Share2, CheckCircle2 } from 'lucide-react';
import { RecyclingPrecautionsBanner } from './RecyclingPrecautionsBanner';

interface BrandSelectionGridProps {
  devices: ActualDeviceItem[];
  onSelectBrand: (brand: string) => void;
  onSelectModel?: (brand: string, model: string) => void;
  fileMeta?: {
    name: string;
    size: number;
    lastModified: number;
    count: number;
    importedAt?: number;
  } | null;
  onShareStoreFile?: () => void;
}

interface BrandTheme {
  key: string;
  displayName: string;
  description: string;
  cardBg: string;
  badgeBg: string;
  borderHover: string;
  priceColor: string;
}

const BRAND_THEMES: BrandTheme[] = [
  {
    key: 'APPLE',
    displayName: 'Apple',
    description: 'iPhone 13 ~ 17 系列、iPad Pro / Air / mini',
    cardBg: 'from-slate-900 to-slate-800 text-white',
    badgeBg: 'bg-white/10 text-white',
    borderHover: 'hover:border-slate-500 hover:ring-2 hover:ring-slate-400/30',
    priceColor: 'text-red-400',
  },
  {
    key: 'SAMSUNG',
    displayName: 'Samsung 三星',
    description: 'Galaxy S25 ~ S20、Z Fold / Flip、A系列',
    cardBg: 'from-blue-900 to-indigo-900 text-white',
    badgeBg: 'bg-blue-400/20 text-blue-200',
    borderHover: 'hover:border-blue-400 hover:ring-2 hover:ring-blue-400/30',
    priceColor: 'text-amber-300',
  },
  {
    key: 'Google',
    displayName: 'Google',
    description: 'Pixel 9 ~ 5 系列、Pro Fold 摺疊機',
    cardBg: 'from-amber-600 to-rose-600 text-white',
    badgeBg: 'bg-white/20 text-white',
    borderHover: 'hover:border-amber-300 hover:ring-2 hover:ring-amber-400/30',
    priceColor: 'text-yellow-200',
  },
  {
    key: 'ASUS',
    displayName: 'ASUS 華碩',
    description: 'ROG Phone 9 ~ 5、Zenfone 12 ~ 7',
    cardBg: 'from-red-900 to-neutral-900 text-white',
    badgeBg: 'bg-red-500/20 text-red-200',
    borderHover: 'hover:border-red-400 hover:ring-2 hover:ring-red-400/30',
    priceColor: 'text-red-300',
  },
  {
    key: 'OPPO',
    displayName: 'OPPO',
    description: 'Reno 15 ~ 5 系列、Find X8 / X3',
    cardBg: 'from-red-800 to-rose-900 text-white',
    badgeBg: 'bg-red-400/20 text-red-200',
    borderHover: 'hover:border-red-300 hover:ring-2 hover:ring-red-400/30',
    priceColor: 'text-red-300',
  },
  {
    key: 'vivo',
    displayName: 'vivo',
    description: 'X300 ~ X80 蔡司旗艦、V60 ~ V21 系列',
    cardBg: 'from-sky-800 to-blue-900 text-white',
    badgeBg: 'bg-sky-400/20 text-sky-200',
    borderHover: 'hover:border-sky-300 hover:ring-2 hover:ring-sky-400/30',
    priceColor: 'text-cyan-300',
  },
  {
    key: 'moto',
    displayName: 'Motorola',
    description: 'razr 60 ~ 40 摺疊、edge 系列',
    cardBg: 'from-purple-900 to-indigo-950 text-white',
    badgeBg: 'bg-purple-400/20 text-purple-200',
    borderHover: 'hover:border-purple-300 hover:ring-2 hover:ring-purple-400/30',
    priceColor: 'text-purple-300',
  },
  {
    key: 'realme',
    displayName: 'realme',
    description: 'GT 8 ~ 6 旗艦系列、數字系列',
    cardBg: 'from-amber-700 to-yellow-800 text-white',
    badgeBg: 'bg-yellow-400/20 text-yellow-100',
    borderHover: 'hover:border-yellow-300 hover:ring-2 hover:ring-yellow-400/30',
    priceColor: 'text-yellow-200',
  },
  {
    key: 'SONY',
    displayName: 'SONY 索尼',
    description: 'Xperia 1 / 5 / 10 系列、PRO-I',
    cardBg: 'from-zinc-900 to-stone-900 text-white',
    badgeBg: 'bg-white/15 text-slate-200',
    borderHover: 'hover:border-purple-400 hover:ring-2 hover:ring-purple-400/30',
    priceColor: 'text-red-400',
  },
  {
    key: 'MI',
    displayName: '小米 Xiaomi',
    description: 'Xiaomi 15 ~ 12 徠卡影像系列',
    cardBg: 'from-orange-700 to-amber-800 text-white',
    badgeBg: 'bg-white/20 text-white',
    borderHover: 'hover:border-orange-300 hover:ring-2 hover:ring-orange-400/30',
    priceColor: 'text-yellow-200',
  },
  {
    key: 'NOTHING',
    displayName: 'Nothing',
    description: 'Phone (3a) / (2a) / (2) / (1)',
    cardBg: 'from-slate-950 to-neutral-900 text-white',
    badgeBg: 'bg-red-500/20 text-rose-300',
    borderHover: 'hover:border-rose-400 hover:ring-2 hover:ring-rose-400/30',
    priceColor: 'text-rose-300',
  },
];

export const BrandSelectionGrid: React.FC<BrandSelectionGridProps> = ({
  devices,
  onSelectBrand,
  onSelectModel,
  fileMeta,
  onShareStoreFile,
}) => {
  // Format timestamp helper
  const formatDateTime = (ts?: number) => {
    if (!ts) return '未知時間';
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day} ${hh}:${mm}`;
  };

  // Compute stats per brand
  const brandStats = React.useMemo(() => {
    const map: Record<string, { count: number; maxPrice: number }> = {};
    devices.forEach((d) => {
      if (!map[d.brand]) {
        map[d.brand] = { count: 0, maxPrice: 0 };
      }
      map[d.brand].count += 1;
      if (d.maxPriceA > map[d.brand].maxPrice) {
        map[d.brand].maxPrice = d.maxPriceA;
      }
    });
    return map;
  }, [devices]);

  // Get all unique brands present in devices, sorted by model count descending, with Google prioritized ahead of ASUS
  const allBrandKeys = React.useMemo(() => {
    const set = new Set<string>();
    devices.forEach((d) => {
      if (d.brand) set.add(d.brand);
    });
    return Array.from(set).sort((a, b) => {
      const countA = brandStats[a]?.count || 0;
      const countB = brandStats[b]?.count || 0;
      if (countB !== countA) {
        return countB - countA; // 機款數量由多到少排序
      }
      // When counts are equal: User Requirement: Google 排序在 ASUS 前面
      const isGoogleA = a.toLowerCase() === 'google';
      const isGoogleB = b.toLowerCase() === 'google';
      const isAsusA = a.toLowerCase() === 'asus';
      const isAsusB = b.toLowerCase() === 'asus';
      if (isGoogleA && isAsusB) return -1;
      if (isAsusA && isGoogleB) return 1;

      return a.localeCompare(b, 'zh-TW');
    });
  }, [devices, brandStats]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          請選擇舊機回收品牌
        </h2>
        <p className="text-base font-medium text-slate-600">
          點選以下手機品牌，立即查看 點子行動 與 FDI 雙通路完整報價與比價
        </p>
      </div>

      {/* Prominent File Update Annotation Card (註記這份檔案是什麼時候更新的) */}
      {fileMeta && (
        <div className="bg-white border-2 border-red-300 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-linear-to-r from-red-50/70 via-rose-50/40 to-slate-50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-red-800 bg-red-200/80 px-2.5 py-0.5 rounded-full border border-red-300">
                  ● 報價檔已生效
                </span>
                <span className="text-xs font-bold text-slate-700 font-mono">
                  來源檔案：{fileMeta.name}
                </span>
              </div>
              <div className="text-sm font-black text-slate-950 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-slate-800">本份檔案更新時間：</span>
                <span className="font-mono text-red-700 font-extrabold text-base bg-white px-2.5 py-0.5 rounded-lg border border-red-300 shadow-2xs">
                  {formatDateTime(fileMeta.lastModified)}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  (已收錄 {devices.length} 款機型最新雙通路底價)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 pl-15 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto shrink-0">
            {onShareStoreFile && (
              <button
                type="button"
                onClick={onShareStoreFile}
                className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="分享或下載已完成吃檔的門市專用檔案"
              >
                <Share2 className="w-4 h-4" />
                <span>📤 分享門市使用檔 (已完成吃檔)</span>
              </button>
            )}
            <div className="text-xs text-slate-500 font-mono">
              匯入時間：{formatDateTime(fileMeta.importedAt || Date.now())}
            </div>
            <div className="text-[11px] text-red-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
              <span>雙通路報價已就緒</span>
            </div>
          </div>
        </div>
      )}

      {/* 門市舊機回收注意事項 (3大必要檢核項目) */}
      <RecyclingPrecautionsBanner />

      {/* Brand Grid with Vibrant Colors and Larger Text */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allBrandKeys.map((brandKey) => {
          const stats = brandStats[brandKey] || { count: 0, maxPrice: 0 };
          const theme =
            BRAND_THEMES.find((t) => t.key.toLowerCase() === brandKey.toLowerCase()) || {
              key: brandKey,
              displayName: brandKey,
              description: `${brandKey} 全系列智慧手機與回收機型`,
              cardBg: 'from-slate-800 to-indigo-900 text-white',
              badgeBg: 'bg-white/10 text-white',
              borderHover: 'hover:border-indigo-400 hover:ring-2 hover:ring-indigo-400/30',
              priceColor: 'text-red-400',
            };

          // Get unique models for this brand sorted alphabetically or by series
          const brandModels = Array.from(
            new Set(
              devices
                .filter((d) => d.brand === brandKey)
                .map((d) => d.model.trim())
                .filter(Boolean)
            )
          ).sort((a, b) => a.localeCompare(b, 'zh-TW'));

          return (
            <div
              key={brandKey}
              onClick={() => onSelectBrand(brandKey)}
              className={`bg-linear-to-br ${theme.cardBg} border border-white/10 ${theme.borderHover} rounded-2xl p-6 text-left transition-all hover:scale-[1.01] shadow-md hover:shadow-xl group flex flex-col justify-between min-h-[220px] cursor-pointer relative overflow-hidden`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black tracking-tight text-white group-hover:translate-x-1 transition-transform">
                    {theme.displayName}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <p className="text-sm text-white/80 mt-2 font-medium line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>

                {/* Dropdown for quick model selection (在紅圈位置提供各品牌的機款下拉選單) */}
                <div
                  className="mt-3.5 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const chosenModel = e.target.value;
                        if (!chosenModel) return;
                        if (onSelectModel) {
                          onSelectModel(brandKey, chosenModel);
                        } else {
                          onSelectBrand(brandKey);
                        }
                      }}
                      className="w-full bg-white/95 text-slate-900 font-bold text-xs py-2 px-3 pr-8 rounded-xl border border-white/30 shadow-xs focus:ring-2 focus:ring-red-400 focus:outline-hidden cursor-pointer hover:bg-white transition-colors appearance-none"
                    >
                      <option value="" disabled className="text-slate-400">
                        ▼ 快速挑選 {theme.displayName} 機款...
                      </option>
                      {brandModels.map((m) => (
                        <option key={m} value={m} className="text-slate-900 font-semibold py-1">
                          {m}
                        </option>
                      ))}
                    </select>
                    {/* Custom down arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-600 font-bold text-xs">
                      ▾
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Footer with Enlarged Text */}
              <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${theme.badgeBg}`}>
                  收錄 {stats.count} 款機型
                </span>

                {stats.maxPrice > 0 && (
                  <div className="text-right">
                    <div className="text-[11px] text-white/70">最高可折抵</div>
                    <div className={`text-lg font-black font-mono ${theme.priceColor}`}>
                      NT$ {stats.maxPrice.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
