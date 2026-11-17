import { ActualDeviceItem } from '../types/pricing';

export const STANDALONE_FILE_URL = '/standalone.html';
export const STANDALONE_CHINESE_FILE_URL = '/舊機回收即時報價系統_單機版.html';

const STORAGE_KEY = 'MANGO_TRADE_IN_UPLOADED_V8';

/**
 * Builds the standalone HTML string embedding the provided devices and metadata.
 * Ensures the exported/downloaded single HTML file has 100% of the newly updated pricing data.
 */
export async function buildUpdatedStandaloneHtml(
  devices?: ActualDeviceItem[],
  meta?: { name?: string; size?: number; lastModified?: number; count?: number }
): Promise<string> {
  // If devices are not explicitly provided, attempt to retrieve latest saved from localStorage
  let activeDevices = devices;
  let activeMeta = meta;

  if (!activeDevices || activeDevices.length === 0) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.devices && parsed.devices.length > 0) {
          activeDevices = parsed.devices;
          if (!activeMeta && parsed.meta) {
            activeMeta = parsed.meta;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Fetch the standalone shell template with cache-busting
  let html = '';
  try {
    const res = await fetch(`${STANDALONE_FILE_URL}?t=${Date.now()}`);
    if (res.ok) {
      html = await res.text();
    } else {
      const resAlt = await fetch(`${STANDALONE_CHINESE_FILE_URL}?t=${Date.now()}`);
      if (resAlt.ok) html = await resAlt.text();
    }
  } catch {
    const resAlt = await fetch(`${STANDALONE_CHINESE_FILE_URL}?t=${Date.now()}`);
    if (resAlt.ok) html = await resAlt.text();
  }

  if (!html) {
    throw new Error('無法讀取單機版範本檔案，請確認網路連線或稍後再試。');
  }

  if (activeDevices && activeDevices.length > 0) {
    const jsonDevices = JSON.stringify(activeDevices)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e');

    // Replace the RAW_DEVICE_DATA array definition with functional replacer to avoid $ replacement tokens
    html = html.replace(
      /var RAW_DEVICE_DATA\s*=\s*\[[\s\S]*?\];/,
      () => `var RAW_DEVICE_DATA = ${jsonDevices};`
    );

    // Replace the RAW_FILE_META definition if present
    if (activeMeta) {
      const jsonMeta = JSON.stringify(activeMeta)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e');
      html = html.replace(
        /var RAW_FILE_META\s*=\s*[^;]+;/,
        () => `var RAW_FILE_META = ${jsonMeta};`
      );
    } else {
      html = html.replace(
        /var RAW_FILE_META\s*=\s*[^;]+;/,
        () => `var RAW_FILE_META = null;`
      );
    }

    // Replace device count displays
    const count = activeDevices.length;
    html = html.replace(
      /已收錄\s*\d+\s*款機型最新雙通路底價/g,
      `已收錄 ${count} 款機型最新雙通路底價`
    );
    html = html.replace(
      /共\s*\d+\s*款機型/g,
      `共 ${count} 款機型`
    );

    if (activeMeta?.lastModified) {
      const d = new Date(activeMeta.lastModified);
      const dateStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      html = html.replace(
        /上次更新：[^\s<|]+/g,
        `上次更新：${dateStr}`
      );
    }
  }

  return html;
}

/**
 * Generates ready-to-share message text for store announcements (LINE, Email, Internal bulletin)
 */
export function generateStoreShareText(
  deviceCount: number,
  lastUpdatedStr: string,
  fileName?: string
): string {
  return `【舊機回收即時報價系統 - 門市專用版（已完成吃檔）】
📅 報價版本時間：${lastUpdatedStr || '最新版'}
📊 收錄機型總數：共 ${deviceCount} 款機型（點子行動 vs FDI 雙通路完整比價）
📁 來源報價檔：${fileName || '舊機回收價格比較.xlsx'}
💡 門市使用說明：
1. 本檔案已完整內嵌最新回收報價（已完成吃檔），免安裝軟體、免聯網、免帳號密碼。
2. 請使用門市公務電腦（Chrome 或 Edge 瀏覽器）雙擊開啟即可使用。
3. 頁面已依收錄機型數由多到少排序，可直接點選品牌或輸入關鍵字查詢雙通路底價。`;
}

/**
 * Triggers direct browser download of the standalone HTML file with updated data.
 */
export async function downloadStandaloneHtml(
  devices?: ActualDeviceItem[],
  meta?: { name?: string; size?: number; lastModified?: number; count?: number },
  customFileName?: string
): Promise<void> {
  const fileName = customFileName || '舊機回收即時報價系統_門市專用版(已完成吃檔).html';
  try {
    const htmlContent = await buildUpdatedStandaloneHtml(devices, meta);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  } catch (err) {
    console.error('Download standalone HTML error:', err);
    // Fallback: direct link open
    const a = document.createElement('a');
    a.href = STANDALONE_FILE_URL;
    a.target = '_blank';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Fetches the raw HTML code with updated devices for clipboard copy if needed
 */
export async function getStandaloneHtmlCode(
  devices?: ActualDeviceItem[],
  meta?: { name?: string; size?: number; lastModified?: number; count?: number }
): Promise<string> {
  return buildUpdatedStandaloneHtml(devices, meta);
}

