import { exportCbgGroup } from './export_cbg.mjs';
import { exportSmbgGroup } from './export_smbg.mjs';

export const nightscoutGroups = {
  ...exportCbgGroup,
  ...exportSmbgGroup,
};
