import { ActualDeviceItem } from '../types/pricing';
import { RAW_PRICING_CSV } from '../data/rawCsvData';
import * as XLSX from 'xlsx';

// Helper to clean price number
const parseNum = (val: unknown): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  const str = String(val).replace(/[^0-9]/g, '');
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
};

// Helper to clean model title
const cleanModelName = (rawModel: string): { model: string; capacity: string } => {
  let str = rawModel.replace(/^\(舊機\)/i, '').trim();
  // Remove brand prefix if present
  str = str.replace(/^(APPLE|Samsung|Google|ASUS|OPPO|vivo|moto|realme|SONY|小米Xiaomi|Xiaomi|Nothing Phone|Nothing)\s+/i, '');

  let capacity = '';
  // Check for capacity patterns e.g. _128G, _256GB, 12GB/512GB, 8G/256G, 1TB, 2TB
  const capMatch = str.match(/[_ ](\d+(?:GB|G|TB|T)(?:\/\d+(?:GB|G|TB|T))?|\d+GB|\d+G|\d+TB|\d+T)(?:\([^)]*\))?$/i);
  if (capMatch) {
    capacity = capMatch[1].replace(/_/g, '').trim();
    str = str.slice(0, capMatch.index).trim();
  } else {
    const slashMatch = str.match(/(\d+GB?\/\d+GB?|\d+G\/\d+G)/i);
    if (slashMatch) {
      capacity = slashMatch[1];
    }
  }

  // Remove trailing underscore
  str = str.replace(/_+$/, '').trim();

  return { model: str, capacity: capacity || '標準規格' };
};

// Extract color from item name
const extractColor = (itemName: string): string => {
  if (!itemName) return '';
  const match = itemName.match(/-\(([^)]+)\)/);
  return match ? match[1] : '';
};

/**
 * Parses raw CSV text into structured ActualDeviceItem[]
 */
export function parseRawCsvPricingData(csvText: string): ActualDeviceItem[] {
  const lines = csvText.split('\n');
  const items: ActualDeviceItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',');
    if (cols.length < 5) continue;

    const brand = cols[0]?.trim();
    const rawModel = cols[1]?.trim();

    if (
      !brand ||
      brand === '品牌' ||
      brand.startsWith('※') ||
      !rawModel ||
      rawModel.includes('自動外觀檢測')
    ) {
      continue;
    }

    const { model, capacity } = cleanModelName(rawModel);

    // Dianzi items
    const dianziPartA = cols[2]?.trim();
    const dianziItemA = cols[3]?.trim();
    const dianziPriceA = parseNum(cols[4]);
    const dianziPartB = cols[5]?.trim();
    const dianziPriceB = parseNum(cols[7]);
    const dianziPartC = cols[8]?.trim();
    const dianziPriceC = parseNum(cols[10]);

    // FDI items
    const fdiPartS = cols[11]?.trim();
    const fdiItemS = cols[12]?.trim();
    const fdiPriceS = parseNum(cols[13]);
    const fdiPartA = cols[14]?.trim();
    const fdiItemA = cols[15]?.trim();
    const fdiPriceA = parseNum(cols[16]);
    const fdiPartB = cols[17]?.trim();
    const fdiPriceB = parseNum(cols[19]);
    const fdiPartC = cols[20]?.trim();
    const fdiPriceC = parseNum(cols[22]);

    // Skip if all prices are 0
    if (dianziPriceA === 0 && dianziPriceB === 0 && fdiPriceA === 0 && fdiPriceS === 0) {
      continue;
    }

    // Determine category
    const isTablet =
      rawModel.toLowerCase().includes('ipad') ||
      rawModel.toLowerCase().includes('tab') ||
      cols[0]?.toLowerCase().includes('tab');

    // Calculate maximum A-grade price and compare
    const maxA = Math.max(dianziPriceA, fdiPriceA);
    let bestVendorA: '點子行動' | 'FDI' | '相同' = '相同';
    let diffA = 0;

    if (dianziPriceA > fdiPriceA) {
      bestVendorA = '點子行動';
      diffA = dianziPriceA - fdiPriceA;
    } else if (fdiPriceA > dianziPriceA) {
      bestVendorA = 'FDI';
      diffA = fdiPriceA - dianziPriceA;
    }

    items.push({
      id: `dev-${i}-${brand}-${model}-${capacity}`,
      brand,
      model,
      rawModel,
      capacity,
      category: isTablet ? '平板' : '手機',
      dianziPriceA,
      dianziPriceB,
      dianziPriceC,
      dianziPartA,
      dianziPartB,
      dianziPartC,
      fdiPriceS,
      fdiPriceA,
      fdiPriceB,
      fdiPriceC,
      fdiPartS,
      fdiPartA,
      fdiPartB,
      fdiPartC,
      maxPriceA: maxA,
      bestVendorA,
      diffA,
      updatedDate: '2026/10/01',
    });
  }

  // Deduplicate by brand + model + capacity
  const dedupMap = new Map<string, ActualDeviceItem>();
  for (const item of items) {
    const key = `${item.brand.toLowerCase()}__${item.model.toLowerCase()}__${item.capacity.toLowerCase()}`;
    if (!dedupMap.has(key)) {
      dedupMap.set(key, item);
    } else {
      const existing = dedupMap.get(key)!;
      if (item.maxPriceA > existing.maxPriceA) {
        dedupMap.set(key, item);
      }
    }
  }

  return Array.from(dedupMap.values());
}

