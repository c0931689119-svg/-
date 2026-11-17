import * as XLSX from 'xlsx';
import { ActualDeviceItem } from '../types/pricing';
import { parseRawCsvPricingData as parseRawCsvText, PRELOADED_ACTUAL_DEVICES } from './pricingDataParser';

export interface ParseResult {
  devices: ActualDeviceItem[];
  sheetNames: string[];
  activeSheet: string;
  rowCount: number;
}

// Clean string and remove whitespace
const cleanStr = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
};

// Parse numeric value safely
const parseNum = (val: unknown, fallback = 0): number => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : Math.round(val);
  const str = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? fallback : Math.round(parsed);
};

// Clean model title and capacity
const cleanModelName = (rawModel: string): { model: string; capacity: string } => {
  let str = rawModel.replace(/^\(舊機\)/i, '').trim();
  str = str.replace(
    /^(APPLE|Samsung|Google|ASUS|OPPO|vivo|moto|realme|SONY|小米Xiaomi|Xiaomi|Nothing Phone|Nothing)\s+/i,
    ''
  );

  let capacity = '';
  const capMatch = str.match(
    /[_ ](\d+(?:GB|G|TB|T)(?:\/\d+(?:GB|G|TB|T))?|\d+GB|\d+G|\d+TB|\d+T)(?:\([^)]*\))?$/i
  );
  if (capMatch) {
    capacity = capMatch[1].replace(/_/g, '').trim();
    str = str.slice(0, capMatch.index).trim();
  } else {
    const slashMatch = str.match(/(\d+GB?\/\d+GB?|\d+G\/\d+G)/i);
    if (slashMatch) {
      capacity = slashMatch[1];
    }
  }

  str = str.replace(/_+$/, '').trim();
  return { model: str, capacity: capacity || '標準規格' };
};

const extractColor = (itemName: string): string => {
  if (!itemName) return '';
  const match = itemName.match(/-\(([^)]+)\)/);
  if (match) return match[1];
  return '';
};

// Parse Excel Workbook into structured ActualDeviceItem[]
export function parseExcelWorkbook(workbook: XLSX.WorkBook, sheetName?: string): ParseResult {
  const sheetNames = workbook.SheetNames;
  const targetSheetName = sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];

  if (!worksheet) {
    return { devices: PRELOADED_ACTUAL_DEVICES, sheetNames, activeSheet: targetSheetName, rowCount: PRELOADED_ACTUAL_DEVICES.length };
  }

  // Parse as 2D array
  const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const devices: ActualDeviceItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;

    const brand = cleanStr(row[0]);
    const rawModel = cleanStr(row[1]);

    // Skip headers or descriptions
    if (
      !brand ||
      brand === '品牌' ||
      brand.startsWith('※') ||
      !rawModel ||
      rawModel.includes('自動外觀檢測')
    ) {
      continue;
    }

    // Check if this matches the dual-vendor layout (點子 + FDI)
    const dianziPartA = cleanStr(row[2]);
    const dianziItemA = cleanStr(row[3]);
    const dianziPriceA = parseNum(row[4]);

    const dianziPartB = cleanStr(row[5]);
    const dianziPriceB = parseNum(row[7]);
    const dianziPartC = cleanStr(row[8]);
    const dianziPriceC = parseNum(row[10]);

    const fdiPartS = cleanStr(row[11]);
    const fdiItemS = cleanStr(row[12]);
    const fdiPriceS = parseNum(row[13]);
    const fdiPartA = cleanStr(row[14]);
    const fdiItemA = cleanStr(row[15]);
    const fdiPriceA = parseNum(row[16]);
    const fdiPartB = cleanStr(row[17]);
    const fdiPriceB = parseNum(row[19]);
    const fdiPartC = cleanStr(row[20]);
    const fdiPriceC = parseNum(row[22]);

    if (dianziPriceA > 0 || fdiPriceA > 0 || fdiPriceS > 0) {
      const { model, capacity } = cleanModelName(rawModel);
      const color = extractColor(dianziItemA || fdiItemA || fdiItemS);
      const isTablet =
        rawModel.toLowerCase().includes('ipad') ||
        rawModel.toLowerCase().includes('tab') ||
        brand.toLowerCase().includes('tab');

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

      devices.push({
        id: `dev-excel-${i}-${brand}-${model}-${capacity}-${color || 'std'}`,
        brand,
        model,
        rawModel,
        capacity,
        color: color || undefined,
        category: isTablet ? '平板' : '手機',
        dianziPriceA,
        dianziPriceB,
        dianziPriceC,
        dianziPartA: dianziPartA || undefined,
        dianziPartB: dianziPartB || undefined,
        dianziPartC: dianziPartC || undefined,
        fdiPriceS,
        fdiPriceA,
        fdiPriceB,
        fdiPriceC,
        fdiPartS: fdiPartS || undefined,
        fdiPartA: fdiPartA || undefined,
        fdiPartB: fdiPartB || undefined,
        fdiPartC: fdiPartC || undefined,
        maxPriceA: maxA,
        bestVendorA,
        diffA,
        updatedDate: '2026/10/01',
      });
    }
  }

  // If no devices parsed from multi-vendor layout, fall back to preloaded
  if (devices.length === 0) {
    return {
      devices: PRELOADED_ACTUAL_DEVICES,
      sheetNames,
      activeSheet: targetSheetName,
      rowCount: PRELOADED_ACTUAL_DEVICES.length,
    };
  }

  return {
    devices,
    sheetNames,
    activeSheet: targetSheetName,
    rowCount: devices.length,
  };
}

