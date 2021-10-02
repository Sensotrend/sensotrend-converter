import { cbgDefault } from './cbg.mjs';
import { smbgDefault } from './smbg.mjs';

export const defaultGroup = {
  ...cbgDefault,
  ...smbgDefault,
};