export const PRELOADED_ACTUAL_DEVICES: ActualDeviceItem[] = parseRawCsvPricingData(RAW_PRICING_CSV);

/**
 * Normalizes brand name to canonical brand key
 */
export function normalizeBrand(brand: string): string {
  const b = (brand || '').trim().toUpperCase();
  if (b.includes('APPLE') || b.includes('IPHONE') || b.includes('IPAD')) return 'APPLE';
  if (b.includes('SAMSUNG') || b.includes('三星')) return 'SAMSUNG';
  if (b.includes('GOOGLE') || b.includes('PIXEL')) return 'Google';
  if (b.includes('ASUS') || b.includes('華碩') || b.includes('ROG')) return 'ASUS';
  if (b.includes('OPPO')) return 'OPPO';
  if (b.includes('VIVO')) return 'vivo';
  if (b.includes('MI') || b.includes('XIAOMI') || b.includes('小米') || b.includes('紅米') || b.includes('REDMI')) return 'MI';
  if (b.includes('MOTO') || b.includes('MOTOROLA')) return 'moto';
  if (b.includes('REALME')) return 'realme';
  if (b.includes('SONY') || b.includes('索尼') || b.includes('XPERIA')) return 'SONY';
  if (b.includes('NOTHING')) return 'NOTHING';
  return brand.trim();
}

/**
 * Inspects a sheet row array to parse dual-channel prices.
 * Supports flexible column detection and headers.
 */
