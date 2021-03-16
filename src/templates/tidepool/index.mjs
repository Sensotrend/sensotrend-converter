import DataFormatConverter from '../../DataFormatConverter.mjs';

const converterName = process.env.CONVERTER_NAME || 'Sensotrend Connect';

/**
 * Class to convert Tidepool input data into intermediate Tidepool-like format
 */
export class TidepoolDataProcessor extends DataFormatConverter {
  constructor(logger, templateMotor) {
    super(logger, templateMotor);
  }

  convertRecordToIntermediate(r, options) {
    if (!r._converter) {
      r._converter = options.converter || converterName;
    }
    // Tidepool Uploader treats Freestyle Libre scans as measurements
    // See https://github.com/tidepool-org/uploader/issues/1141
    if (r.type === 'smbg' && r.subType === 'scanned') {
      r.type = 'cbg';
    }
    return r;
  }

  /**
   * Returns a Date object representing the record date
   * @param {Object} record Tidepool format record
   */
  getRecordTime(record) {
    return new Date(record.time);
  }

  convertIntermediateToTidepool(r) {
    return r;
  }

  // Convert records to intermediate format
  importRecords(input, options) {
    this.logger.info(
      'IMPORTING INTERMEDIATE.\n' + JSON.stringify(input) + '\n' + JSON.stringify(options)
    );
    const data = input.constructor == Array ? input : [input];
    let r = [];
    const conversionFunction = this.convertRecordToIntermediate;
    data.forEach(function (e) {
      const _e = conversionFunction(e, options);
      r.push(_e);
    });
    this.logger.info('IMPORTED INTERMEDIATE.\n' + JSON.stringify(r));
    return r;
  }

  // Convert records to intermediate format
  exportRecords(input, options) {
    this.logger.info(
      'EXPORTING INTERMEDIATE.\n' + JSON.stringify(input) + '\n' + JSON.stringify(options)
    );
    const data = input.constructor == Array ? input : [input];
    const r = [];
    const conversionFunction = this.convertIntermediateToTidepool;
    data.forEach(function (e) {
      r.push(conversionFunction(e, options));
    });
    this.logger.info('EXPORTED INTERMEDIATE.\n' + JSON.stringify(r));
    return r;
  }
}
