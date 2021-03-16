import 'chai/register-should.js';
import DataFormatConverter from '../src/DataFormatConverter.mjs';

import testTemplateMotor from './templateMotor.mjs';

const logger = {};
logger.info = console.log;
logger.error = console.error;
logger.debug = console.log;

const abstractConverter = new DataFormatConverter(logger, testTemplateMotor);

describe('DataFormatConverter template loading', function () {
  it('should load templates', async function () {
    const template = await abstractConverter.loadTemplate('testTemplate');
    template.foo.should.equal('bar');
  });

  it('should return false if no template is found', async function () {
    const template = await abstractConverter.loadTemplate('testTemplateIsNotThere');
    template.should.equal(false);
  });
});
