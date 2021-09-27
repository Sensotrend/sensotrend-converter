import { should } from 'chai';

import ConversionService from '../src/ConversionService.mjs';
import { NightscoutDataProcessor } from '../src/templates/nightscout/index.mjs';
import { FIPHRDataProcessor } from '../src/templates/fiphr/index.mjs';
import { TidepoolDataProcessor } from '../src/templates/tidepool/index.mjs';
import DataFormatConverter from '../src/DataFormatConverter.mjs';

should();

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

    try {
      await DataConverter.convert(data, options);
    } catch (error) {
      error.message.should.equal('Trying to convert data without format spec');
    }

    //should(DataConverter.convert(data, options)).be.rejected();
  });

  it('should fail when target format is missing', async function () {
    let data = [{}];
    let options = {
      source: 'fiphr',
      FHIR_userid: 'abc',
    };

    try {
      await DataConverter.convert(data, options);
    } catch (error) {
      error.message.should.equal('Trying to convert data without format spec');
    }
    //should(DataConverter.convert(data, options)).be.rejected();
  });

  it('should fail when source format converter is missing', async function () {
    let data = [{}];
    let options = {
      source: 'nonexistingformat',
      target: 'fiphr',
      FHIR_userid: 'abc',
    };
    try {
      await DataConverter.importRecords(data, options);
    } catch (error) {
      error.message.should.equal('No import processor found for format: nonexistingformat');
    }
    //should(DataConverter.importRecords(data, options)).be.rejected();
  });

  it('should fail when target format converter is missing', async function () {
    let data = [{}];
    let options = {
      source: 'fiphr',
      target: 'nonexistingformat',
      FHIR_userid: 'abc',
    };
    try {
      await DataConverter.exportRecords(data, options);
    } catch (error) {
      error.message.should.equal('No export processor found for format: fiphr');
    }
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

    try {
      await abstractConverter.importRecords({});
    } catch (error) {
      error.message.should.equal('Implementation for importRecords() is missing');
    }

    try {
      await abstractConverter.exportRecords({});
    } catch (error) {
      error.message.should.equal('Implementation for exportRecords() is missing');
    }
  });
});
