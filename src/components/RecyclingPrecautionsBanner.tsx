import React, { useState } from 'react';
import {
  AlertTriangle,
  UserX,
  RefreshCw,
  Power,
  ShieldAlert,
  X,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface RecyclingPrecautionsBannerProps {
  compact?: boolean;
  className?: string;
  defaultTab?: 'precautions' | 'mistakes';
}

export interface CommonMistakeItem {
  id: string;
  category: 'grade' | 'lock';
  title: string;
  rule: string;
  correctGrade?: string;
  mistakeGrade?: string;
  desc?: string;
}

export const COMMON_RECYCLING_MISTAKES: CommonMistakeItem[] = [
  {
    id: 'm1',
    category: 'grade',
    title: '螢幕漏液',
    rule: '螢幕漏液，應為C級，但門市判等為A級',
    correctGrade: 'C級',
    mistakeGrade: 'A級',
    desc: '螢幕出現黑點、黑斑、漏液或黑線，必須判定為 C 級。',
  },
  {
    id: 'm2',
    category: 'grade',
    title: '電池為未知零件',
    rule: '電池為未知零件，應為C級，但門市判等為A級',
    correctGrade: 'C級',
    mistakeGrade: 'A級',
    desc: '系統設定顯示「非原廠電池」或「未知零件」，一律判定 C 級。',
  },
  {
    id: 'm3',
    category: 'grade',
    title: '相機為未知零件',
    rule: '相機為未知零件，應為C級，但門市判等為S級',
    correctGrade: 'C級',
    mistakeGrade: 'S級',
    desc: '相機模組顯示非原廠或未知零件，不得列入 S 級，應判 C 級。',
  },
  {
    id: 'm4',
    category: 'grade',
    title: '螢幕為未知零件',
    rule: '螢幕為未知零件，應為C級，但門市判等為S級',
    correctGrade: 'C級',
    mistakeGrade: 'S級',
    desc: '非原廠更換螢幕或未知螢幕零件，絕非 S 級，應判 C 級。',
  },
  {
    id: 'm5',
    category: 'grade',
    title: '背板破裂',
    rule: '背板破裂，應為B級，但門市判等為A級',
    correctGrade: 'B級',
    mistakeGrade: 'A級',
    desc: '機身後玻璃/背蓋有任何破裂、碎裂或缺角，應判定為 B 級。',
  },
  {
    id: 'm6',
    category: 'grade',
    title: '相機鏡頭破裂',
    rule: '相機鏡頭破裂，應為B級，但門市判等為A級',
    correctGrade: 'B級',
    mistakeGrade: 'A級',
    desc: '後鏡頭玻璃鏡片有刮破、裂痕或破損，應為 B 級，切勿判為 A 級。',
  },
  {
    id: 'm7',
    category: 'lock',
    title: '帳號/密碼未登出或解除',
    rule: '帳號/密碼未登出或解除',
    desc: '門市若未確實檢查解鎖與登出，廠商檢測將無法登入並全數退件！',
  },
  {
    id: 'm8',
    category: 'lock',
    title: 'APPLE ID 擁有者鎖定',
    rule: 'APPLE ID 擁有者鎖定',
    desc: '「尋找我的 iPhone」未關閉或遭原擁有者鎖定，無法啟用直接退回。',
  },
  {
    id: 'm9',
    category: 'lock',
    title: '三星(Google)密碼未解',
    rule: '三星(Google)密碼未解',
    desc: 'Google FRP 原生保護鎖或 Samsung Account 未解除，無法重置收件。',
  },
];

export const RecyclingPrecautionsBanner: React.FC<RecyclingPrecautionsBannerProps> = ({
  compact = false,
  className = '',
  defaultTab = 'precautions',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'precautions' | 'mistakes' | 'all'>(defaultTab);

  const handleOpenModal = (tab: 'precautions' | 'mistakes' | 'all') => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 
        =========================================================
        TRIGGER BAR: 依需求預設不露出大篇幅，改為精簡醒目的點擊警示列
        =========================================================
      */}
      {compact ? (
        <div
          className={`bg-linear-to-r from-amber-50/90 via-orange-50/50 to-rose-50/80 border border-amber-300 rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 shadow-2xs flex-wrap ${className}`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300 shrink-0">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              <span>門市必檢警示</span>
            </span>
            <span className="text-xs font-bold text-slate-700">
              舊機回收前請核對必要條件與常見誤判防呆：
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenModal('precautions')}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black rounded-lg shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="點擊彈出 3 大必要條件警示視窗"
            >
              ⚠️ 3 大必要條件
            </button>
            <button
              type="button"
              onClick={() => handleOpenModal('mistakes')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg shadow-xs shadow-rose-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
              title="點擊彈出 9 大常見異常疏失注意視窗"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>🚨 常見異常疏失注意！</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`bg-linear-to-r from-amber-50/90 via-orange-50/50 to-rose-50/70 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                  ● 門市現場重要檢核
                </span>
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  舊機回收注意事項 與 常見異常疏失注意
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                為避免高估等別賠差額或遭廠商退件，報價前請點選下方按鈕確認標準：
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={() => handleOpenModal('precautions')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>⚠️ 3 大必要條件</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenModal('mistakes')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>🚨 常見異常疏失注意！(9大重點)</span>
            </button>
          </div>
        </div>
      )}

      {/* 
        =========================================================
        MODAL WINDOW: 點選後彈出的完整警示視窗
        =========================================================
      */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-slate-950 via-slate-900 to-amber-950 text-white px-6 py-4 flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white tracking-tight">
                      門市舊機回收檢核警示
                    </h3>
                    <span className="text-[11px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      門市必檢防呆
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    舊機回收 3 大必要條件 · 9 大常見判定疏失與退件警示
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Tab Navigation */}
            <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('precautions')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'precautions'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>3 大必要條件（缺一不可）</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mistakes')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'mistakes'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-300'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>🚨 常見異常疏失注意！（9大重點）</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  全部檢視
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-500">
                報價前請務必向客戶逐一核對確認
              </span>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: 3 大必要條件 */}
              {(activeTab === 'precautions' || activeTab === 'all') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <h4 className="text-sm font-black text-slate-900">
                        【必要條件】舊機回收 3 大基本受理條件（缺一不可）
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                      ⚠️ 必備前提
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-amber-50/50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                            1
                          </span>
                          <span className="text-sm font-black text-rose-700">
                            已登出 iCloud / Google 帳號
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          請務必解除並完全登出 Apple ID 或 Google 帳號，並關閉「尋找」防盜鎖定功能。若未登出廠商無法進行系統檢測與清除，將直接退件。
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-amber-200/80 text-[11px] font-black text-rose-700 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>未解除直接原件退回</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                            2
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            已恢復原廠設定
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          所有個人照片、通訊錄、APP 等機密資料均已完全抹除清空，手機已還原至初始開機歡迎畫面（Hello 歡迎畫面）。
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-amber-200/80 text-[11px] font-black text-blue-700 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                        <span>保障客戶隱私安全</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                            3
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            可正常開關機且無密碼鎖
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          螢幕解鎖密碼、圖形鎖或開機密碼須完全解除，機台具備基礎電力，可順暢通電正常開關機與觸控。
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-amber-200/80 text-[11px] font-black text-red-700 flex items-center gap-1">
                        <Power className="w-3.5 h-3.5 shrink-0" />
                        <span>能正常通電開關機</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 9 大常見異常疏失注意 */}
              {(activeTab === 'mistakes' || activeTab === 'all') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                      <h4 className="text-sm font-black text-rose-950 flex items-center gap-2">
                        <span>【防呆重點】常見異常疏失注意！（9 大高頻誤判與退件警示）</span>
                        <span className="text-[11px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">
                          嚴禁高估等別
                        </span>
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                      避免門市貼賠
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    請門市同仁在為客戶判別外觀與零件時特別核對以下 9 項要點，未符合者將導致等別降級或整機退件：
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {COMMON_RECYCLING_MISTAKES.map((item, idx) => {
                      const isGrade = item.category === 'grade';

                      return (
                        <div
                          key={item.id}
                          className="bg-white border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-4 shadow-2xs flex flex-col justify-between transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1.5 mb-2">
                              <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{item.title}</span>
                              </span>
                              {isGrade ? (
                                <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md shrink-0">
                                  等別誤判
                                </span>
                              ) : (
                                <span className="text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-md shrink-0">
                                  直接退件
                                </span>
                              )}
                            </div>

                            <div className="bg-rose-50 border border-rose-300/80 rounded-xl p-2.5 text-xs font-black text-rose-800 leading-snug">
                              {item.rule}
                            </div>

                            {item.desc && (
                              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed font-medium">
                                {item.desc}
                              </p>
                            )}
                          </div>

                          {isGrade && item.correctGrade && item.mistakeGrade && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                              <span className="text-red-700 bg-red-50 border border-red-300 px-2 py-0.5 rounded-md">
                                正確：<strong>{item.correctGrade}</strong>
                              </span>
                              <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md line-through">
                                誤判：{item.mistakeGrade}
                              </span>
                            </div>
                          )}

                          {!isGrade && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
                              <span className="flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" />
                                <span>無法檢測</span>
                              </span>
                              <span className="bg-rose-100 px-2 py-0.5 rounded-md text-rose-900 font-black">
                                退回原件
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>請確實依據廠商標準判定，保護門市權益與客戶滿意度</span>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'precautions' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('mistakes')}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    切換至「9 大常見異常疏失」→
                  </button>
                )}
                {activeTab === 'mistakes' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('precautions')}
                    className="px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    ← 查看「3 大必要條件」
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  我已確認並知悉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
