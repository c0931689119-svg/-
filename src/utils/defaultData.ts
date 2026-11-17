import { ActualDeviceItem } from '../types/pricing';
import { PRELOADED_ACTUAL_DEVICES } from './pricingDataParser';

export const DESIGNATED_NETWORK_PATH =
  '\\\\tccds-svr-01\\twmds\\直營訊息交流特區\\舊機回收價格比較.xlsx';

export const DESIGNATED_FILE_NAME = '舊機回收價格比較.xlsx';

export const INITIAL_ACTUAL_DEVICES: ActualDeviceItem[] = PRELOADED_ACTUAL_DEVICES;
