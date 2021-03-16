import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import getLocallyJSONFile from '../src/tools/readJSONFileLocally.mjs';

class TestTemplateMotor {
  constructor() {
    if (!TestTemplateMotor.instance) {
      this.templates = new Map();
      this.templates.set(
        'testTemplate',
        getLocallyJSONFile(path.join(__dirname, '/testTemplate.json'))
      );
      TestTemplateMotor.instance = this;
    }

    return TestTemplateMotor.instance;
  }

  getDefaultTemplate(type) {
    return this.templates.get(type);
  }
}

const testTemplateMotor = new TestTemplateMotor();

Object.freeze(testTemplateMotor);

export default testTemplateMotor;