// Generate export sample Excel with the dual-vendor format
export function exportSampleExcel(): void {
  const data = [
    [
      '',
      '※實際回收價以系統判定為準',
      '點子行動舊機回收報價',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'FutureDial(FDI)舊機回收報價',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '點子',
      'FDI',
    ],
    [
      '品牌',
      '機款',
      '',
      '',
      '2026/10/1',
      '',
      '',
      '2026/10/1',
      '',
      '',
      '2026/10/1',
      '',
      '',
      '2026/10/1',
      '',
      '',
      '2026/10/1',
      '',
      '',
      '2026/10/1',
      '',
      '',
      '2026/10/1',
    ],
    [
      '',
      '',
      '料號(A等級)',
      '品名 Item(A等級)',
      '報價(A等級)',
      '料號(B等級)',
      '品名 Item(B等級)',
      '報價(B等級)',
      '料號(C等級)',
      '品名 Item(C等級)',
      '報價(C等級)',
      '料號(S等級)',
      '品名 Item(S等級)',
      '報價(S等級)',
      '料號(A等級)',
      '品名 Item(A等級)',
      '報價(A等級)',
      '料號(B等級)',
      '品名 Item(B等級)',
      '報價(B等級)',
      '料號(C等級)',
      '品名 Item(C等級)',
      '報價(C等級)',
    ],
    [
      'APPLE',
      '(舊機)APPLE iPhone 16 Pro Max_256G',
      'H01001716260100',
      '(舊機)APPLE iPhone 16 Pro Max_256G-(黑)(5G)_(點子)_A等',
      21600,
      'H01001716270100',
      '(舊機)APPLE iPhone 16 Pro Max_256G-(黑)(5G)_(點子)_B等',
      17280,
      'H01001716280100',
      '(舊機)APPLE iPhone 16 Pro Max_256G-(黑)(5G)_(點子)_C等',
      4320,
      'H01001716750100',
      '(舊機)APPLE iPhone 16 Pro Max_256G-(黑)(5G)_(FDI)_S等',
      20900,
      'H01001716760100',
      '(舊機)APPLE iPhone 16 Pro Max_256G-(黑)(5G)_(FDI)_A等',
      18100,
      'H01001716770100',
      '(舊機)APPLE iPhone 16 Pro Max_256G-(黑)(5G)_(FDI)_B等',
      7400,
      'H01001716780100',
      '(舊機)APPLE iPhone 16 Pro Max_256G-(黑)(5G)_(FDI)_C等',
      4700,
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '舊機回收價格比較');

  XLSX.writeFile(wb, '舊機回收價格比較_公版範本.xlsx');
}
