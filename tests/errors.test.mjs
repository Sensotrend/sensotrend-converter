import 'chai/register-should.js';
import ConversionService from '../src/ConversionService.mjs';
import { NightscoutDataProcessor } from '../src/templates/nightscout/index.mjs';
import { FIPHRDataProcessor } from '../src/templates/fiphr/index.mjs';
import { TidepoolDataProcessor } from '../src/templates/tidepool/index.mjs';

import DataFormatConverter from '../src/DataFormatConverter.mjs';

const abstractConverter = new DataFormatConverter();

const logger = {};
logger.info = console.log;
logger.error = console.error;
logger.debug = console.log;

const DataConverter = new ConversionService(logger);

DataConverter.registerFormatProcessor('nightscout', NightscoutDataProcessor);
DataConverter.registerFormatProcessor('fiphr', FIPHRDataProcessor);
DataConverter.registerFormatProcessor('tidepool', TidepoolDataProcessor);

describe('Data conversion', function () {
  it('should fail when source format is missing', async function () {
    let data = [{}];
    let options = {
      target: 'fiphr',
      FHIR_userid: 'abc',
    };
    DataConverter.convert(data, options).should.be.rejected();
    //should(DataConverter.convert(data, options)).be.rejected();
  });

  it('should fail when target format is missing', async function () {
    let data = [{}];
    let options = {
      source: 'fiphr',
      FHIR_userid: 'abc',
    };

    DataConverter.convert(data, options).should.be.rejected();
    //should(DataConverter.convert(data, options)).be.rejected();
  });

  it('should fail when source format converter is missing', async function () {
    let data = [{}];
    let options = {
      source: 'nonexistingformat',
      target: 'fiphr',
      FHIR_userid: 'abc',
    };

    DataConverter.importRecords(data, options).should.be.rejected();
    //should(DataConverter.importRecords(data, options)).be.rejected();
  });

  it('should fail when target format converter is missing', async function () {
    let data = [{}];
    let options = {
      source: 'fiphr',
      target: 'nonexistingformat',
      FHIR_userid: 'abc',
    };
    DataConverter.exportRecords(data, options).should.be.rejected();
    //should(DataConverter.exportRecords(data, options)).be.rejected();
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
    (function () {
      abstractConverter.importRecords({});
    }.should.throw('Implementation for importRecords() is missing'));
    (function () {
      abstractConverter.exportRecords({});
    }.should.throw('Implementation for exportRecords() is missing'));
  });
});
