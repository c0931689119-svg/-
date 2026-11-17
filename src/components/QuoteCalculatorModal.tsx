import React, { useState } from 'react';
import { X, Copy, Check, Calculator, Building2, ExternalLink, ChevronDown, ChevronUp, FileText, Info } from 'lucide-react';
import { ActualDeviceItem } from '../types/pricing';
import { DIANZI_IOS_QR, DIANZI_DOWNLOAD_URL, FDI_ONLINE_URL } from '../data/dianziAppQrData';
import { RecyclingPrecautionsBanner } from './RecyclingPrecautionsBanner';

interface QuoteCalculatorModalProps {
  device: ActualDeviceItem | null;
  onClose: () => void;
}

export const QuoteCalculatorModal: React.FC<QuoteCalculatorModalProps> = ({
  device,
  onClose,
}) => {
  if (!device) return null;

  // Default to the higher paying vendor
  const [vendor, setVendor] = useState<'dianzi' | 'fdi'>(
    device.fdiPriceA > device.dianziPriceA ? 'fdi' : 'dianzi'
  );

  const [dianziGrade, setDianziGrade] = useState<'A' | 'B' | 'C'>('A');
  const [fdiGrade, setFdiGrade] = useState<'S' | 'A' | 'B' | 'C'>('A');
  const [copied, setCopied] = useState(false);

  // Compute base price & part number
  let basePrice = 0;
  let partNo = '';
  let gradeText = '';

  if (vendor === 'dianzi') {
    if (dianziGrade === 'A') {
      basePrice = device.dianziPriceA;
      partNo = device.dianziPartA || '';
      gradeText = 'A等 (優良近全新)';
    } else if (dianziGrade === 'B') {
      basePrice = device.dianziPriceB;
      partNo = device.dianziPartB || '';
      gradeText = 'B等 (正常使用痕跡)';
    } else {
      basePrice = device.dianziPriceC;
      partNo = device.dianziPartC || '';
      gradeText = 'C等 (受損刮痕)';
    }
  } else {
    if (fdiGrade === 'S') {
      basePrice = device.fdiPriceS;
      partNo = device.fdiPartS || '';
      gradeText = 'S等 (完美公司貨)';
    } else if (fdiGrade === 'A') {
      basePrice = device.fdiPriceA;
      partNo = device.fdiPartA || '';
      gradeText = 'A等 (優良)';
    } else if (fdiGrade === 'B') {
      basePrice = device.fdiPriceB;
      partNo = device.fdiPartB || '';
      gradeText = 'B等 (單項破損/深痕)';
    } else {
      basePrice = device.fdiPriceC;
      partNo = device.fdiPartC || '';
      gradeText = 'C等 (多項損壞)';
    }
  }

  const copyText = () => {
    const text = `【門市舊機回收報價】
📱 回收機型：${device.brand} ${device.model} (${device.capacity})
🏢 推薦通路：${vendor === 'dianzi' ? '點子行動 (愛鋒派)' : 'FutureDial (FDI)'}
🔍 判定等級：${gradeText}
💰 回收報價：NT$ ${basePrice.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border-2 border-slate-300 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg">舊機回收報價試算</h3>
            <p className="text-sm text-slate-300 font-medium mt-0.5">
              {device.brand} {device.model} · {device.capacity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm overflow-y-auto flex-1">
          {/* 門市舊機回收注意事項 (3大必要檢核項目) */}
          <RecyclingPrecautionsBanner compact />

          {/* 1. Vendor toggle */}
          <div>
            <label className="block text-slate-700 font-bold mb-2">1. 選擇回收通路商</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVendor('dianzi')}
                className={`py-3 px-4 rounded-xl border-2 text-center font-bold transition-all cursor-pointer ${
                  vendor === 'dianzi'
                    ? 'border-red-600 bg-red-50 text-red-950 shadow-sm ring-2 ring-red-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-black">點子行動 (愛鋒派)</div>
                {device.bestVendorA === '點子行動' && device.diffA > 0 && (
                  <div className="text-xs text-red-700 font-bold mt-1">
                    🏆 A等推薦 (高出 +${device.diffA.toLocaleString()})
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setVendor('fdi')}
                className={`py-3 px-4 rounded-xl border-2 text-center font-bold transition-all cursor-pointer ${
                  vendor === 'fdi'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-black">FutureDial (FDI)</div>
                {device.bestVendorA === 'FDI' && device.diffA > 0 && (
                  <div className="text-xs text-blue-700 font-bold mt-1">
                    🏆 A等推薦 (高出 +${device.diffA.toLocaleString()})
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 2. Grade selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-2">2. 判定機況等級</label>
            {vendor === 'dianzi' ? (
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { g: 'A' as const, label: 'A等 (優良)', price: device.dianziPriceA },
                  { g: 'B' as const, label: 'B等 (正常)', price: device.dianziPriceB },
                  { g: 'C' as const, label: 'C等 (瑕疵)', price: device.dianziPriceC },
                ].map((item) => (
                  <button
                    key={item.g}
                    type="button"
                    onClick={() => setDianziGrade(item.g)}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      dianziGrade === item.g
                        ? 'border-red-600 bg-red-50 text-red-950 font-black shadow-sm ring-2 ring-red-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="font-mono mt-1 text-base font-black text-red-700 whitespace-nowrap">
                      NT${item.price ? item.price.toLocaleString() : '-'}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { g: 'S' as const, label: 'S等 (完美)', price: device.fdiPriceS },
                  { g: 'A' as const, label: 'A等 (優良)', price: device.fdiPriceA },
                  { g: 'B' as const, label: 'B等 (正常)', price: device.fdiPriceB },
                  { g: 'C' as const, label: 'C等 (瑕疵)', price: device.fdiPriceC },
                ].map((item) => (
                  <button
                    key={item.g}
                    type="button"
                    onClick={() => setFdiGrade(item.g)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      fdiGrade === item.g
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-black shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="font-mono mt-1 text-sm font-black text-blue-700 whitespace-nowrap">
                      NT${item.price ? item.price.toLocaleString() : '-'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Large Result Box matching User's exact screenshot design */}
          <div
            className={`p-6 border-2 rounded-2xl shadow-xs transition-all ${
              vendor === 'dianzi'
                ? 'bg-[#fef2f2] border-[#fca5a5]'
                : 'bg-[#eff6ff] border-[#93c5fd]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              {/* Left: Price & Vendor / Grade summary */}
              <div className="space-y-1">
                <div
                  className={`font-black text-sm ${
                    vendor === 'dianzi' ? 'text-[#991b1b]' : 'text-[#1e40af]'
                  }`}
                >
                  回收報價實拿金額
                </div>
                <div
                  className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                    vendor === 'dianzi' ? 'text-[#b91c1c]' : 'text-[#1d4ed8]'
                  }`}
                >
                  NT$ {basePrice.toLocaleString()}
                </div>
                <div
                  className={`text-xs font-bold pt-1 ${
                    vendor === 'dianzi' ? 'text-[#991b1b]' : 'text-[#1e40af]'
                  }`}
                >
                  推薦通路：{vendor === 'dianzi' ? '點子行動 (愛鋒派)' : 'FutureDial (FDI)'} · 判定等級：{gradeText}
                </div>
              </div>

              {/* Right State Box:
                  - When Dianzi: White rounded card with QR code + 📱 掃描下載檢測 APP (matches user's screenshot exactly)
                  - When FDI: Direct clickable link to https://smi-wpi.futuredial.com/zh/
              */}
              {vendor === 'dianzi' ? (
                <div className="bg-white/95 rounded-2xl p-4 border border-[#fecaca] shadow-xs flex items-center justify-center shrink-0 min-w-[210px] min-h-[140px]">
                  <a
                    href={DIANZI_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center text-center group cursor-pointer hover:opacity-90 transition-opacity"
                    title="點擊或掃描下載點子檢測 APP"
                  >
                    <img
                      src={DIANZI_IOS_QR}
                      alt="點子檢測APP下載QRcode"
                      className="w-24 h-24 object-contain rounded-md block group-hover:scale-[1.02] transition-transform"
                    />
                    <div className="text-xs font-black text-[#0f172a] mt-2 flex items-center justify-center gap-1.5 leading-none">
                      <span className="text-sm">📱</span>
                      <span className="tracking-tight">掃描下載檢測 APP</span>
                    </div>
                  </a>
                </div>
              ) : (
                <div className="bg-white/95 rounded-2xl p-4 border border-[#bfdbfe] shadow-xs flex flex-col items-center justify-center text-center shrink-0 min-w-[230px] min-h-[140px] space-y-2.5">
                  <div className="flex items-center gap-1.5 font-black text-sm text-[#1e40af]">
                    <ExternalLink className="w-4 h-4 text-[#2563eb]" />
                    <span>FDI 線上檢測系統</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    FutureDial 官方線上檢測網址
                  </p>
                  <a
                    href={FDI_ONLINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <span>開啟 FDI 檢測網站</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={FDI_ONLINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-blue-700 hover:underline break-all max-w-[220px]"
                  >
                    https://smi-wpi.futuredial.com/zh/
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 3. Grade Standards Detailed Comparison Table (兩家廠商判等詳細說明) */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm">
                <FileText className="w-4 h-4 text-red-400" />
                <span>兩家廠商判等詳細說明對照表</span>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">門市驗機檢測標準</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  {/* Super Categories */}
                  <tr>
                    <th
                      colSpan={3}
                      className="bg-blue-100/90 text-blue-900 font-black text-center py-2.5 px-3 border-r-2 border-slate-300 text-sm"
                    >
                      點子行動舊機回收報價
                    </th>
                    <th
                      colSpan={4}
                      className="bg-red-100/90 text-red-950 font-black text-center py-2.5 px-3 text-sm"
                    >
                      FutureDial (FDI) 舊機回收報價
                    </th>
                  </tr>

                  {/* Grade Columns */}
                  <tr className="border-b-2 border-slate-300 text-center font-black">
                    {/* 點子行動 */}
                    <th className="bg-blue-50/70 text-blue-950 py-2 px-2 border-r border-slate-200 w-[14%]">
                      報價 (A等級)
                    </th>
                    <th className="bg-blue-50/70 text-blue-950 py-2 px-2 border-r border-slate-200 w-[14%]">
                      報價 (B等級)
                    </th>
                    <th className="bg-blue-50/70 text-blue-950 py-2 px-2 border-r-2 border-slate-300 w-[15%]">
                      報價 (C等級)
                    </th>

                    {/* FDI */}
                    <th className="bg-red-50/70 text-red-950 py-2 px-2 border-r border-slate-200 w-[14%]">
                      報價 (S等級)
                    </th>
                    <th className="bg-red-50/70 text-red-950 py-2 px-2 border-r border-slate-200 w-[14%]">
                      報價 (A等級)
                    </th>
                    <th className="bg-red-50/70 text-red-950 py-2 px-2 border-r border-slate-200 w-[14%]">
                      報價 (B等級)
                    </th>
                    <th className="bg-red-50/70 text-red-950 py-2 px-2 w-[15%]">
                      報價 (C等級)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white align-top leading-relaxed text-slate-800">
                  <tr>
                    {/* 點子 A等 */}
                    <td className="p-3 border-r border-slate-200 text-slate-900 space-y-1.5">
                      <div className="font-bold text-blue-950 pb-1 border-b border-blue-100">
                        自動外觀檢測<br />
                        <span className="text-[11px] text-slate-600 font-medium">(APP操作, 系統判斷)</span>
                      </div>
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>螢幕無刮傷</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>螢幕顯示正常</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>機身三處以內掉漆，無凹傷</span>
                        </li>
                      </ul>
                    </td>

                    {/* 點子 B等 */}
                    <td className="p-3 border-r border-slate-200 text-slate-900 space-y-1.5">
                      <div className="font-bold text-blue-950 pb-1 border-b border-blue-100">
                        自動外觀檢測<br />
                        <span className="text-[11px] text-slate-600 font-medium">(APP操作, 系統判斷)</span>
                      </div>
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>螢幕 1 處以內輕微刮痕</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>螢幕顯示正常</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>機身刮傷三處以內，可以有凹傷</span>
                        </li>
                      </ul>
                    </td>

                    {/* 點子 C等 */}
                    <td className="p-3 border-r-2 border-slate-300 text-slate-900 space-y-1.5 bg-slate-50/40">
                      <div className="font-bold text-blue-950 pb-1 border-b border-blue-100">
                        自動外觀檢測<br />
                        <span className="text-[11px] text-slate-600 font-medium">(APP操作, 系統判斷)</span>
                      </div>
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>螢幕 2～3 處輕微刮痕</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>螢幕顯示輕微瑕疵</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-blue-600 font-black">●</span>
                          <span>機身刮傷三處以上，可以有凹傷</span>
                        </li>
                      </ul>
                    </td>

                    {/* FDI S等 */}
                    <td className="p-3 border-r border-slate-200 text-slate-900 space-y-1.5 bg-red-50/20">
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start gap-1">
                          <span className="text-red-700 font-black">●</span>
                          <span>螢幕 / 背板 / 機身 / 鏡頭皆無刮痕</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-red-700 font-black">●</span>
                          <span>螢幕顯示正常</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-red-700 font-black">●</span>
                          <span>台灣公司貨</span>
                        </li>
                      </ul>
                    </td>

                    {/* FDI A等 */}
                    <td className="p-3 border-r border-slate-200 text-slate-900 space-y-1.5">
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start gap-1">
                          <span className="text-red-700 font-black">●</span>
                          <span>螢幕 / 背板 / 機身 / 鏡頭有些許刮痕或使用痕跡</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-red-700 font-black">●</span>
                          <span>螢幕顯示正常</span>
                        </li>
                      </ul>
                    </td>

                    {/* FDI B等 */}
                    <td className="p-3 border-r border-slate-200 text-slate-900 space-y-1.5">
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start gap-1">
                          <span className="text-red-700 font-black">●</span>
                          <span>螢幕 / 背板 / 鏡頭僅一項破裂、深刮或大面積刮傷</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-red-700 font-black">●</span>
                          <span>螢幕顯示正常</span>
                        </li>
                      </ul>
                    </td>

                    {/* FDI C等 */}
                    <td className="p-3 text-slate-900 space-y-1.5 bg-rose-50/30">
                      <ul className="space-y-1.5 pl-1 text-[11px]">
                        <li className="flex items-start gap-1">
                          <span className="text-rose-600 font-black">●</span>
                          <span>螢幕 / 背板 / 鏡頭兩項以上破裂、深刮或大面積刮傷</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-rose-600 font-black">●</span>
                          <span>螢幕 / 背板其中一項蜘蛛網狀爆裂</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-rose-600 font-black">●</span>
                          <span>手機彎曲變形、不密合、上下分離或零件裸露</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-rose-600 font-black">●</span>
                          <span>螢幕顯示不正常</span>
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-rose-600 font-black">●</span>
                          <span>未知或問題零件</span>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={copyText}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-red-600" />
                <span className="text-red-700">已複製報價</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>複製報價文字</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
