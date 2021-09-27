import { bolusGroup } from './import_bolus.mjs';
import { carbsGroup } from './import_carbs.mjs';
import { cbgGroup } from './import_cbg.mjs';
import { longActingGroup } from './import_long_acting.mjs';
import { shortActingGroup } from './import_short_acting.mjs';
import { smbgGroup } from './import_smbg.mjs';

export const importFiphrGroups = {
  ...bolusGroup,
  ...carbsGroup,
  ...cbgGroup,
  ...longActingGroup,
  ...shortActingGroup,
  ...smbgGroup,
};
