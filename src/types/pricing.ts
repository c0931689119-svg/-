export type DeviceBrand =
  | 'APPLE'
  | 'SAMSUNG'
  | 'Google'
  | 'ASUS'
  | 'OPPO'
  | 'vivo'
  | 'moto'
  | 'realme'
  | 'SONY'
  | 'MI'
  | 'NOTHING'
  | 'iPad/平板'
  | '其他';

export interface VendorPricing {
  // 點子行動 / 愛鋒派
  dianzi?: {
    partA?: string;
    itemA?: string;
    priceA: number;
    partB?: string;
    itemB?: string;
    priceB: number;
    partC?: string;
    itemC?: string;
    priceC: number;
  };
  // FutureDial (FDI)
  fdi?: {
    partS?: string;
    itemS?: string;
    priceS: number;
    partA?: string;
    itemA?: string;
    priceA: number;
    partB?: string;
    itemB?: string;
    priceB: number;
    partC?: string;
    itemC?: string;
    priceC: number;
  };
}

export interface ActualDeviceItem {
  id: string;
  brand: string;
  model: string; // Clean model name e.g. "iPhone 13 mini"
  rawModel: string; // "(舊機)APPLE iPhone 13 mini_128G"
  capacity: string; // e.g. "128G", "256G", "1TB"
  color?: string; // e.g. "星光", "午夜", "沙漠鈦金"
  category: '手機' | '平板';
  // 點子行動
  dianziPriceA: number;
  dianziPriceB: number;
  dianziPriceC: number;
  dianziPartA?: string;
  dianziPartB?: string;
  dianziPartC?: string;
  // FDI
  fdiPriceS: number;
  fdiPriceA: number;
  fdiPriceB: number;
  fdiPriceC: number;
  fdiPartS?: string;
  fdiPartA?: string;
  fdiPartB?: string;
  fdiPartC?: string;
  // Summary comparisons
  maxPriceA: number; // Max of dianzi A vs fdi A (or fdi S)
  bestVendorA: '點子行動' | 'FDI' | '相同';
  diffA: number; // Advantage of the best vendor
  note?: string;
  updatedDate?: string;
}

export interface FileSyncState {
  designatedPath: string;
  fileName: string;
  isLoaded: boolean;
  lastUpdated: string | null;
  totalRecords: number;
  sheetNames: string[];
  activeSheet: string;
  hasFileHandle: boolean;
  sourceType: 'preset' | 'file-system' | 'upload';
}
