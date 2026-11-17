import React, { useState } from 'react';
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface InspectionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  keyRule: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'c1',
    category: '1. 帳號與安全性',
    title: 'Apple ID / Google 帳號與尋找功能已關閉',
    desc: '務必於顧客面前登出 iCloud「尋找我的 iPhone」或 Google 帳戶防盜鎖定，並重置還原為原廠設定。',
    keyRule: '若未解除帳號鎖定，無法受理回收。',
  },
  {
    id: 'c2',
    category: '2. 螢幕顯示與觸控',
    title: '螢幕顯示正常無烙印、黑塊與觸控斷線',
    desc: '全螢幕白色/純色背景檢視是否有亮線、綠線、殘影或大面積烙印，拖曳 App 圖示測試全螢幕觸控靈敏度。',
    keyRule: '原廠螢幕無破裂方可判定為 A/B 級；副廠螢幕或破裂轉為 C/D 級。',
  },
  {
    id: 'c3',
    category: '3. 鏡頭與影像系統',
    title: '相機鏡頭對焦、變焦與防手震正常',
    desc: '切換超廣角(0.5x)、主鏡頭(1x)、望遠鏡頭(3x/5x)拍照，確認對焦無抖動、無黑斑雜點，閃光燈正常。',
    keyRule: '鏡頭外玻璃破裂或感光元件黑斑需扣等級。',
  },
  {
    id: 'c4',
    category: '4. 外觀邊框與背蓋',
    title: '外觀機身無變形彎曲、無液體受潮',
    desc: '目視檢視四個邊角有無摔傷凹陷、背蓋玻璃有無裂痕，檢查 SIM 卡槽內防潮試紙是否變紅。',
    keyRule: '受潮受損泡水機一律不予回收。',
  },
  {
    id: 'c5',
    category: '5. 生物辨識與通訊',
    title: 'Face ID / 指紋辨識、Wi-Fi / 藍牙 / 通話正常',
    desc: '錄入人臉或指紋確認功能正常，撥打門市測試電話確認聽筒、麥克風、擴音無破音雜音。',
    keyRule: 'Face ID / Touch ID 故障無法修復者轉為 D 級。',
  },
  {
    id: 'c6',
    category: '6. 電池健康度狀態',
    title: '電池無膨脹、健康度建議 80% 以上',
    desc: '從設定檢視電池健康度最大容量，側面目視螢幕或背蓋有無因電池膨脹而翹起微開。',
    keyRule: '電池嚴重膨脹有安全疑慮者請勿強行壓合。',
  },
];

export const InspectionGuideModal: React.FC<InspectionGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allPassed = CHECKLIST_ITEMS.every((item) => checkedIds[item.id]);

  const handleReset = () => {
    setCheckedIds({});
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">直營門市舊機驗機檢核標準 (SOP)</h3>
              <p className="text-xs text-slate-400">櫃檯收機 6 大關鍵步驟快速驗證</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between ${
            allPassed
              ? 'bg-red-50 text-red-800 border-b border-red-100'
              : 'bg-slate-100 text-slate-700 border-b border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {allPassed ? (
              <CheckCircle2 className="w-4 h-4 text-red-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-500" />
            )}
            <span>
              已完成檢核：{Object.values(checkedIds).filter(Boolean).length} /{' '}
              {CHECKLIST_ITEMS.length} 項
            </span>
          </div>

          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重設勾選</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-3.5 max-h-[65vh] overflow-y-auto">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = !!checkedIds[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-red-500 bg-red-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    <div className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                      {item.keyRule}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            確認並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
