import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import getLocallyJSONFile from '../../tools/readJSONFileLocally.mjs';

//Default import
class DefaultTemplateMotor {
  constructor() {
    if (!DefaultTemplateMotor.instance) {
      this.templates = new Map();
      this.templates.set('cbg', getLocallyJSONFile(path.join(__dirname, '/cbg.json')));
      this.templates.set('smbg', getLocallyJSONFile(path.join(__dirname, '/smbg.json')));
      DefaultTemplateMotor.instance = this;
    }

    return DefaultTemplateMotor.instance;
  }

  getDefaultTemplate(type) {
    return this.templates.get(type);
  }
}

const defaultTemplateMotor = new DefaultTemplateMotor();

Object.freeze(defaultTemplateMotor);

export default defaultTemplateMotor;
