import fs from 'fs';
import path from 'path';

// Load preloaded devices and designated path
import { PRELOADED_ACTUAL_DEVICES } from '../src/utils/pricingDataParser';
import { DESIGNATED_NETWORK_PATH } from '../src/utils/defaultData';
import { DIANZI_IOS_QR } from '../src/data/dianziAppQrData';

const xlsxMiniCode = fs.readFileSync('./node_modules/xlsx/dist/xlsx.mini.min.js', 'utf-8');

export function buildStandaloneHtmlContent(devices = []) {
  const jsonDevices = JSON.stringify(devices)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>舊機回收即時報價平台 (門市電腦單機版)</title>
  <style>
    /* =========================================================
       100% 獨立離線單機版 · 內建完整報價 · 雙擊直接使用 · 免再套入資料
       嚴格限定電腦網頁版開啟 · 手機端自動安全阻擋
       ========================================================= */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", "微軟正黑體", Roboto, Helvetica, Arial, sans-serif;
      --bg-main: #f1f5f9;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --color-red: #dc2626;
      --color-blue: #2563eb;
      --color-amber: #d97706;
      --color-slate-900: #0f172a;
    }

    html, body {
      font-family: var(--font-stack);
      background-color: var(--bg-main);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    button, input {
      font-family: inherit;
    }

    button {
      cursor: pointer;
      border: none;
      outline: none;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* 頂部導航列 Header */
    .top-header {
      background: linear-gradient(90deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%);
      color: #ffffff;
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid rgba(99, 102, 241, 0.4);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      position: sticky;
      top: 0;
      z-index: 50;
      gap: 16px;
      flex-wrap: wrap;
    }

    .brand-logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 260px;
    }

    .brand-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ef4444 0%, #e11d48 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
      flex-shrink: 0;
      font-size: 22px;
    }

    .header-h1 {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge-offline-mode {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: 1px solid rgba(252, 165, 165, 0.4);
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }

    .header-sub-text {
      font-size: 12px;
      color: #cbd5e1;
      margin-top: 2px;
      font-weight: 500;
    }

    .header-middle-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(0, 0, 0, 0.4);
      padding: 6px 14px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 12px;
      color: #94a3b8;
    }

    .header-actions-area {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-admin-auth {
      background: rgba(217, 119, 6, 0.2);
      color: #fde68a;
      border: 1.5px solid rgba(245, 158, 11, 0.6);
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-admin-auth:hover {
      background: rgba(217, 119, 6, 0.35);
      border-color: #f59e0b;
      transform: translateY(-1px);
    }

    .btn-export-html {
      background: #2563eb;
      color: #ffffff;
      border: 1.5px solid #3b82f6;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-export-html:hover {
      background: #1d4ed8;
      border-color: #60a5fa;
      transform: translateY(-1px);
    }

    /* 主內容容器 */
    .app-main {
      max-width: 1320px;
      margin: 0 auto;
      padding: 24px 20px 48px;
      flex: 1;
      width: 100%;
    }

    /* 浮動提示 Toast */
    .toast-notice {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #7f1d1d;
      color: #ffffff;
      border: 2px solid #f87171;
      padding: 12px 28px;
      border-radius: 16px;
      font-weight: 900;
      font-size: 14px;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35);
      z-index: 10000;
      display: none;
      animation: toastPop 0.25s ease-out;
      text-align: center;
      max-width: 90vw;
    }

    @keyframes toastPop {
      from { opacity: 0; transform: translate(-50%, -15px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }

    /* 直出首頁通知橫幅 */
    .top-direct-banner {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 16px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      gap: 12px;
      flex-wrap: wrap;
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .banner-badge-icon {
      width: 32px;
      height: 32px;
      background: #dc2626;
      color: #fff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 16px;
      flex-shrink: 0;
    }
    .banner-title {
      font-size: 14px;
      font-weight: 900;
      color: #7f1d1d;
    }
    .banner-sub {
      font-size: 12px;
      color: #b91c1c;
      margin-top: 2px;
      font-weight: 600;
    }

    /* BRAND SELECTION GRID (品牌首頁) */
    .brand-section-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .brand-section-title {
      font-size: 30px;
      font-weight: 900;
      color: #020617;
      letter-spacing: -0.5px;
    }
    .brand-section-subtitle {
      font-size: 15px;
      color: #475569;
      margin-top: 6px;
      font-weight: 600;
    }

    .brand-grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .brand-rich-card {
      border-radius: 20px;
      padding: 22px;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 180px;
      box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.15);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .brand-rich-card:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 20px 30px -4px rgba(0, 0, 0, 0.25);
      border-color: rgba(255, 255, 255, 0.4);
    }
    .brand-rich-card:active {
      transform: translateY(-1px) scale(0.99);
    }

    .brand-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-card-name {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.4px;
    }
    .brand-card-arrow {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 900;
      transition: all 0.2s;
    }
    .brand-rich-card:hover .brand-card-arrow {
      background: #ffffff;
      color: #0f172a;
      transform: translateX(3px);
    }

    .brand-card-desc {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 8px;
      line-height: 1.4;
      font-weight: 500;
    }

    .brand-card-footer {
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
    }
    .brand-card-count {
      font-size: 12px;
      background: rgba(255, 255, 255, 0.2);
      padding: 3px 10px;
      border-radius: 8px;
      font-weight: 800;
    }
    .brand-card-price {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      font-size: 16px;
      letter-spacing: -0.2px;
    }

    /* MODEL PRICING TABLE (機型比價清單) */
    .table-nav-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 2px solid #cbd5e1;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .btn-return-brands {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 22px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
    }
    .btn-return-brands:hover {
      background: #dc2626;
      transform: scale(1.02);
    }

    .table-brand-headline {
      font-size: 24px;
      font-weight: 900;
      color: #020617;
    }
    .table-count-badge {
      font-size: 13px;
      font-weight: 800;
      color: #475569;
      background: #ffffff;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      margin-left: 8px;
    }

    .table-tools-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .model-search-box {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      padding: 6px 12px;
      gap: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    }
    .model-search-box:focus-within {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
    }
    .model-search-input {
      border: none;
      outline: none;
      font-size: 13px;
      color: #0f172a;
      font-weight: 600;
      width: 180px;
    }

    .sort-control-group {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #ffffff;
      padding: 4px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }
    .sort-label-text {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 800;
      padding: 0 6px;
    }
    .btn-sort-toggle {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      background: transparent;
      color: #475569;
    }
    .btn-sort-toggle.active {
      background: #0f172a;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.2);
    }

    /* 表格樣式 */
    .table-card-wrapper {
      background: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.06);
    }

    .table-scroll-container {
      overflow-x: auto;
      overflow-y: auto;
      max-height: calc(100vh - 160px);
      width: 100%;
    }

    .price-data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      text-align: left;
      table-layout: fixed;
      min-width: 980px;
    }

    .th-super {
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.3px;
      border-bottom: 2px solid #cbd5e1;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .th-super-specs {
      background: #f8fafc;
      color: #1e293b;
    }
    .th-super-dianzi {
      background: #dc2626;
      color: #ffffff;
      text-align: center;
      border-left: 2px solid #b91c1c;
      border-right: 2px solid #b91c1c;
    }
    .th-super-fdi {
      background: #2563eb;
      color: #ffffff;
      text-align: center;
      border-right: 2px solid #1d4ed8;
    }
    .th-super-rec {
      background: #f59e0b;
      color: #0f172a;
      text-align: center;
    }

    .th-sub {
      position: sticky;
      top: 45px;
      z-index: 10;
      background: #f8fafc;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 800;
      color: #475569;
      border-bottom: 2px solid #cbd5e1;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .th-sub-dianzi {
      background: #fef2f2;
      color: #991b1b;
      border-left: 1px solid #fecaca;
      border-right: 1px solid #fecaca;
    }
    .th-sub-fdi {
      background: #eff6ff;
      color: #1e40af;
      border-right: 1px solid #bfdbfe;
    }
    .th-sub-rec {
      background: #fffbeb;
      color: #92400e;
      text-align: center;
    }

    .price-data-table tbody tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.15s ease;
      cursor: pointer;
    }
    .price-data-table tbody tr:hover {
      background: #f8fafc;
    }

    .td-cell {
      padding: 14px;
      vertical-align: middle;
      font-size: 13px;
    }

    .td-model-title {
      font-weight: 900;
      font-size: 15px;
      color: #0f172a;
      letter-spacing: -0.2px;
    }

    .tag-capacity {
      display: inline-block;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      font-weight: 800;
      background: #f1f5f9;
      color: #1e293b;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
    }

    .td-dianzi-wrap {
      background: rgba(254, 242, 242, 0.4);
      border-left: 1px solid #fee2e2;
      border-right: 1px solid #fee2e2;
      white-space: nowrap;
    }
    .td-fdi-wrap {
      background: rgba(239, 246, 255, 0.4);
      border-right: 1px solid #dbeafe;
      white-space: nowrap;
    }
    .td-rec-wrap {
      background: rgba(254, 243, 199, 0.4);
      text-align: center;
      white-space: nowrap;
    }

    .price-a-dianzi {
      font-family: ui-monospace, monospace;
      font-size: 16px;
      font-weight: 900;
      color: #991b1b;
      white-space: nowrap;
    }
    .price-a-fdi {
      font-family: ui-monospace, monospace;
      font-size: 16px;
      font-weight: 900;
      color: #1e40af;
      white-space: nowrap;
      letter-spacing: -0.2px;
    }
    .price-s-fdi {
      font-family: ui-monospace, monospace;
      font-size: 12px;
      font-weight: 800;
      color: #4338ca;
      margin-bottom: 2px;
      white-space: nowrap;
    }
    .price-bc-sub {
      font-family: ui-monospace, monospace;
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
      font-weight: 700;
      white-space: nowrap;
    }

    .badge-winner-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 900;
    }
    .badge-win-dianzi {
      background: #dc2626;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
    }
    .badge-win-fdi {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
    }
    .badge-win-tie {
      background: #e2e8f0;
      color: #475569;
    }

    .btn-table-calc {
      background: #0f172a;
      color: #ffffff;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
    }
    .btn-table-calc:hover {
      background: #dc2626;
    }

    /* 彈窗樣式 */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-window {
      background: #ffffff;
      border-radius: 24px;
      max-width: 880px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      border: 2px solid #cbd5e1;
      animation: modalPop 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalPop {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-head {
      background: #0f172a;
      color: #ffffff;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-head-h3 {
      font-size: 18px;
      font-weight: 900;
    }
    .modal-head-sub {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 2px;
      font-weight: 600;
    }
    .btn-modal-close {
      background: transparent;
      color: #94a3b8;
      font-size: 20px;
      font-weight: 900;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    .btn-modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .modal-content-area {
      padding: 22px 24px;
      overflow-y: auto;
      flex: 1;
    }
    .field-title {
      font-size: 13px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 8px;
      display: block;
    }

    .vendor-switch-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .btn-vendor-card {
      padding: 12px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      font-weight: 900;
      font-size: 14px;
      color: #475569;
    }
    .btn-vendor-card.active-dianzi {
      border-color: #dc2626;
      background: #fef2f2;
      color: #7f1d1d;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
    }
    .btn-vendor-card.active-fdi {
      border-color: #2563eb;
      background: #eff6ff;
      color: #1e3a8a;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }

    .grades-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 8px;
      margin-bottom: 16px;
    }
    .btn-grade-card {
      padding: 10px 8px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      text-align: center;
    }
    .btn-grade-card.active-grade {
      border-color: #dc2626;
      background: #fef2f2;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
    }

    .calc-result-box {
      background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%);
      border: 2px solid #fca5a5;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .calc-res-label {
      font-size: 12px;
      font-weight: 800;
      color: #991b1b;
    }
    .calc-res-amount {
      font-family: ui-monospace, monospace;
      font-size: 32px;
      font-weight: 900;
      color: #b91c1c;
      margin: 4px 0;
    }
    .calc-res-sub {
      font-size: 12px;
      color: #b91c1c;
      font-weight: 600;
    }

    .modal-foot-bar {
      padding: 14px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .btn-copy-quote {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .btn-copy-quote:hover {
      background: #f1f5f9;
    }

    .app-footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: auto;
    }
  </style>
</head>
<body>

  <!-- =========================================================
       MOBILE & TABLET DEVICE BLOCKER OVERLAY (限定電腦網頁版開啟，平板與手機無法開啟)
       ========================================================= -->
  <div id="mobileBlockerOverlay" style="display: none; position: fixed; inset: 0; z-index: 999999; background: #020617; color: #ffffff; padding: 24px; justify-content: center; align-items: center;">
    <div style="max-width: 440px; margin: auto; background: #0f172a; border: 2px solid rgba(239, 68, 68, 0.5); border-radius: 28px; padding: 36px 24px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
      <div style="font-size: 52px; margin-bottom: 14px;">💻 🚫📱</div>
      <div style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; display: inline-block; padding: 5px 16px; border-radius: 9999px; font-weight: 900; font-size: 12px; margin-bottom: 14px; border: 1px solid rgba(239, 68, 68, 0.4);">
        裝置受限 · 平板與手機無法開啟
      </div>
      <h2 style="font-size: 22px; font-weight: 900; margin-bottom: 8px; color: #ffffff;">限定電腦網頁版開啟</h2>
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 22px;">
        因雙通路（點子行動 vs FDI）完整規格與多等級即時比價表格需較寬螢幕顯示以利前線精確報價，本系統限制無法於平板或手機端開啟。<br><br>
        <strong style="color: #fca5a5;">請改用門市公務電腦或筆記型電腦瀏覽器開啟。</strong>
      </p>
      <div style="font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 14px;">
        門市舊機回收專用系統 · 電腦網頁版限定
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastBar" class="toast-notice"></div>

  <!-- Top Header Navigation -->
  <header class="top-header">
    <div class="brand-logo-area">
      <div class="brand-icon-box">📊</div>
      <div>
        <h1 class="header-h1">
          <span>舊機回收即時報價平台</span>
          <span class="badge-offline-mode" id="headerStatusBadge">● 待更新檔案</span>
        </h1>
        <div class="header-sub-text">門市專用即時比價系統 · 半月定期更新</div>
      </div>
    </div>

    <div class="header-middle-bar">
      <span>💻 電腦版專屬</span>
      <span>|</span>
      <span id="headerDeviceCount">尚未更新報價檔，請點擊「更新報價庫」</span>
    </div>

    <div class="header-actions-area">
      <!-- Admin Update Button (免密碼) -->
      <button type="button" id="btnAdminModal" onclick="openAdminModal()" class="btn-admin-auth">
        <span>📂 更新報價庫</span>
      </button>

      <!-- Export Standalone HTML Button -->
      <button type="button" id="btnExportHtml" onclick="exportUpdatedStandaloneHtml()" class="btn-export-html" title="轉出已內建最新報價之單機版 HTML，直接傳給門市免再匯入">
        <span>📥 轉出單機版 HTML</span>
      </button>

      <!-- Clear Database Button -->
      <button type="button" id="btnClearDb" onclick="clearDatabase()" style="background: rgba(225, 29, 72, 0.2); color: #fda4af; border: 1.5px solid rgba(244, 63, 94, 0.5); padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; display: none;" title="清除上傳資料庫，恢復為未更新初始狀態">
        <span>🗑️ 清除資料庫</span>
      </button>
    </div>
  </header>

  <!-- Main Content View Container -->
  <main class="app-main">

    <!-- =========================================================
         STATE 0: EMPTY STATE (尚未更新檔案時僅顯示標題文字，不露出品牌)
         ========================================================= -->
    <div id="viewEmptyUploadPrompt" style="display: none; padding: 20px 16px; max-width: 1200px; margin: 0 auto;">
      <div class="brand-section-header" style="margin-bottom: 36px;">
        <h2 class="brand-section-title">請選擇舊機回收品牌</h2>
        <p class="brand-section-subtitle">點選以下手機品牌，立即查看 點子行動 與 FDI 雙通路完整報價與比價</p>
      </div>

      <label for="adminFileInput" style="display: block; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 24px; padding: 40px 24px; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.04); max-width: 640px; margin: 0 auto; cursor: pointer;">
        <div style="width: 64px; height: 64px; border-radius: 20px; background: #fffbeb; color: #d97706; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; border: 1px solid #fde68a;">
          📊
        </div>
        <h3 style="font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 8px;">
          尚未完成報價資料檔更新
        </h3>
        <p style="font-size: 13px; color: #64748b; max-width: 460px; margin: 0 auto 24px; line-height: 1.6;">
          本系統依規定需先完成最新「舊機回收價格比較.xlsx」資料檔更新後，方會揭露顯示各品牌機型與比價資訊。
        </p>
        <div style="display: flex; justify-content: center;">
          <span style="display: inline-flex; align-items: center; gap: 8px; background: #dc2626; color: #ffffff; padding: 14px 32px; border-radius: 14px; font-weight: 900; font-size: 14px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);">
            <span>📁 點擊選取新版「舊機回收價格比較.xlsx」</span>
          </span>
        </div>
      </label>
    </div>

    <!-- =========================================================
         STATE 1: BRAND SELECTION GRID (更新檔案後方可查看各品牌卡片)
         ========================================================= -->
    <div id="viewBrandGrid" style="display: none;">
      <div class="brand-section-header">
        <h2 class="brand-section-title">請選擇舊機回收品牌</h2>
        <p class="brand-section-subtitle">點選以下手機品牌，立即查看 點子行動 與 FDI 雙通路完整報價與比價</p>
      </div>
      <div id="fileUpdateAnnotationBar" style="display: none; margin: 0 auto 24px; max-width: 1200px;"></div>

      <!-- 門市舊機回收注意事項與常見異常疏失注意 (點選彈出視窗警示) -->
      <div style="background: linear-gradient(to right, rgba(254, 243, 199, 0.7), rgba(255, 237, 213, 0.5), rgba(255, 228, 230, 0.6)); border: 2px solid #fcd34d; border-radius: 16px; padding: 12px 18px; margin: 0 auto 20px; max-width: 1200px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 8px rgba(245,158,11,0.06);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: #f59e0b; color: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; shrink: 0;">⚠️</div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 10.5px; font-weight: 900; background: #f59e0b; color: #0f172a; padding: 1px 7px; border-radius: 9999px;">● 門市現場重要檢核</span>
              <span style="font-size: 13.5px; font-weight: 900; color: #0f172a;">舊機回收注意事項 與 常見異常疏失注意</span>
            </div>
            <p style="font-size: 11.5px; color: #64748b; margin-top: 2px; font-weight: 500;">為避免高估等別賠差額或遭廠商退件，報價前請點選按鈕確認檢核標準：</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <button type="button" onclick="openPrecautionsModal('precautions')" style="background: #fef3c7; border: 1.5px solid #fcd34d; color: #78350f; font-weight: 900; font-size: 12px; padding: 7px 14px; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <span>⚠️ 3 大必要條件</span>
          </button>
          <button type="button" onclick="openPrecautionsModal('mistakes')" style="background: #e11d48; border: none; color: #ffffff; font-weight: 900; font-size: 12px; padding: 7px 14px; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(225,29,72,0.25);">
            <span>🚨 常見異常疏失注意！(9大重點)</span>
          </button>
        </div>
      </div>

      <div id="brandGridContainer" class="brand-grid-layout"></div>
    </div>

    <!-- =========================================================
         STATE 2: MODEL PRICING TABLE (機型比價清單)
         ========================================================= -->
    <div id="viewModelList" style="display: none;">
      <div class="table-nav-row">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <button onclick="navigateBackToBrands()" class="btn-return-brands">
            <span>← 返回品牌首頁</span>
          </button>
          <h2 id="currentBrandHeadline" class="table-brand-headline"></h2>
          <span id="currentBrandCountBadge" class="table-count-badge"></span>
          <span id="lockedModelBadge" style="display: none; font-size: 12px; font-weight: 800; background: #fef2f2; color: #991b1b; padding: 4px 10px; border-radius: 8px; border: 1px solid #fecaca; align-items: center; gap: 6px;"></span>
        </div>

        <div class="table-tools-row">
          <!-- Search box -->
          <div class="model-search-box">
            <input
              type="text"
              id="modelSearchInput"
              class="model-search-input"
              placeholder="搜尋型號、容量..."
              oninput="handleModelSearch(this.value)"
            />
          </div>
        </div>
      </div>

      <!-- 門市舊機回收注意事項 (彈窗觸發條) -->
      <div style="background: linear-gradient(to right, rgba(254, 243, 199, 0.7), rgba(255, 228, 230, 0.6)); border: 1.5px solid #fcd34d; border-radius: 12px; padding: 8px 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="background: #f59e0b; color: #0f172a; font-weight: 900; font-size: 10.5px; padding: 1px 6px; border-radius: 5px;">⚠️ 門市必檢</span>
          <span style="font-size: 12px; font-weight: 800; color: #78350f;">舊機回收檢核警示：</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button type="button" onclick="openPrecautionsModal('precautions')" style="background: #ffffff; border: 1px solid #fcd34d; color: #78350f; font-weight: 900; font-size: 11.5px; padding: 4px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>⚠️ 3 大必要條件</span>
          </button>
          <button type="button" onclick="openPrecautionsModal('mistakes')" style="background: #e11d48; border: none; color: #ffffff; font-weight: 900; font-size: 11.5px; padding: 4px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🚨 常見異常疏失注意 (9大重點)</span>
          </button>
        </div>
      </div>

      <!-- Pricing Comparison Table: 嚴格 100% 寬度分佈 -->
      <div class="table-card-wrapper">
        <div class="table-scroll-container">
          <table class="price-data-table">
            <thead>
              <tr>
                <th colspan="2" class="th-super th-super-specs" style="width: 36%;">機型與規格</th>
                <th colspan="2" class="th-super th-super-dianzi" style="width: 26%;">點子行動 (愛鋒派) 回收報價</th>
                <th colspan="2" class="th-super th-super-fdi" style="width: 28%;">FutureDial (FDI) 回收報價</th>
                <th colspan="1" class="th-super th-super-rec" style="width: 10%;">推薦與試算</th>
              </tr>
              <tr>
                <th class="th-sub" style="width: 25%;">型號名稱</th>
                <th class="th-sub" style="width: 11%; white-space: nowrap;">容量規格</th>
                <th class="th-sub th-sub-dianzi" style="width: 14%; min-width: 120px; white-space: nowrap;">A等 (優良)</th>
                <th class="th-sub th-sub-dianzi" style="width: 12%; min-width: 105px; white-space: nowrap;">B等 / C等</th>
                <th class="th-sub th-sub-fdi" style="width: 16%; min-width: 155px; white-space: nowrap;">S等 / A等</th>
                <th class="th-sub th-sub-fdi" style="width: 12%; min-width: 105px; white-space: nowrap;">B等 / C等</th>
                <th class="th-sub th-sub-rec" style="width: 10%; white-space: nowrap;">推薦勝出</th>
              </tr>
            </thead>
            <tbody id="tableBodyContent"></tbody>
          </table>
        </div>
      </div>
    </div>

  </main>

  <!-- =========================================================
       QUOTE CALCULATOR MODAL (前線門市報價試算彈窗)
       ========================================================= -->
  <div id="quoteModalOverlay" class="modal-overlay" style="display: none;" onclick="handleModalOverlayClick(event)">
    <div class="modal-window">
      <div class="modal-head">
        <div>
          <h3 class="modal-head-h3">舊機回收報價試算</h3>
          <p id="modalDeviceNameSubtitle" class="modal-head-sub"></p>
        </div>
        <button onclick="dismissQuoteModal()" class="btn-modal-close">✕</button>
      </div>

      <div class="modal-content-area">
        <!-- 門市舊機回收注意事項 (彈窗觸發條) -->
        <div style="background: linear-gradient(to right, rgba(254, 243, 199, 0.7), rgba(255, 228, 230, 0.6)); border: 1.5px solid #fcd34d; border-radius: 12px; padding: 8px 12px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="background: #f59e0b; color: #0f172a; font-weight: 900; font-size: 10.5px; padding: 1px 6px; border-radius: 5px;">⚠️ 門市必檢</span>
            <span style="font-size: 11.5px; font-weight: 800; color: #78350f;">回收必要條件與判等注意：</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" onclick="openPrecautionsModal('precautions')" style="background: #ffffff; border: 1px solid #fcd34d; color: #78350f; font-weight: 900; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer;">
              ⚠️ 3 大條件
            </button>
            <button type="button" onclick="openPrecautionsModal('mistakes')" style="background: #e11d48; border: none; color: #ffffff; font-weight: 900; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer;">
              🚨 9 大常見疏失
            </button>
          </div>
        </div>

        <div>
          <label class="field-title">1. 回收通路商</label>
          <div class="vendor-switch-row">
            <button id="btnSwitchDianzi" onclick="selectModalVendor('dianzi')" class="btn-vendor-card">
              點子行動 (愛鋒派)
            </button>
            <button id="btnSwitchFdi" onclick="selectModalVendor('fdi')" class="btn-vendor-card">
              FutureDial (FDI)
            </button>
          </div>
        </div>

        <div>
          <label class="field-title">2. 判定等級</label>
          <div id="modalGradesArea" class="grades-grid"></div>
        </div>

        <!-- Result Box -->
        <div id="modalResultBoxCard" class="calc-result-box" style="padding: 20px 22px; border-radius: 18px; margin-bottom: 16px; transition: all 0.2s ease;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
            <!-- Left: Price & Status -->
            <div>
              <div id="modalResTitleLabel" class="calc-res-label" style="font-size: 13px; font-weight: 800; color: #991b1b;">回收報價實拿金額</div>
              <div id="modalDisplayPrice" class="calc-res-amount" style="font-size: 44px; font-weight: 900; font-family: ui-monospace, monospace; margin: 4px 0; letter-spacing: -0.5px; color: #b91c1c;">NT$ 0</div>
              <div id="modalDisplayDesc" class="calc-res-sub" style="font-size: 12px; font-weight: 700; color: #991b1b;"></div>
            </div>
            
            <!-- Right Option 1: Dianzi Inspection APP QR Code Section (Exact user screenshot match) -->
            <div id="modalDianziQrBox" style="display: none; background: #ffffff; border: 1px solid #fecaca; border-radius: 16px; padding: 14px 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); text-align: center; min-width: 190px;">
              <a href="https://twm.phonedoctorbiz.com/app/download.html" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: block;" title="點擊或掃描下載點子檢測 APP">
                <img id="modalDianziQrImg" src="" alt="點子檢測APP下載QRcode" style="width: 96px; height: 96px; display: block; margin: 0 auto; border-radius: 6px;">
                <div style="font-size: 12px; font-weight: 900; color: #0f172a; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  <span>📱</span>
                  <span>掃描下載檢測 APP</span>
                </div>
              </a>
            </div>

            <!-- Right Option 2: FDI Direct Web Link (User request: FDI的直接用連結網址呈現https://smi-wpi.futuredial.com/zh/) -->
            <div id="modalFdiLinkBox" style="display: none; background: #ffffff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 14px 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); text-align: center; min-width: 220px;">
              <div style="font-size: 13px; font-weight: 900; color: #1e40af; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>🔗</span>
                <span>FDI 線上檢測系統</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin: 4px 0 8px 0;">FutureDial 官方線上檢測網址</div>
              <a href="https://smi-wpi.futuredial.com/zh/" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 900; font-size: 12px; padding: 7px 16px; border-radius: 10px; text-decoration: none; margin-bottom: 6px;">
                開啟 FDI 檢測網站 ↗
              </a>
              <div>
                <a href="https://smi-wpi.futuredial.com/zh/" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-family: ui-monospace, monospace; color: #1d4ed8; text-decoration: underline; word-break: break-all;">
                  https://smi-wpi.futuredial.com/zh/
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Grade Standards Detailed Comparison Table (兩家廠商判等詳細說明) -->
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-top: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="background: #1e293b; color: #ffffff; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-weight: 900; font-size: 13px; display: flex; align-items: center; gap: 6px;">
              <span>📋</span>
              <span>兩家廠商判等詳細說明對照表</span>
            </div>
            <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">門市驗機檢測標準</span>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; line-height: 1.5;">
              <thead>
                <!-- Super category -->
                <tr style="font-weight: 900; text-align: center; font-size: 13px;">
                  <th colspan="3" style="background: #dbeafe; color: #1e3a8a; padding: 8px; border-right: 2px solid #cbd5e1;">
                    點子行動舊機回收報價
                  </th>
                  <th colspan="4" style="background: #fee2e2; color: #7f1d1d; padding: 8px;">
                    FutureDial (FDI) 舊機回收報價
                  </th>
                </tr>
                <!-- Sub grade -->
                <tr style="border-bottom: 2px solid #cbd5e1; font-weight: 900; text-align: center; font-size: 11px;">
                  <th style="background: #eff6ff; color: #1e3a8a; padding: 8px 4px; border-right: 1px solid #e2e8f0; width: 14%;">報價 (A等級)</th>
                  <th style="background: #eff6ff; color: #1e3a8a; padding: 8px 4px; border-right: 1px solid #e2e8f0; width: 14%;">報價 (B等級)</th>
                  <th style="background: #eff6ff; color: #1e3a8a; padding: 8px 4px; border-right: 2px solid #cbd5e1; width: 15%;">報價 (C等級)</th>
                  <th style="background: #fef2f2; color: #7f1d1d; padding: 8px 4px; border-right: 1px solid #e2e8f0; width: 14%;">報價 (S等級)</th>
                  <th style="background: #fef2f2; color: #7f1d1d; padding: 8px 4px; border-right: 1px solid #e2e8f0; width: 14%;">報價 (A等級)</th>
                  <th style="background: #fef2f2; color: #7f1d1d; padding: 8px 4px; border-right: 1px solid #e2e8f0; width: 14%;">報價 (B等級)</th>
                  <th style="background: #fef2f2; color: #7f1d1d; padding: 8px 4px; width: 15%;">報價 (C等級)</th>
                </tr>
              </thead>
              <tbody style="background: #ffffff; vertical-align: top; color: #1e293b;">
                <tr>
                  <!-- 點子 A等 -->
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0;">
                    <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 4px;">
                      自動外觀檢測<br><span style="font-size: 10px; color: #64748b;">(APP操作, 系統判斷)</span>
                    </div>
                    <div>● 螢幕無刮傷</div>
                    <div>● 螢幕顯示正常</div>
                    <div>● 機身三處以內掉漆，無凹傷</div>
                  </td>

                  <!-- 點子 B等 -->
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0;">
                    <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 4px;">
                      自動外觀檢測<br><span style="font-size: 10px; color: #64748b;">(APP操作, 系統判斷)</span>
                    </div>
                    <div>● 螢幕 1 處以內輕微刮痕</div>
                    <div>● 螢幕顯示正常</div>
                    <div>● 機身刮傷三處以內，可以有凹傷</div>
                  </td>

                  <!-- 點子 C等 -->
                  <td style="padding: 10px 8px; border-right: 2px solid #cbd5e1; background: #f8fafc;">
                    <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 4px;">
                      自動外觀檢測<br><span style="font-size: 10px; color: #64748b;">(APP操作, 系統判斷)</span>
                    </div>
                    <div>● 螢幕 2～3 處輕微刮痕</div>
                    <div>● 螢幕顯示輕微瑕疵</div>
                    <div>● 機身刮傷三處以上，可以有凹傷</div>
                  </td>

                  <!-- FDI S等 -->
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0; background: #fef2f2;">
                    <div>● 螢幕/背板/機身/鏡頭皆無刮痕</div>
                    <div>● 螢幕顯示正常</div>
                    <div>● 台灣公司貨</div>
                  </td>

                  <!-- FDI A等 -->
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0;">
                    <div>● 螢幕/背板/機身/鏡頭有些許刮痕或使用痕跡</div>
                    <div>● 螢幕顯示正常</div>
                  </td>

                  <!-- FDI B等 -->
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0;">
                    <div>● 螢幕/背板/鏡頭僅一項破裂、深刮或大面積刮傷</div>
                    <div>● 螢幕顯示正常</div>
                  </td>

                  <!-- FDI C等 -->
                  <td style="padding: 10px 8px; background: #fff1f2;">
                    <div>● 螢幕/背板/鏡頭兩項以上破裂、深刮或大面積刮傷</div>
                    <div>● 螢幕/背板其中一項蜘蛛網狀爆裂</div>
                    <div>● 手機彎曲變形、不密合、上下分離或零件裸露</div>
                    <div>● 螢幕顯示不正常</div>
                    <div>● 未知或問題零件</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-foot-bar">
        <button onclick="copyModalQuoteText()" class="btn-copy-quote" id="btnCopyLineText">
          📋 複製報價文字
        </button>
        <button onclick="dismissQuoteModal()" style="background: #0f172a; color: #ffffff; padding: 9px 20px; border-radius: 10px; font-weight: 800; font-size: 13px;">
          關閉
        </button>
      </div>
    </div>
  </div>

  <!-- =========================================================
       PRECAUTIONS & MISTAKES MODAL (回收注意事項與常見異常疏失彈窗)
       ========================================================= -->
  <div id="precautionsModalOverlay" class="modal-overlay" style="display: none; z-index: 9999;" onclick="if(event.target===this)closePrecautionsModal()">
    <div class="modal-window" style="max-width: 760px;">
      <div class="modal-head" style="background: linear-gradient(to right, #fffbeb, #fff1f2); border-bottom: 2px solid #fecdd3;">
        <div>
          <h3 class="modal-head-h3" style="color: #9f1239; display: flex; align-items: center; gap: 8px;">
            <span>⚠️ 門市舊機回收檢核警示</span>
          </h3>
          <p class="modal-head-sub" style="color: #78350f;">3 大必要條件 · 9 大常見判等異常疏失防範</p>
        </div>
        <button onclick="closePrecautionsModal()" class="btn-modal-close">✕</button>
      </div>

      <!-- Tab Buttons -->
      <div style="display: flex; gap: 8px; padding: 12px 18px 0 18px; border-bottom: 1px solid #e2e8f0; background: #ffffff;">
        <button id="btnTabPrecautions" onclick="switchPrecautionsTab('precautions')" style="padding: 8px 14px; border: none; background: transparent; font-weight: 900; font-size: 13px; color: #92400e; border-bottom: 3px solid #f59e0b; cursor: pointer;">
          ⚠️ 3 大必要條件
        </button>
        <button id="btnTabMistakes" onclick="switchPrecautionsTab('mistakes')" style="padding: 8px 14px; border: none; background: transparent; font-weight: 900; font-size: 13px; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">
          🚨 常見異常疏失注意！(9大重點)
        </button>
        <button id="btnTabAll" onclick="switchPrecautionsTab('all')" style="padding: 8px 14px; border: none; background: transparent; font-weight: 900; font-size: 13px; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">
          📋 全部檢視
        </button>
      </div>

      <div class="modal-content-area" style="max-height: 68vh; overflow-y: auto; padding: 16px 20px;">
        <!-- TAB 1: 3 大必要條件 -->
        <div id="sectionPrecautionsContent" style="display: block;">
          <div style="background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;">
            <div style="font-size: 13px; font-weight: 900; color: #92400e; margin-bottom: 4px;">
              ⚠️ 門市回收必檢核 3 大必要條件（缺一不可）
            </div>
            <div style="font-size: 11.5px; color: #78350f;">
              門市收件前必須逐項親自確認，任一條件不符一律退件無法回收：
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 12px; padding: 12px 14px; display: flex; gap: 12px; align-items: flex-start;">
              <span style="background: #be123c; color: #ffffff; font-weight: 900; font-size: 13px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</span>
              <div>
                <div style="font-weight: 900; font-size: 13px; color: #be123c; margin-bottom: 2px;">已登出 iCloud / Google 帳號</div>
                <div style="font-size: 12px; color: #475569;">iOS 裝置必須關閉「尋找我的 iPhone」並完整登出 Apple ID；Android 裝置必須移除 Google 帳號與品牌專屬帳號（如 Samsung 帳號）。未登出將直接退件！</div>
              </div>
            </div>
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 12px 14px; display: flex; gap: 12px; align-items: flex-start;">
              <span style="background: #0f172a; color: #ffffff; font-weight: 900; font-size: 13px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</span>
              <div>
                <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-bottom: 2px;">已恢復原廠設定</div>
                <div style="font-size: 12px; color: #475569;">清除所有資料與內容，確保消費者個人私隱與敏感檔案完全抹除，裝置顯示初始設定「Hello / 歡迎」畫面。</div>
              </div>
            </div>
            <div style="background: #ffffff; border: 1.5px solid #fecaca; border-radius: 12px; padding: 12px 14px; display: flex; gap: 12px; align-items: flex-start;">
              <span style="background: #b91c1c; color: #ffffff; font-weight: 900; font-size: 13px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</span>
              <div>
                <div style="font-weight: 900; font-size: 13px; color: #b91c1c; margin-bottom: 2px;">可正常開關機且無任何密碼鎖</div>
                <div style="font-size: 12px; color: #475569;">主機板與電源鍵運作正常，螢幕無鎖定密碼、圖形鎖、PIN 碼、SIM 卡鎖或企業 MDM 控管鎖。</div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: 9 大常見異常疏失注意 -->
        <div id="sectionMistakesContent" style="display: none;">
          <div style="background: #fff1f2; border: 1.5px solid #fda4af; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;">
            <div style="font-size: 13px; font-weight: 900; color: #be123c; margin-bottom: 4px;">
              🚨 常見異常疏失注意！（切勿高估等級，避免門市補貼差額或退件）
            </div>
            <div style="font-size: 11.5px; color: #9f1239;">
              以下為後端驗收最常抓到的 9 種門市判等疏失，請門市人員特別注意正確評等：
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 8px;">
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #9f1239;">螢幕漏液</span>
                <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 800;">應為 C 級 (誤A級)</span>
              </div>
              <div style="font-size: 11.5px; color: #64748b;">螢幕出現黑斑、漏液、色塊或亮線，應判定為 C 級，切勿誤判為 A 級！</div>
            </div>
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #9f1239;">電池為未知零件</span>
                <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 800;">應為 C 級 (誤A級)</span>
              </div>
              <div style="font-size: 11.5px; color: #64748b;">設定中提示「無法驗證此 iPhone 具有原廠電池」，應判定為 C 級，切勿誤判為 A 級！</div>
            </div>
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #9f1239;">相機為未知零件</span>
                <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 800;">應為 C 級 (誤S級)</span>
              </div>
              <div style="font-size: 11.5px; color: #64748b;">相機模組顯示非原廠零件警示，應判定為 C 級，切勿誤判為 S 級！</div>
            </div>
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #9f1239;">螢幕為未知零件</span>
                <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 800;">應為 C 級 (誤S級)</span>
              </div>
              <div style="font-size: 11.5px; color: #64748b;">螢幕顯示未知零件或副廠更換訊息，應判定為 C 級，切勿誤判為 S 級！</div>
            </div>
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #9f1239;">背板破裂</span>
                <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 800;">應為 B 級 (誤A級)</span>
              </div>
              <div style="font-size: 11.5px; color: #64748b;">後蓋玻璃或機背有碎裂、放射狀裂痕，應判定為 B 級，切勿誤判為 A 級！</div>
            </div>
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #9f1239;">相機鏡頭破裂</span>
                <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 800;">應為 B 級 (誤A級)</span>
              </div>
              <div style="font-size: 11.5px; color: #64748b;">外鏡頭保護玻璃有裂紋、缺角或碎裂，應判定為 B 級，切勿誤判為 A 級！</div>
            </div>
            <div style="background: #fff1f2; border: 1.5px solid #fda4af; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #be123c;">帳號/密碼未登出或解除</span>
                <span style="font-size: 11px; background: #e11d48; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 800;">不可回收 / 退件</span>
              </div>
              <div style="font-size: 11.5px; color: #881337;">個人帳號與螢幕密碼未解除者，後端無法進行任何檢測與抹除，直接原機退件！</div>
            </div>
            <div style="background: #fff1f2; border: 1.5px solid #fda4af; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #be123c;">APPLE ID 擁有者鎖定</span>
                <span style="font-size: 11px; background: #e11d48; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 800;">不可回收 / 退件</span>
              </div>
              <div style="font-size: 11.5px; color: #881337;">開機畫面卡在「iPhone 已為擁有者鎖定」啟動鎖，無法做任何處理，直接原機退件！</div>
            </div>
            <div style="background: #fff1f2; border: 1.5px solid #fda4af; border-radius: 10px; padding: 10px 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 900; font-size: 12.5px; color: #be123c;">三星(Google)密碼未解</span>
                <span style="font-size: 11px; background: #e11d48; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 800;">不可回收 / 退件</span>
              </div>
              <div style="font-size: 11.5px; color: #881337;">Samsung FRP 鎖定或 Google 原廠防盜鎖未解除，無法重設使用，直接原機退件！</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="padding: 12px 20px; display: flex; justify-content: flex-end; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        <button onclick="closePrecautionsModal()" style="background: #0f172a; color: #ffffff; padding: 8px 24px; border-radius: 10px; font-weight: 800; font-size: 13px; border: none; cursor: pointer;">
          我已確認並知悉
        </button>
      </div>
    </div>
  </div>

  <!-- =========================================================
       ADMIN UPDATE MODAL (免密碼定期更新)
       ========================================================= -->
  <div id="adminUpdateOverlay" class="modal-overlay" style="display: none;" onclick="if(event.target===this)closeAdminModal()">
    <div class="modal-window" style="max-width: 500px;">
      <div class="modal-head">
        <div>
          <h3 class="modal-head-h3">報價庫半月定期更新</h3>
          <p class="modal-head-sub">直接上傳「舊機回收價格比較.xlsx」· 免密碼快速更新</p>
        </div>
        <button onclick="closeAdminModal()" class="btn-modal-close">✕</button>
      </div>

      <div class="modal-content-area">
        <!-- Direct Upload Excel File (免密碼) -->
        <div id="adminUploadStep">
          <div id="adminUploadInfoText" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; color: #475569;">
            每半個月更新報價檔案時，請直接點選或拖曳新版「舊機回收價格比較.xlsx」進行解析與套用。
          </div>
          <input type="file" id="adminFileInput" accept=".xlsx, .xls, .csv, .XLSX, .XLS, .CSV, *" style="display: none;" onchange="handleAdminFileSelected(event)">
          <label id="adminDropzoneLabel" for="adminFileInput" style="display: block; border: 2px dashed #dc2626; background: #fef2f2; border-radius: 16px; padding: 26px; text-align: center; cursor: pointer; margin-bottom: 14px;">
            <div style="font-size: 36px; margin-bottom: 6px;">📁</div>
            <div style="font-weight: 900; color: #991b1b; font-size: 14px;">點擊選取新版「舊機回收價格比較.xlsx」</div>
            <div style="font-size: 12px; color: #b91c1c; margin-top: 4px;">支援 Microsoft Excel 活頁簿 (.xlsx / .xls / .csv) · 免密碼即時匯入</div>
            <div style="margin-top: 12px;">
              <span style="display: inline-block; background: #dc2626; color: #fff; font-weight: 900; font-size: 12px; padding: 8px 18px; border-radius: 10px;">選取本機檔案上傳</span>
            </div>
          </label>
          <div id="adminParseStatus" style="font-size: 12px; color: #475569; text-align: center;"></div>
        </div>
      </div>

      <div id="adminModalFootBar" class="modal-foot-bar">
        <span style="font-size: 11px; color: #64748b;">每半月定時維護 · 即時匯入雙通路報價</span>
        <button onclick="closeAdminModal()" style="background: #e2e8f0; color: #1e293b; padding: 8px 16px; border-radius: 8px; font-weight: 800; font-size: 12px;">
          關閉
        </button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="app-footer">
    舊機回收價格比較 (點子行動 vs FDI) · 門市專用即時比價系統 · 電腦專用 · 平板與手機端無法開啟 · 報價以門市系統判定為準
  </footer>

  <!-- EMBEDDED XLSX PARSER FOR OFFLINE FILE IMPORT -->
  <script>
    ${xlsxMiniCode}
  </script>

  <!-- =========================================================
       NATIVE LIGHTWEIGHT CLIENT-SIDE JAVASCRIPT
       ========================================================= -->
  <script>
    // Embedded Verified Dataset
    var RAW_DEVICE_DATA = ${jsonDevices};
    var RAW_FILE_META = null;
    var DIANZI_IOS_QR_DATA = "${DIANZI_IOS_QR}";
    var activeDevices = RAW_DEVICE_DATA.slice();
    var activeFileMeta = RAW_FILE_META;
    var currentSelectedBrand = null;
    var currentExactModel = null;
    var currentSortOrder = 'priceDesc';
    var currentSearchKeyword = '';

    function formatTime(ts) {
      if (!ts) return '';
      var d = new Date(ts);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      var hh = String(d.getHours()).padStart(2, '0');
      var mm = String(d.getMinutes()).padStart(2, '0');
      return y + '/' + m + '/' + day + ' ' + hh + ':' + mm;
    }

    var BRAND_METAS = [
      { key: 'APPLE', name: 'Apple', desc: 'iPhone 13 ~ 17 系列、iPad Pro / Air / mini', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', maxClr: '#f87171' },
      { key: 'SAMSUNG', name: 'Samsung 三星', desc: 'Galaxy S25 ~ S20、Z Fold / Flip、A系列', bg: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', maxClr: '#fde047' },
      { key: 'Google', name: 'Google', desc: 'Pixel 9 ~ 5 系列、Pro Fold 摺疊機', bg: 'linear-gradient(135deg, #b45309 0%, #dc2626 100%)', maxClr: '#fef08a' },
      { key: 'ASUS', name: 'ASUS 華碩', desc: 'ROG Phone 9 ~ 5、Zenfone 12 ~ 7', bg: 'linear-gradient(135deg, #991b1b 0%, #171717 100%)', maxClr: '#fca5a5' },
      { key: 'OPPO', name: 'OPPO', desc: 'Reno 15 ~ 5 系列、Find X8 / X3', bg: 'linear-gradient(135deg, #991b1b 0%, #be123c 100%)', maxClr: '#fca5a5' },
      { key: 'vivo', name: 'vivo', desc: 'X300 ~ X80 蔡司旗艦、V系列', bg: 'linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%)', maxClr: '#67e8f9' },
      { key: 'MI', name: '小米 Xiaomi', desc: 'Xiaomi 15 ~ 12 徠卡影像系列', bg: 'linear-gradient(135deg, #c2410c 0%, #78350f 100%)', maxClr: '#fef08a' },
      { key: 'moto', name: 'Motorola', desc: 'razr 60 ~ 40 摺疊、edge 系列', bg: 'linear-gradient(135deg, #581c87 0%, #312e81 100%)', maxClr: '#d8b4fe' },
      { key: 'realme', name: 'realme', desc: 'GT 8 ~ 6 旗艦系列、數字系列', bg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', maxClr: '#fde047' },
      { key: 'SONY', name: 'SONY 索尼', desc: 'Xperia 1 / 5 / 10 系列、PRO-I', bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', maxClr: '#f87171' },
      { key: 'NOTHING', name: 'Nothing', desc: 'Phone (3a) / (2a) / (2) / (1)', bg: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)', maxClr: '#fda4af' }
    ];

    var currentModalDevice = null;
    var currentModalVendor = 'dianzi';
    var currentModalGrade = 'A';

    // Safe clipboard copy
    function universalCopy(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function(resolve, reject) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          resolve();
        } catch(e) {
          reject(e);
        }
      });
    }

    function showNotice(msg) {
      var bar = document.getElementById('toastBar');
      bar.innerText = msg;
      bar.style.display = 'block';
      setTimeout(function() {
        bar.style.display = 'none';
      }, 3500);
    }

    // Mobile & Tablet Device Blocker Check
    function checkMobileDevice() {
      var ua = navigator.userAgent || '';
      var isMobileOrTablet =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle|PlayBook/i.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && window.innerWidth < 1024) ||
        (Boolean(navigator.userAgentData && navigator.userAgentData.mobile));

      var ov = document.getElementById('mobileBlockerOverlay');
      if (ov) {
        if (isMobileOrTablet) {
          ov.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        } else {
          ov.style.display = 'none';
          document.body.style.overflow = '';
        }
      }
    }

    // Render Brand Selection Grid
    function renderBrandSelectionGrid() {
      var emptyPrompt = document.getElementById('viewEmptyUploadPrompt');
      var gridView = document.getElementById('viewBrandGrid');
      var btnClear = document.getElementById('btnClearDb');
      var btnExport = document.getElementById('btnExportHtml');
      var btnAdmin = document.getElementById('btnAdminModal') || document.querySelector('.btn-admin-auth');

      if (!activeDevices || activeDevices.length === 0) {
        if (emptyPrompt) emptyPrompt.style.display = 'block';
        if (gridView) gridView.style.display = 'none';
        if (btnClear) btnClear.style.display = 'none';
        if (btnExport) btnExport.style.display = 'none';
        if (btnAdmin) btnAdmin.style.display = 'inline-flex';
        var badge = document.getElementById('headerStatusBadge');
        if (badge) {
          badge.innerText = '● 待更新檔案';
          badge.style.background = 'rgba(245, 158, 11, 0.2)';
          badge.style.color = '#fde68a';
          badge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        }
        var countEl = document.getElementById('headerDeviceCount');
        if (countEl) countEl.innerText = '尚未更新報價檔，請點擊「更新報價庫」';
        return;
      }

      if (emptyPrompt) emptyPrompt.style.display = 'none';
      if (gridView) gridView.style.display = 'block';
      // User Requirement 2: 匯入資料以後的頁面就不需要 更新報價庫、轉出更新好的單機版、清除資料庫 這些功能，可以移除
      if (btnClear) btnClear.style.display = 'none';
      if (btnExport) btnExport.style.display = 'none';
      if (btnAdmin) btnAdmin.style.display = 'none';

      var badge = document.getElementById('headerStatusBadge');
      if (badge) {
        badge.innerText = '● 報價庫已更新';
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#fca5a5';
        badge.style.borderColor = 'rgba(252, 165, 165, 0.4)';
      }
      var countEl = document.getElementById('headerDeviceCount');
      var dateStr = activeFileMeta ? formatTime(activeFileMeta.lastModified) : '';
      if (countEl) {
        countEl.innerText = '已收錄 ' + activeDevices.length + ' 款機型最新雙通路底價' + (dateStr ? ' | 檔案更新時間：' + dateStr : '');
      }

      var bar = document.getElementById('fileUpdateAnnotationBar');
      if (bar) {
        if (activeFileMeta) {
          bar.style.display = 'block';
          bar.innerHTML = [
            '<div style="background: linear-gradient(to right, #fef2f2, #fff1f2, #f8fafc); border: 2px solid #fca5a5; border-radius: 18px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">',
            '  <div style="display: flex; align-items: center; gap: 14px;">',
            '    <div style="width: 44px; height: 44px; border-radius: 14px; background: #dc2626; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 22px;">📅</div>',
            '    <div>',
            '      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">',
            '        <span style="font-size: 11px; font-weight: 900; background: #fecaca; color: #991b1b; padding: 2px 10px; border-radius: 9999px;">● 報價檔已生效</span>',
            '        <span style="font-size: 12px; font-weight: 700; color: #475569; font-family: monospace;">檔案：' + (activeFileMeta.name || '舊機回收價格比較.xlsx') + '</span>',
            '      </div>',
            '      <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 4px;">',
            '        本份檔案更新時間：<span style="font-family: monospace; color: #b91c1c; font-size: 16px; background: #ffffff; padding: 2px 8px; border-radius: 6px; border: 1px solid #fecaca;">' + dateStr + '</span>',
            '        <span style="font-size: 12px; color: #64748b; font-weight: 500;">(共收錄 ' + activeDevices.length + ' 款機型最新雙通路底價)</span>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div style="font-size: 12px; color: #64748b; font-family: monospace;">',
            '    <div>匯入時間：' + formatTime(activeFileMeta.importedAt || Date.now()) + '</div>',
            '    <div style="font-size: 11px; color: #dc2626; font-weight: 700; margin-top: 2px;">● 門市現場比價已同步生效</div>',
            '  </div>',
            '</div>'
          ].join('');
        } else {
          bar.style.display = 'none';
        }
      }

      var container = document.getElementById('brandGridContainer');
      if (!container) return;
      container.innerHTML = '';

      var uniqueBrands = [];
      activeDevices.forEach(function(d) {
        if (d.brand && uniqueBrands.indexOf(d.brand) === -1) {
          uniqueBrands.push(d.brand);
        }
      });

      // User Requirement 1: 顯示出來的排序由回收機款的多到少來做排序，且 Google 排序在 ASUS 前面
      uniqueBrands.sort(function(a, b) {
        var countA = activeDevices.filter(function(d) { return d.brand === a; }).length;
        var countB = activeDevices.filter(function(d) { return d.brand === b; }).length;
        if (countB !== countA) {
          return countB - countA; // 多到少 (descending)
        }
        var isGoogleA = a.toLowerCase() === 'google';
        var isGoogleB = b.toLowerCase() === 'google';
        var isAsusA = a.toLowerCase() === 'asus';
        var isAsusB = b.toLowerCase() === 'asus';
        if (isGoogleA && isAsusB) return -1;
        if (isAsusA && isGoogleB) return 1;

        return a.localeCompare(b, 'zh-TW');
      });

      uniqueBrands.forEach(function(bKey) {
        var devs = activeDevices.filter(function(d) { return d.brand === bKey; });
        var count = devs.length;
        if (count === 0) return;

        var meta = BRAND_METAS.find(function(m) { return m.key.toLowerCase() === bKey.toLowerCase(); });
        var bName = meta ? meta.name : bKey;
        var bDesc = meta ? meta.desc : bKey + ' 全系列智慧手機回收機型';
        var bBg = meta ? meta.bg : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
        var bClr = meta ? meta.maxClr : '#f87171';

        var maxPrice = 0;
        devs.forEach(function(d) {
          if (d.maxPriceA > maxPrice) maxPrice = d.maxPriceA;
        });

        var uniqueModels = [];
        devs.forEach(function(d) {
          if (d.model && uniqueModels.indexOf(d.model) === -1) {
            uniqueModels.push(d.model);
          }
        });
        uniqueModels.sort(function(a, b) { return a.localeCompare(b, 'zh-TW'); });

        var modelOptionsHtml = ['<option value="" disabled selected>▼ 快速挑選 ' + bName + ' 機款...</option>'];
        uniqueModels.forEach(function(m) {
          modelOptionsHtml.push('<option value="' + m.replace(/"/g, '&quot;') + '">' + m + '</option>');
        });

        var card = document.createElement('div');
        card.className = 'brand-rich-card';
        card.style.background = bBg;
        card.onclick = function() { enterBrandView(bKey); };

        card.innerHTML = [
          '<div>',
            '<div class="brand-card-header">',
              '<span class="brand-card-name">' + bName + '</span>',
              '<span class="brand-card-arrow">→</span>',
            '</div>',
            '<div class="brand-card-desc">' + bDesc + '</div>',
            '<div style="margin-top: 14px;" onclick="event.stopPropagation()">',
              '<select data-brand="' + bKey + '" onchange="if(this.value){enterBrandModelView(this.getAttribute(&quot;data-brand&quot;), this.value);}" style="width: 100%; background: rgba(255,255,255,0.95); color: #0f172a; font-weight: 800; font-size: 12px; padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; outline: none;">',
                modelOptionsHtml.join(''),
              '</select>',
            '</div>',
          '</div>',
          '<div class="brand-card-footer" style="margin-top: 14px;">',
            '<span class="brand-card-count">收錄 ' + count + ' 款機型</span>',
            '<span class="brand-card-price" style="color: ' + bClr + '">最高 NT$ ' + maxPrice.toLocaleString() + '</span>',
          '</div>'
        ].join('');

        container.appendChild(card);
      });
    }

    // Select Brand and show Table
    window.enterBrandView = function(brandKey) {
      currentSelectedBrand = brandKey;
      currentExactModel = null;
      currentSearchKeyword = '';
      var sInp = document.getElementById('modelSearchInput');
      if (sInp) sInp.value = '';

      var meta = BRAND_METAS.find(function(m) { return m.key === brandKey; });
      document.getElementById('currentBrandHeadline').innerText = meta ? meta.name : brandKey;

      renderModelPricingTable();

      document.getElementById('viewBrandGrid').style.display = 'none';
      document.getElementById('viewModelList').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Select specific model from card dropdown (精準搜尋: 選擇 iPhone 15 不會出現 iPhone 15 Pro)
    window.enterBrandModelView = function(brandKey, modelName) {
      currentSelectedBrand = brandKey;
      currentExactModel = modelName.trim();
      currentSearchKeyword = modelName.trim();
      var sInp = document.getElementById('modelSearchInput');
      if (sInp) sInp.value = modelName.trim();

      var meta = BRAND_METAS.find(function(m) { return m.key === brandKey; });
      document.getElementById('currentBrandHeadline').innerText = meta ? meta.name : brandKey;

      renderModelPricingTable();

      document.getElementById('viewBrandGrid').style.display = 'none';
      document.getElementById('viewModelList').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.navigateBackToBrands = function() {
      currentExactModel = null;
      currentSearchKeyword = '';
      document.getElementById('viewModelList').style.display = 'none';
      document.getElementById('viewBrandGrid').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.updateSortMode = function(order) {
      currentSortOrder = order;
      renderModelPricingTable();
    };

    window.handleModelSearch = function(val) {
      if (currentExactModel && val !== currentExactModel) {
        currentExactModel = null;
      }
      currentSearchKeyword = (val || '').trim().toLowerCase();
      renderModelPricingTable();
    };

    window.clearLockedModel = function() {
      currentExactModel = null;
      currentSearchKeyword = '';
      var sInp = document.getElementById('modelSearchInput');
      if (sInp) sInp.value = '';
      renderModelPricingTable();
    };

    function renderModelPricingTable() {
      if (!currentSelectedBrand) return;
      var devs = activeDevices.filter(function(d) { return d.brand === currentSelectedBrand; });

      // Update locked model badge
      var lBadge = document.getElementById('lockedModelBadge');
      if (lBadge) {
        if (currentExactModel) {
          lBadge.style.display = 'inline-flex';
          lBadge.innerHTML = '<span>🎯 鎖定機型：' + currentExactModel + '</span>' +
            '<button onclick="clearLockedModel()" style="margin-left: 6px; background: none; border: none; color: #b91c1c; font-weight: 900; cursor: pointer; text-decoration: underline;" title="解除鎖定，查看全部機型">✕ 查看全部</button>';
        } else {
          lBadge.style.display = 'none';
        }
      }

      // 1. Exact model filtering if chosen from dropdown
      if (currentExactModel) {
        var exactTarget = currentExactModel.toLowerCase();
        devs = devs.filter(function(d) {
          return (d.model || '').trim().toLowerCase() === exactTarget;
        });
      } else if (currentSearchKeyword) {
        // 2. Fuzzy keyword search
        devs = devs.filter(function(d) {
          return (d.model || '').toLowerCase().indexOf(currentSearchKeyword) >= 0 ||
                 (d.capacity || '').toLowerCase().indexOf(currentSearchKeyword) >= 0 ||
                 (d.rawModel || '').toLowerCase().indexOf(currentSearchKeyword) >= 0;
        });
      }

      if (currentSortOrder === 'priceDesc') {
        devs.sort(function(a, b) { return (b.maxPriceA || 0) - (a.maxPriceA || 0); });
      } else if (currentSortOrder === 'diffDesc') {
        devs.sort(function(a, b) { return (b.diffA || 0) - (a.diffA || 0); });
      } else if (currentSortOrder === 'modelAsc') {
        devs.sort(function(a, b) { return (a.model || '').localeCompare(b.model || '', 'zh-TW'); });
      }

      document.getElementById('currentBrandCountBadge').innerText = '共 ' + devs.length + ' 款機型';

      var tbody = document.getElementById('tableBodyContent');
      tbody.innerHTML = '';

      if (devs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b; font-size: 14px; font-weight: bold;">沒有找到符合「' + currentSearchKeyword + '」的機型</td></tr>';
        return;
      }

      devs.forEach(function(d) {
        var tr = document.createElement('tr');
        tr.onclick = function() { displayQuoteModal(d); };

        var isDianziBest = d.bestVendorA === '點子行動' && d.diffA > 0;
        var isFdiBest = d.bestVendorA === 'FDI' && d.diffA > 0;

        var recBadge = '<span class="badge-winner-pill badge-win-tie">同價</span>';
        if (isDianziBest) {
          recBadge = '<span class="badge-winner-pill badge-win-dianzi">點子 +' + d.diffA.toLocaleString() + '</span>';
        } else if (isFdiBest) {
          recBadge = '<span class="badge-winner-pill badge-win-fdi">FDI +' + d.diffA.toLocaleString() + '</span>';
        }

        tr.innerHTML = [
          '<td class="td-cell" style="width: 25%;">',
            '<div class="td-model-title">' + (d.model || '') + '</div>',
          '</td>',
          '<td class="td-cell" style="width: 11%; white-space: nowrap;">',
            '<span class="tag-capacity">' + (d.capacity || '標準規格') + '</span>',
          '</td>',
          '<td class="td-cell td-dianzi-wrap" style="width: 14%; min-width: 120px; white-space: nowrap;">',
            '<div class="price-a-dianzi" style="white-space: nowrap;">NT$' + (d.dianziPriceA || 0).toLocaleString() + '</div>',
          '</td>',
          '<td class="td-cell td-dianzi-wrap price-bc-sub" style="width: 12%; min-width: 105px; white-space: nowrap;">',
            '<div>B等：NT$' + (d.dianziPriceB || 0).toLocaleString() + '</div>',
            '<div style="color: #94a3b8;">C等：NT$' + (d.dianziPriceC || 0).toLocaleString() + '</div>',
          '</td>',
          '<td class="td-cell td-fdi-wrap" style="width: 16%; min-width: 155px; white-space: nowrap;">',
            (d.fdiPriceS > 0 ? '<div class="price-s-fdi" style="white-space: nowrap;">S等：NT$' + d.fdiPriceS.toLocaleString() + '</div>' : '') +
            '<div class="price-a-fdi" style="white-space: nowrap;">A等：NT$' + (d.fdiPriceA || 0).toLocaleString() + '</div>',
          '</td>',
          '<td class="td-cell td-fdi-wrap price-bc-sub" style="width: 12%; min-width: 105px; white-space: nowrap;">',
            '<div>B等：NT$' + (d.fdiPriceB || 0).toLocaleString() + '</div>',
            '<div style="color: #94a3b8;">C等：NT$' + (d.fdiPriceC || 0).toLocaleString() + '</div>',
          '</td>',
          '<td class="td-cell td-rec-wrap" style="width: 10%;">',
            recBadge,
            '<div style="margin-top: 6px;"><button class="btn-table-calc" onclick="event.stopPropagation(); window.__triggerModalById(\\'' + d.id + '\\');">試算</button></div>',
          '</td>'
        ].join('');

        tbody.appendChild(tr);
      });
    }

    window.__triggerModalById = function(id) {
      for (var i = 0; i < activeDevices.length; i++) {
        if (activeDevices[i].id === id) {
          displayQuoteModal(activeDevices[i]);
          return;
        }
      }
    };

    window.openPrecautionsModal = function(tab) {
      var modal = document.getElementById('precautionsModalOverlay');
      if (modal) {
        modal.style.display = 'flex';
        switchPrecautionsTab(tab || 'precautions');
      }
    };

    window.closePrecautionsModal = function() {
      var modal = document.getElementById('precautionsModalOverlay');
      if (modal) modal.style.display = 'none';
    };

    window.switchPrecautionsTab = function(tab) {
      var secPrec = document.getElementById('sectionPrecautionsContent');
      var secMist = document.getElementById('sectionMistakesContent');
      var btnPrec = document.getElementById('btnTabPrecautions');
      var btnMist = document.getElementById('btnTabMistakes');
      var btnAll = document.getElementById('btnTabAll');

      if (!secPrec || !secMist) return;

      if (tab === 'precautions') {
        secPrec.style.display = 'block';
        secMist.style.display = 'none';
        if (btnPrec) { btnPrec.style.color = '#92400e'; btnPrec.style.borderBottom = '3px solid #f59e0b'; }
        if (btnMist) { btnMist.style.color = '#64748b'; btnMist.style.borderBottom = '3px solid transparent'; }
        if (btnAll) { btnAll.style.color = '#64748b'; btnAll.style.borderBottom = '3px solid transparent'; }
      } else if (tab === 'mistakes') {
        secPrec.style.display = 'none';
        secMist.style.display = 'block';
        if (btnPrec) { btnPrec.style.color = '#64748b'; btnPrec.style.borderBottom = '3px solid transparent'; }
        if (btnMist) { btnMist.style.color = '#be123c'; btnMist.style.borderBottom = '3px solid #e11d48'; }
        if (btnAll) { btnAll.style.color = '#64748b'; btnAll.style.borderBottom = '3px solid transparent'; }
      } else {
        // all
        secPrec.style.display = 'block';
        secMist.style.display = 'block';
        if (btnPrec) { btnPrec.style.color = '#64748b'; btnPrec.style.borderBottom = '3px solid transparent'; }
        if (btnMist) { btnMist.style.color = '#64748b'; btnMist.style.borderBottom = '3px solid transparent'; }
        if (btnAll) { btnAll.style.color = '#0f172a'; btnAll.style.borderBottom = '3px solid #0f172a'; }
      }
    };

    // Modal Display
    function displayQuoteModal(d) {
      currentModalDevice = d;
      currentModalVendor = (d.fdiPriceA > d.dianziPriceA) ? 'fdi' : 'dianzi';
      currentModalGrade = 'A';

      document.getElementById('modalDeviceNameSubtitle').innerText =
        d.brand + ' ' + d.model + ' · ' + (d.capacity || '標準規格');

      refreshModalDisplay();
      document.getElementById('quoteModalOverlay').style.display = 'flex';
    }

    window.handleModalOverlayClick = function(e) {
      if (e.target.id === 'quoteModalOverlay') {
        dismissQuoteModal();
      }
    };

    window.dismissQuoteModal = function() {
      document.getElementById('quoteModalOverlay').style.display = 'none';
    };

    window.selectModalVendor = function(v) {
      currentModalVendor = v;
      currentModalGrade = 'A';
      refreshModalDisplay();
    };

    window.selectModalGrade = function(g) {
      currentModalGrade = g;
      refreshModalDisplay();
    };

    function refreshModalDisplay() {
      if (!currentModalDevice) return;
      var d = currentModalDevice;

      var btnD = document.getElementById('btnSwitchDianzi');
      var btnF = document.getElementById('btnSwitchFdi');

      btnD.className = 'btn-vendor-card' + (currentModalVendor === 'dianzi' ? ' active-dianzi' : '');
      btnF.className = 'btn-vendor-card' + (currentModalVendor === 'fdi' ? ' active-fdi' : '');

      var gridArea = document.getElementById('modalGradesArea');
      gridArea.innerHTML = '';

      var price = 0;
      var desc = '';

      if (currentModalVendor === 'dianzi') {
        var grades = [
          { g: 'A', name: 'A等 (優良)', p: d.dianziPriceA || 0 },
          { g: 'B', name: 'B等 (正常)', p: d.dianziPriceB || 0 },
          { g: 'C', name: 'C等 (瑕疵)', p: d.dianziPriceC || 0 }
        ];

        grades.forEach(function(item) {
          var btn = document.createElement('button');
          btn.className = 'btn-grade-card' + (currentModalGrade === item.g ? ' active-grade' : '');
          btn.onclick = function() { selectModalGrade(item.g); };
          btn.innerHTML = [
            '<div style="font-size: 13px; font-weight: 800;">' + item.name + '</div>',
            '<div style="font-family: ui-monospace, monospace; font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 3px;">NT$ ' + item.p.toLocaleString() + '</div>'
          ].join('');
          gridArea.appendChild(btn);

          if (currentModalGrade === item.g) {
            price = item.p;
            desc = '通路: 點子行動 (愛鋒派) · 等級: ' + item.name;
          }
        });
      } else {
        var grades = [
          { g: 'S', name: 'S等 (完美)', p: d.fdiPriceS || 0 },
          { g: 'A', name: 'A等 (優良)', p: d.fdiPriceA || 0 },
          { g: 'B', name: 'B等 (正常)', p: d.fdiPriceB || 0 },
          { g: 'C', name: 'C等 (瑕疵)', p: d.fdiPriceC || 0 }
        ];

        grades.forEach(function(item) {
          var btn = document.createElement('button');
          btn.className = 'btn-grade-card' + (currentModalGrade === item.g ? ' active-grade' : '');
          btn.onclick = function() { selectModalGrade(item.g); };
          btn.innerHTML = [
            '<div style="font-size: 13px; font-weight: 800;">' + item.name + '</div>',
            '<div style="font-family: ui-monospace, monospace; font-size: 14px; font-weight: 900; color: #1e40af; margin-top: 3px;">NT$ ' + item.p.toLocaleString() + '</div>'
          ].join('');
          gridArea.appendChild(btn);

          if (currentModalGrade === item.g) {
            price = item.p;
            desc = '通路: FutureDial (FDI) · 等級: ' + item.name;
          }
        });
      }

      document.getElementById('modalDisplayPrice').innerText = 'NT$ ' + price.toLocaleString();
      document.getElementById('modalDisplayDesc').innerText = desc;

      // Card container and labels
      var resBoxCard = document.getElementById('modalResultBoxCard');
      var resTitleLabel = document.getElementById('modalResTitleLabel');
      var modalDisplayPrice = document.getElementById('modalDisplayPrice');
      var modalDisplayDesc = document.getElementById('modalDisplayDesc');

      var dianziQrBox = document.getElementById('modalDianziQrBox');
      var dianziQrImg = document.getElementById('modalDianziQrImg');
      var fdiLinkBox = document.getElementById('modalFdiLinkBox');

      if (currentModalVendor === 'dianzi') {
        if (resBoxCard) {
          resBoxCard.style.background = '#fef2f2';
          resBoxCard.style.borderColor = '#fca5a5';
        }
        if (resTitleLabel) resTitleLabel.style.color = '#991b1b';
        if (modalDisplayPrice) modalDisplayPrice.style.color = '#b91c1c';
        if (modalDisplayDesc) modalDisplayDesc.style.color = '#991b1b';

        if (dianziQrBox) dianziQrBox.style.display = 'block';
        if (dianziQrImg) dianziQrImg.src = DIANZI_IOS_QR_DATA;
        if (fdiLinkBox) fdiLinkBox.style.display = 'none';
      } else {
        if (resBoxCard) {
          resBoxCard.style.background = '#eff6ff';
          resBoxCard.style.borderColor = '#93c5fd';
        }
        if (resTitleLabel) resTitleLabel.style.color = '#1e40af';
        if (modalDisplayPrice) modalDisplayPrice.style.color = '#1d4ed8';
        if (modalDisplayDesc) modalDisplayDesc.style.color = '#1e40af';

        if (dianziQrBox) dianziQrBox.style.display = 'none';
        if (fdiLinkBox) fdiLinkBox.style.display = 'block';
      }
    }

    // LINE Quote Text Copy (NO COLOR, NO PART NUMBER)
    window.copyModalQuoteText = function() {
      if (!currentModalDevice) return;
      var d = currentModalDevice;
      var vName = (currentModalVendor === 'dianzi') ? '點子行動 (愛鋒派)' : 'FutureDial (FDI)';
      var gName = currentModalGrade + '等';
      var p = 0;

      if (currentModalVendor === 'dianzi') {
        if (currentModalGrade === 'A') p = d.dianziPriceA || 0;
        else if (currentModalGrade === 'B') p = d.dianziPriceB || 0;
        else p = d.dianziPriceC || 0;
      } else {
        if (currentModalGrade === 'S') p = d.fdiPriceS || 0;
        else if (currentModalGrade === 'A') p = d.fdiPriceA || 0;
        else if (currentModalGrade === 'B') p = d.fdiPriceB || 0;
        else p = d.fdiPriceC || 0;
      }

      var text = [
        '【門市舊機回收報價】',
        '📱 回收機型：' + d.brand + ' ' + d.model + ' (' + (d.capacity || '標準規格') + ')',
        '🏢 推薦通路：' + vName,
        '🔍 判定等級：' + gName,
        '💰 回收報價：NT$ ' + p.toLocaleString()
      ].join('\\n');

      universalCopy(text).then(function() {
        var label = document.getElementById('btnCopyLineText');
        label.innerText = '✅ 已成功複製！';
        setTimeout(function() { label.innerText = '📋 複製報價文字'; }, 2000);
        showNotice('已成功複製報價文字到剪貼簿！');
      });
    };

    // ==========================================
    // ADMIN UPDATE LOGIC (免密碼直接更新)
    // ==========================================
    window.openAdminModal = function() {
      var overlay = document.getElementById('adminUpdateOverlay');
      if (overlay) overlay.style.display = 'flex';
      var statusDiv = document.getElementById('adminParseStatus');
      if (statusDiv) statusDiv.innerHTML = '';
      var fileInput = document.getElementById('adminFileInput');
      if (fileInput) fileInput.value = '';
      var info = document.getElementById('adminUploadInfoText');
      var drop = document.getElementById('adminDropzoneLabel');
      var foot = document.getElementById('adminModalFootBar');
      if (info) info.style.display = 'block';
      if (drop) drop.style.display = 'block';
      if (foot) foot.style.display = 'flex';
    };

    window.closeAdminModal = function() {
      var overlay = document.getElementById('adminUpdateOverlay');
      if (overlay) overlay.style.display = 'none';
    };

    // Parse Excel workbook in standalone version
    function parseNum(val) {
      if (!val) return 0;
      var num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    }

    function cleanModelName(raw) {
      var str = (raw || '').replace(/^\\(舊機\\)/i, '').trim();
      str = str.replace(/^(APPLE|Samsung|Google|ASUS|OPPO|vivo|moto|realme|SONY|小米Xiaomi|Xiaomi|Nothing Phone|Nothing)\\s+/i, '');
      var cap = '';
      var match = str.match(/[_ ](\\d+(?:GB|G|TB|T)(?:\\/\\d+(?:GB|G|TB|T))?|\\d+GB|\\d+G|\\d+TB|\\d+T)(?:\\([^)]*\\))?$/i);
      if (match) {
        cap = match[1].replace(/_/g, '').trim();
        str = str.slice(0, match.index).trim();
      }
      str = str.replace(/_+$/, '').trim();
      return { model: str, capacity: cap || '標準規格' };
    }

    function parseSheetRows(rows) {
      var list = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (!row || row.length < 5) continue;
        var brand = String(row[0] || '').trim();
        var rawModel = String(row[1] || '').trim();

        if (!brand || brand === '品牌' || brand.indexOf('※') === 0 || !rawModel || rawModel.indexOf('自動外觀') >= 0) {
          continue;
        }

        var cln = cleanModelName(rawModel);
        var pDianziA = parseNum(row[4]);
        var pDianziB = parseNum(row[7]);
        var pDianziC = parseNum(row[10]);

        var pFdiS = parseNum(row[13]);
        var pFdiA = parseNum(row[16]);
        var pFdiB = parseNum(row[19]);
        var pFdiC = parseNum(row[22]);

        if (pDianziA === 0 && pDianziB === 0 && pFdiA === 0 && pFdiS === 0) continue;

        var maxA = Math.max(pDianziA, pFdiA);
        var bestV = '相同';
        var diff = 0;
        if (pDianziA > pFdiA) {
          bestV = '點子行動';
          diff = pDianziA - pFdiA;
        } else if (pFdiA > pDianziA) {
          bestV = 'FDI';
          diff = pFdiA - pDianziA;
        }

        list.push({
          id: 'parsed-' + i + '-' + brand + '-' + cln.model,
          brand: brand,
          model: cln.model,
          rawModel: rawModel,
          capacity: cln.capacity,
          category: (rawModel.toLowerCase().indexOf('ipad') >= 0 || rawModel.toLowerCase().indexOf('tab') >= 0) ? '平板' : '手機',
          dianziPriceA: pDianziA,
          dianziPriceB: pDianziB,
          dianziPriceC: pDianziC,
          fdiPriceS: pFdiS,
          fdiPriceA: pFdiA,
          fdiPriceB: pFdiB,
          fdiPriceC: pFdiC,
          maxPriceA: maxA,
          bestVendorA: bestV,
          diffA: diff
        });
      }

      // Deduplicate by brand + model + capacity
      var dedupMap = {};
      var finalList = [];
      for (var j = 0; j < list.length; j++) {
        var it = list[j];
        var dKey = (it.brand + '__' + it.model + '__' + it.capacity).toLowerCase();
        if (!dedupMap[dKey]) {
          dedupMap[dKey] = it;
          finalList.push(it);
        } else {
          if (it.maxPriceA > dedupMap[dKey].maxPriceA) {
            var idx = finalList.indexOf(dedupMap[dKey]);
            if (idx >= 0) finalList[idx] = it;
            dedupMap[dKey] = it;
          }
        }
      }
      return finalList;
    }

    window.handleAdminFileSelected = function(e) {
      var files = e.target.files;
      if (!files || files.length === 0) return;
      var file = files[0];

      var statusDiv = document.getElementById('adminParseStatus');
      if (statusDiv) {
        statusDiv.innerHTML = '<span style="color: #dc2626; font-weight: 800;">正在讀取並解析 Excel 中...</span>';
      }

      var reader = new FileReader();
      reader.onload = function(evt) {
        try {
          var data = new Uint8Array(evt.target.result);
          var workbook = XLSX.read(data, { type: 'array' });
          var parsedList = [];
          var sheetsToTry = workbook.SheetNames.slice();
          // Sort sheets to prefer those with keyword
          sheetsToTry.sort(function(a, b) {
            var aHas = (a.indexOf('舊機回收') >= 0 || a.indexOf('比較') >= 0 || a.indexOf('報價') >= 0) ? 1 : 0;
            var bHas = (b.indexOf('舊機回收') >= 0 || b.indexOf('比較') >= 0 || b.indexOf('報價') >= 0) ? 1 : 0;
            return bHas - aHas;
          });

          for (var i = 0; i < sheetsToTry.length; i++) {
            var curSheet = workbook.Sheets[sheetsToTry[i]];
            if (!curSheet) continue;
            var rows = XLSX.utils.sheet_to_json(curSheet, { header: 1 });
            var curList = parseSheetRows(rows);
            if (curList.length > 0) {
              parsedList = curList;
              break;
            }
          }

          if (parsedList.length > 0) {
            activeDevices = parsedList;
            activeFileMeta = {
              name: file.name,
              lastModified: file.lastModified || Date.now(),
              count: parsedList.length,
              importedAt: Date.now()
            };

            renderBrandSelectionGrid();

            var info = document.getElementById('adminUploadInfoText');
            var drop = document.getElementById('adminDropzoneLabel');
            var foot = document.getElementById('adminModalFootBar');
            if (info) info.style.display = 'none';
            if (drop) drop.style.display = 'none';
            if (foot) foot.style.display = 'none';

            if (statusDiv) {
              statusDiv.innerHTML = [
                '<div style="background: #fef2f2; border: 2px solid #f87171; padding: 24px; border-radius: 18px; text-align: center;">',
                '  <div style="font-size: 32px; margin-bottom: 8px;">✅</div>',
                '  <div style="font-weight: 900; color: #991b1b; font-size: 16px; margin-bottom: 6px;">報價庫已成功更新！</div>',
                '  <div style="font-size: 13px; color: #b91c1c; margin-bottom: 18px;">檔案更新時間：<strong>' + formatTime(activeFileMeta.lastModified) + '</strong><br>共收錄 <strong>' + parsedList.length + ' 款機型</strong> 最新雙通路底價。<br>系統已解鎖各品牌卡片，請關閉視窗查看。</div>',
                '  <button onclick="closeAdminModal()" style="width: 100%; background: #dc2626; color: #fff; padding: 12px 20px; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(220,38,38,0.25);">關閉視窗</button>',
                '</div>'
              ].join('');
            }

            showNotice('✅ 報價庫已成功更新！檔案時間：' + formatTime(activeFileMeta.lastModified));
          } else {
            if (statusDiv) {
              statusDiv.innerHTML = '<span style="color: #e11d48; font-weight: 800;">未能解析出有效報價欄位，請檢查檔案格式。</span>';
            }
            showNotice('⚠️ 未能在該 Excel 檔案中解析出有效報價機型資料');
          }
        } catch(err) {
          var errMsg = err ? (err.message || String(err)) : '檔案解析錯誤';
          if (statusDiv) {
            statusDiv.innerHTML = '<span style="color: #e11d48; font-weight: 800;">解析失敗：' + errMsg + '</span>';
          }
          showNotice('❌ 解析失敗：' + errMsg);
        }
      };
      reader.readAsArrayBuffer(file);
    };

    window.clearDatabase = function() {
      if (!confirm('確定要清除目前已上傳的報價資料庫嗎？\\n清除後將恢復為未更新初始狀態，需重新上傳檔案才能查看品牌報價。')) return;

      try {
        localStorage.removeItem('MANGO_OFFLINE_PRICING_V8');
        localStorage.removeItem('MANGO_OFFLINE_PRICING_V7');
      } catch(e) {}

      activeDevices = [];
      currentSelectedBrand = null;
      renderBrandSelectionGrid();
      showNotice('🗑️ 已成功清除報價資料庫，恢復為未更新初始狀態！');
    };

    window.exportUpdatedStandaloneHtml = function() {
      try {
        var jsonDevices = JSON.stringify(activeDevices)
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e');
        var jsonMeta = JSON.stringify(activeFileMeta || null)
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e');

        var currentHtml = document.documentElement.outerHTML;
        var reDev = new RegExp('var RAW_DEVICE_DATA\\s*=\\s*\\[[\\s\\S]*?\\];');
        var newHtml = currentHtml.replace(reDev, 'var RAW_DEVICE_DATA = ' + jsonDevices + ';');
        var reMeta = new RegExp('var RAW_FILE_META\\s*=\\s*[^;]+;');
        newHtml = newHtml.replace(reMeta, 'var RAW_FILE_META = ' + jsonMeta + ';');
        newHtml = '<!DOCTYPE html>' + String.fromCharCode(10) + newHtml;

        var blob = new Blob([newHtml], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '舊機回收即時報價系統_門市專用版(已完成吃檔).html';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
        showNotice('✅ 已轉出門市專用版 HTML（已完成吃檔，共 ' + activeDevices.length + ' 款最新機型）！可直接發送門市！');
      } catch(err) {
        alert('轉出失敗: ' + err.message);
      }
    };

    // Auto-detect and initialize on load:
    // If exported with embedded RAW_DEVICE_DATA, load them ready for use.
    // If blank template, start as empty waiting-for-update screen.
    function initStandaloneApp() {
      checkMobileDevice();

      try {
        localStorage.removeItem('MANGO_OFFLINE_PRICING_V7');
        localStorage.removeItem('MANGO_OFFLINE_PRICING_V8');
        localStorage.removeItem('MANGO_TRADE_IN_UPLOADED_V8');
      } catch(e) {}

      if (typeof RAW_DEVICE_DATA !== 'undefined' && Array.isArray(RAW_DEVICE_DATA) && RAW_DEVICE_DATA.length > 0) {
        activeDevices = RAW_DEVICE_DATA.slice();
      } else {
        activeDevices = [];
      }

      if (typeof RAW_FILE_META !== 'undefined' && RAW_FILE_META) {
        activeFileMeta = RAW_FILE_META;
      }

      renderBrandSelectionGrid();
    }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initStandaloneApp);
    } else {
      initStandaloneApp();
    }
    window.addEventListener('resize', checkMobileDevice);
  </script>
</body>
</html>`;
}

// Generate the standalone offline files
const html = buildStandaloneHtmlContent();
fs.writeFileSync('./public/standalone.html', html, 'utf-8');
fs.writeFileSync('./public/舊機回收即時報價系統_單機版.html', html, 'utf-8');
console.log('Successfully generated public/standalone.html and public/舊機回收即時報價系統_單機版.html! Length:', html.length);