function extractItemsFromSheetRows(rows: unknown[][]): ActualDeviceItem[] {
  if (!rows || rows.length === 0) return [];

  // Default standard company format
  let brandCol = 0;
  let modelCol = 1;
  let dianziACol = 4;
  let fdiACol = 16;
  let dianziBCol = 7;
  let dianziCCol = 10;
  let fdiSCol = 13;
  let fdiBCol = 19;
  let fdiCCol = 22;

  // Search first 15 rows for column markers
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim();
      if (val === '品牌' || val.includes('廠牌')) {
        brandCol = c;
      }
      if (val === '機款' || val.includes('型號') || val.includes('機型')) {
        modelCol = c;
      }
      // Check for price column markers
      if (val.includes('報價(A等級)') || val.includes('報價(A)')) {
        if (c < 12) {
          dianziACol = c;
        } else {
          fdiACol = c;
        }
      }
      if (val.includes('報價(S等級)') || val.includes('報價(S)')) {
        fdiSCol = c;
      }
      if (val.includes('報價(B等級)') || val.includes('報價(B)')) {
        if (c < 12) dianziBCol = c;
        else fdiBCol = c;
      }
      if (val.includes('報價(C等級)') || val.includes('報價(C)')) {
        if (c < 12) dianziCCol = c;
        else fdiCCol = c;
      }
    }
  }

  const items: ActualDeviceItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    let brand = String(row[brandCol] || '').trim();
    let rawModel = String(row[modelCol] || '').trim();

    // If brand column does not have a valid brand, scan first few columns for known brands
    if (!brand || brand === '品牌' || brand === '廠牌' || brand.startsWith('※')) {
      for (let c = 0; c < Math.min(row.length, 4); c++) {
        const val = String(row[c] || '').trim();
        if (/^(APPLE|Apple|SAMSUNG|Samsung|三星|Google|ASUS|華碩|OPPO|vivo|MI|Xiaomi|小米|moto|Motorola|realme|SONY|Sony|Nothing|HTC)/i.test(val)) {
          brand = val;
          rawModel = String(row[c + 1] || '').trim();
          break;
        }
      }
    }

    if (
      !brand ||
      brand === '品牌' ||
      brand === '廠牌' ||
      brand.startsWith('※') ||
      !rawModel ||
      rawModel === '機款' ||
      rawModel === '型號' ||
      rawModel.includes('自動外觀') ||
      rawModel.includes('報價')
    ) {
      continue;
    }

    brand = normalizeBrand(brand);
    const { model, capacity } = cleanModelName(rawModel);

    // Parse prices
    const dianziPriceA = parseNum(row[dianziACol]);
    const dianziPriceB = parseNum(row[dianziBCol]);
    const dianziPriceC = parseNum(row[dianziCCol]);

    const fdiPriceS = parseNum(row[fdiSCol]);
    const fdiPriceA = parseNum(row[fdiACol]);
    const fdiPriceB = parseNum(row[fdiBCol]);
    const fdiPriceC = parseNum(row[fdiCCol]);

    // If zero across all primary columns, attempt scanning adjacent numeric columns
    let finalDianziA = dianziPriceA;
    let finalFdiA = fdiPriceA;

    if (finalDianziA === 0 && finalFdiA === 0 && dianziPriceB === 0 && fdiPriceS === 0) {
      const nums: number[] = [];
      for (let c = 2; c < row.length; c++) {
        const n = parseNum(row[c]);
        if (n >= 50 && n <= 100000) {
          nums.push(n);
        }
      }
      if (nums.length >= 2) {
        finalDianziA = nums[0];
        finalFdiA = nums[1];
      } else if (nums.length === 1) {
        finalDianziA = nums[0];
        finalFdiA = nums[0];
      } else {
        continue;
      }
    }

    const isTablet =
      rawModel.toLowerCase().includes('ipad') ||
      rawModel.toLowerCase().includes('tab') ||
      brand.toLowerCase().includes('tab');

    const maxA = Math.max(finalDianziA, finalFdiA);
    let bestVendorA: '點子行動' | 'FDI' | '相同' = '相同';
    let diffA = 0;

    if (finalDianziA > finalFdiA) {
      bestVendorA = '點子行動';
      diffA = finalDianziA - finalFdiA;
    } else if (finalFdiA > finalDianziA) {
      bestVendorA = 'FDI';
      diffA = finalFdiA - finalDianziA;
    }

    items.push({
      id: `live-${i}-${brand}-${model}-${capacity}`,
      brand,
      model,
      rawModel,
      capacity,
      category: isTablet ? '平板' : '手機',
      dianziPriceA: finalDianziA,
      dianziPriceB: dianziPriceB || Math.round(finalDianziA * 0.8),
      dianziPriceC: dianziPriceC || Math.round(finalDianziA * 0.2),
      dianziPartA: String(row[2] || ''),
      dianziPartB: String(row[5] || ''),
      dianziPartC: String(row[8] || ''),
      fdiPriceS: fdiPriceS || Math.round(finalFdiA * 1.1),
      fdiPriceA: finalFdiA,
      fdiPriceB: fdiPriceB || Math.round(finalFdiA * 0.35),
      fdiPriceC: fdiPriceC || Math.round(finalFdiA * 0.18),
      fdiPartS: String(row[11] || ''),
      fdiPartA: String(row[14] || ''),
      fdiPartB: String(row[17] || ''),
      fdiPartC: String(row[20] || ''),
      maxPriceA: maxA,
      bestVendorA,
      diffA,
      updatedDate: '即時讀取',
    });
  }

  // Deduplicate by brand + model + capacity
  const dedupMap = new Map<string, ActualDeviceItem>();
  for (const item of items) {
    const key = `${item.brand.toLowerCase()}__${item.model.toLowerCase()}__${item.capacity.toLowerCase()}`;
    if (!dedupMap.has(key)) {
      dedupMap.set(key, item);
    } else {
      const existing = dedupMap.get(key)!;
      if (item.maxPriceA > existing.maxPriceA) {
        dedupMap.set(key, item);
      }
    }
  }

  return Array.from(dedupMap.values());
}

/**
 * Parses an actual Excel Workbook file (e.g. 舊機回收價格比較.xlsx)
 * Iterates through sheets to find matching quote data.
 */
export function parseExcelWorkbookData(workbook: XLSX.WorkBook): {
  items: ActualDeviceItem[];
  sheetName: string;
} {
  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    return { items: [], sheetName: '' };
  }

  // Check matching sheet names first
  const preferredSheet = workbook.SheetNames.find(
    (s) => s.includes('舊機回收') || s.includes('比較') || s.includes('價格') || s.includes('底價') || s.includes('報價')
  );

  const sheetsToTry = preferredSheet
    ? [preferredSheet, ...workbook.SheetNames.filter((s) => s !== preferredSheet)]
    : workbook.SheetNames;

  for (const sheetName of sheetsToTry) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const parsedItems = extractItemsFromSheetRows(rows);

    if (parsedItems.length > 0) {
      return { items: parsedItems, sheetName };
    }
  }

  return { items: [], sheetName: workbook.SheetNames[0] || '' };
}
