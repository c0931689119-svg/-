import React from 'react';
import { Calculator, Award, ArrowUpRight, Info } from 'lucide-react';
import { ActualDeviceItem } from '../types/pricing';

interface PriceTableProps {
  devices: ActualDeviceItem[];
  onSelectDevice: (device: ActualDeviceItem) => void;
  vendorFilter: 'ALL' | 'dianzi' | 'fdi';
}

export const PriceTable: React.FC<PriceTableProps> = ({
  devices,
  onSelectDevice,
}) => {
  const formatNT = (num: number) => {
    if (!num) return '-';
    return `NT$${num.toLocaleString()}`;
  };

  if (devices.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto my-10 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Info className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">查無相符機型報價</h3>
        <p className="text-sm text-slate-500 mt-1">請返回上一頁重新選取其他品牌。</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-160px)]">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-30">
            {/* Top Super-Category Bar (Sticky layer 1: 機型與規格 / 點子行動回收報價 / FutureDial回收報價 / 最佳推薦與試算) */}
            <tr className="text-sm font-black">
              <th colSpan={2} className="sticky top-0 z-30 py-3.5 px-5 bg-slate-100 text-slate-800 border-b-2 border-slate-300">
                機型與規格
              </th>
              <th
                colSpan={2}
                className="sticky top-0 z-30 py-3.5 px-4 bg-red-600 text-white text-center border-l-2 border-r-2 border-red-700 border-b-2 border-red-700"
              >
                點子行動 (愛鋒派) 回收報價
              </th>
              <th
                colSpan={2}
                className="sticky top-0 z-30 py-3.5 px-4 bg-blue-600 text-white text-center border-r-2 border-blue-700 border-b-2 border-blue-700"
              >
                FutureDial (FDI) 回收報價
              </th>
              <th colSpan={2} className="sticky top-0 z-30 py-3.5 px-4 bg-amber-500 text-slate-950 text-center font-black border-b-2 border-amber-600">
                最佳推薦與試算
              </th>
            </tr>

            {/* Sub-Header Columns (Sticky layer 2: 型號名稱 / 容量規格 / A等 / B/C等 / S/A等 / B/C等 / 推薦勝出 / 試算) */}
            <tr className="text-slate-700 font-bold text-xs">
              <th className="sticky top-[47px] z-20 py-2.5 px-5 bg-slate-50 border-b-2 border-slate-200">型號名稱</th>
              <th className="sticky top-[47px] z-20 py-2.5 px-3 bg-slate-50 whitespace-nowrap border-b-2 border-slate-200">容量規格</th>
              {/* 點子 */}
              <th className="sticky top-[47px] z-20 py-2.5 px-4 bg-red-50 text-red-950 border-l-2 border-red-200 border-b-2 border-red-200 font-bold whitespace-nowrap min-w-[125px]">
                A等 (優良)
              </th>
              <th className="sticky top-[47px] z-20 py-2.5 px-3 bg-red-50 text-red-900 border-r-2 border-red-200 border-b-2 border-red-200 whitespace-nowrap min-w-[110px]">
                B等 / C等
              </th>
              {/* FDI */}
              <th className="sticky top-[47px] z-20 py-2.5 px-4 bg-blue-50 text-blue-950 border-b-2 border-blue-200 font-bold whitespace-nowrap min-w-[155px]">
                S等 / A等
              </th>
              <th className="sticky top-[47px] z-20 py-2.5 px-3 bg-blue-50 text-blue-900 border-r-2 border-blue-200 border-b-2 border-blue-200 whitespace-nowrap min-w-[110px]">
                B等 / C等
              </th>
              {/* Diff & Action */}
              <th className="sticky top-[47px] z-20 py-2.5 px-4 bg-amber-50 text-amber-950 text-center border-b-2 border-amber-200 whitespace-nowrap min-w-[120px]">
                推薦通路 (利差)
              </th>
              <th className="sticky top-[47px] z-20 py-2.5 px-5 bg-slate-50 text-right border-b-2 border-slate-200 whitespace-nowrap">前線試算</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800 text-sm">
            {devices.map((device) => {
              const isDianziBest = device.bestVendorA === '點子行動' && device.diffA > 0;
              const isFdiBest = device.bestVendorA === 'FDI' && device.diffA > 0;

              return (
                <tr
                  key={device.id}
                  onClick={() => onSelectDevice(device)}
                  className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                >
                  {/* Model Name */}
                  <td className="py-3.5 px-5">
                    <div className="font-extrabold text-slate-900 text-base group-hover:text-red-700 transition-colors">
                      {device.model}
                    </div>
                  </td>

                  {/* Specs */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {device.capacity}
                    </span>
                  </td>

                  {/* 點子 A等 */}
                  <td className="py-3.5 px-4 bg-red-50/40 border-l-2 border-red-200 whitespace-nowrap min-w-[125px]">
                    <div
                      className={`font-mono text-base whitespace-nowrap tracking-tight ${
                        isDianziBest
                          ? 'font-black text-red-800 text-lg'
                          : 'font-bold text-slate-800'
                      }`}
                    >
                      {formatNT(device.dianziPriceA)}
                    </div>
                  </td>

                  {/* 點子 B / C */}
                  <td className="py-3.5 px-3 bg-red-50/40 border-r-2 border-red-200 font-mono text-xs text-slate-600 whitespace-nowrap min-w-[110px]">
                    <div>B等：{formatNT(device.dianziPriceB)}</div>
                    <div className="text-slate-400">C等：{formatNT(device.dianziPriceC)}</div>
                  </td>

                  {/* FDI S / A - Prevent line break & format as A等：NT$43,400 */}
                  <td className="py-3.5 px-4 bg-blue-50/40 whitespace-nowrap min-w-[155px]">
                    {device.fdiPriceS > 0 && (
                      <div className="text-xs font-semibold text-indigo-700 font-mono whitespace-nowrap leading-tight mb-0.5">
                        S等：{formatNT(device.fdiPriceS)}
                      </div>
                    )}
                    <div
                      className={`font-mono text-base whitespace-nowrap inline-block tracking-tight ${
                        isFdiBest
                          ? 'font-black text-blue-800 text-lg'
                          : 'font-bold text-slate-800'
                      }`}
                    >
                      A等：{formatNT(device.fdiPriceA)}
                    </div>
                  </td>

                  {/* FDI B / C */}
                  <td className="py-3.5 px-3 bg-blue-50/40 border-r-2 border-blue-200 font-mono text-xs text-slate-600 whitespace-nowrap min-w-[110px]">
                    <div>B等：{formatNT(device.fdiPriceB)}</div>
                    <div className="text-slate-400">C等：{formatNT(device.fdiPriceC)}</div>
                  </td>

                  {/* Recommendation Winner */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap bg-amber-50/50">
                    {isDianziBest ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs shadow-xs">
                        <Award className="w-3.5 h-3.5" />
                        <span>點子高 +{device.diffA.toLocaleString()}</span>
                      </div>
                    ) : isFdiBest ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs">
                        <Award className="w-3.5 h-3.5" />
                        <span>FDI高 +{device.diffA.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">兩家同價</span>
                    )}
                  </td>

                  {/* Calculator Button */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDevice(device);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>試算</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
