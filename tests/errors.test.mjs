import chai, { expect } from 'chai';
import promised from 'chai-as-promised';
import 'chai/register-should.js';

import ConversionService from '../src/ConversionService.mjs';
import { NightscoutDataProcessor } from '../src/templates/nightscout/index.mjs';
import { FIPHRDataProcessor } from '../src/templates/fiphr/index.mjs';
import { TidepoolDataProcessor } from '../src/templates/tidepool/index.mjs';
import DataFormatConverter from '../src/DataFormatConverter.mjs';

chai.use(promised);

const abstractConverter = new DataFormatConverter();

const logger = {};
logger.info = console.log;
logger.error = console.error;
logger.debug = console.log;

const DataConverter = new ConversionService(logger);

DataConverter.registerFormatProcessor('nightscout', NightscoutDataProcessor);
DataConverter.registerFormatProcessor('fiphr', FIPHRDataProcessor);
DataConverter.registerFormatProcessor('tidepool', TidepoolDataProcessor);

describe('Data converter errors', function () {
  it('should fail when source format is missing', async function () {
    let data = [{}];
    let options = {
      target: 'fiphr',
      FHIR_userid: 'abc',
    };
    await expect(DataConverter.convert(data, options)).to.be.rejectedWith('Trying to convert data without format spec');
  });

  it('should fail when target format is missing', async function () {
    let data = [{}];
    let options = {
      source: 'fiphr',
      FHIR_userid: 'abc',
    };

    await expect(DataConverter.convert(data, options)).to.be.rejectedWith('Trying to convert data without format spec');
  });

  it('should fail when source format converter is missing', async function () {
    let data = [{}];
    let options = {
      source: 'nonexistingformat',
      target: 'fiphr',
      FHIR_userid: 'abc',
    };
    await expect(DataConverter.importRecords(data, options)).to.be.rejectedWith('No import processor found for format: nonexistingformat');
  });

  it('should fail when target format converter is missing', async function () {
    let data = [{}];
    let options = {
      source: 'fiphr',
      target: 'nonexistingformat',
      FHIR_userid: 'abc',
    };
    await expect(DataConverter.exportRecords(data, options)).to.be.rejectedWith('No export processor found for format: fiphr');
  });

  it('should fail when asking for date an object not sourced from the converter', async function () {
    (function () {
      DataConverter.getRecordTime({});
    }.should.throw());
  });
});

describe('Abstract implementation of DataFormatConverter', function () {
  it('should fail when unimplemented methods are called', async function () {
    (function () {
      abstractConverter.getRecordTime({});
    }.should.throw('Implementation for getRecordTime() is missing'));

    await expect(abstractConverter.importRecords({})).to.be.rejectedWith('Implementation for importRecords() is missing');

    await expect(abstractConverter.exportRecords({})).to.be.rejectedWith('Implementation for exportRecords() is missing');
  });
});
