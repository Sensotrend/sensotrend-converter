/* eslint-disable no-unused-vars */

import moment from 'moment';

import DataFormatConverter from '../../DataFormatConverter.mjs';

export class LibreCsvDataProcessor extends DataFormatConverter {
  constructor(logger) {
    super(logger);
  }

  async convertRecordToIntermediate(r, options) {
    const data = {
      time: '',
      timezoneOffset: '',
      type: '',
      deviceId: '',
      normal: '',
      value: '',
      units: '',
      _converter: 'Sensotrend Connect',
      scanOrHistoricInfo: '',
    };

    const device = Object.create(data);

    moment.defaultFormat = 'MM-DD-YYYY HH:mm';

    switch (r.record_type) {
      case '0': //History of glucose measurement
        device.type = 'cbg';
        device.scanOrHistoricInfo = 'historic';
        device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        device.timezoneOffset = moment().utcOffset();
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = parseFloat(r.historic_glucose_mmol_l.replace(/["]/g, ''));
        device.units = 'mmol/l';

        break;
      case '1': //Read glucose measurement
        device.type = 'cbg';
        device.measurementReadOrHistoryInfo = 'scan';
        device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        device.timezoneOffset = moment().utcOffset();
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = parseFloat(r.scan_glucose_mmol_l.replace(/["]/g, '').replace(/[,]/g, '.'));
        device.units = 'mmol/l';

        break;
      case '2': //Measurement tape (Diabetes)
        device.type = 'smbg';
        device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        device.timezoneOffset = moment().utcOffset();
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = parseFloat(r.strip_glucose_mmol_l.replace(/["]/g, '').replace(/[,]/g, '.'));
        device.units = 'mmol/l';

        break;
      case '4': //Fast and  long insulin
        if (r.rapid_acting_insulin_units != '') {
          device.type = 'bolus';
          device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
          device.timezoneOffset = moment().utcOffset();
          device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          device.value = parseFloat(
            r.rapid_acting_insulin_units.replace(/["]/g, '').replace(/[,]/g, '.')
          );
          device.units = 'IU';

          break;
        }
        if (r.long_acting_insulin_units != '') {
          device.type = 'long_acting';
          device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
          device.timezoneOffset = moment().utcOffset();
          device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          device.value = parseFloat(
            r.long_acting_insulin_units.replace(/["]/g, '').replace(/[,]/g, '.')
          );
          device.units = 'IU';

          break;
        }
        break;
      case '5': //Carbohydrates
        device.type = 'carbs';
        device.measurementReadOrHistoryInfo = 'scan';
        device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        device.timezoneOffset = moment().utcOffset();
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = parseFloat(r.carbohydrates_grams.replace(/["]/g, '').replace(/[,]/g, '.'));
        device.units = 'g';

        break;
    }

    return device;
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

  spliceArray(arr, options, convertFunc) {
    let spliceCollection = [];

    while (arr.length !== 0) {
      spliceCollection.push(
        arr.splice(0, 500).map((element) => {
          return convertFunc(element, options);
        })
      );
    }

    return spliceCollection;
  }

  // Convert records to intermediate format
  async importRecords(input, options) {
    if (process.env.SHOW_LOG) {
      this.logger.info(
        'IMPORTING INTERMEDIATE.\n' + JSON.stringify(input) + '\n' + JSON.stringify(options)
      );
    }
    const data = input.constructor == Array ? input : [input];

    const splicedData = this.spliceArray(data, options, this.convertRecordToIntermediate);
    const allRData = await Promise.all(
      splicedData.map(async (element) => await Promise.all(element))
    );

    let r = allRData.flat();

    if (process.env.SHOW_LOG) {
      this.logger.info('IMPORTED INTERMEDIATE.\n' + JSON.stringify(r));
    }
    return r;
  }

  // Convert records to intermediate format
  async exportRecords(input, options) {
    this.logger.info(
      'EXPORTING NOT IMPLEMENT FOR LIBRE CSV.\n' +
        JSON.stringify(input) +
        '\n' +
        JSON.stringify(options)
    );
    return [];
  }
}
