import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import getLocallyJSONFile from '../../tools/readJSONFileLocally.mjs';

//nightScout
class NightScoutTemplateMotor {
  constructor() {
    if (!NightScoutTemplateMotor.instance) {
      this.templates = new Map();
      this.templates.set(
        'export_cbg',
        getLocallyJSONFile(path.join(__dirname, '/export_cbg.json'))
      );
      this.templates.set(
        'export_smbg',
        getLocallyJSONFile(path.join(__dirname, '/export_smbg.json'))
      );
      NightScoutTemplateMotor.instance = this;
    }

    return NightScoutTemplateMotor.instance;
  }

  getDefaultTemplate(type) {
    return this.templates.get(type);
  }
}

const nightScoutTemplateMotor = new NightScoutTemplateMotor();

Object.freeze(nightScoutTemplateMotor);

export default nightScoutTemplateMotor;
