/* eslint-disable no-unused-vars */

import moment from 'moment';

import DataFormatConverter from '../../DataFormatConverter.mjs';

export class LibreCsvDataProcessor extends DataFormatConverter {
  constructor(logger) {
    super(logger);
  }

  convertRecordToIntermediate(r, options) {
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
    const devices = [];
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
        devices.push(device);
        break;
      case '1': //Read glucose measurement
        device.type = 'cbg';
        device.measurementReadOrHistoryInfo = 'scan';
        device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        device.timezoneOffset = moment().utcOffset();
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = parseFloat(r.scan_glucose_mmol_l.replace(/["]/g, '').replace(/[,]/g, '.'));
        device.units = 'mmol/l';
        devices.push(device);
        break;
      case '2': //Measurement tape (Diabetes)
        device.type = 'smbg';
        device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        device.timezoneOffset = moment().utcOffset();
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = parseFloat(r.strip_glucose_mmol_l.replace(/["]/g, '').replace(/[,]/g, '.'));
        device.units = 'mmol/l';
        devices.push(device);
        break;
      case '4': //Fast and  long insulin
        if (r.rapid_acting_insulin_units != '') {
          const deviceRapid = Object.create(data);
          deviceRapid.type = 'bolus';
          deviceRapid.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
          deviceRapid.timezoneOffset = moment().utcOffset();
          deviceRapid.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          deviceRapid.value = parseFloat(
            r.rapid_acting_insulin_units.replace(/["]/g, '').replace(/[,]/g, '.')
          );
          deviceRapid.units = 'IU';

          devices.push(deviceRapid);
        }
        if (r.long_acting_insulin_units != '') {
          const deviceLong = Object.create(data);
          deviceLong.type = 'long';
          deviceLong.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
          deviceLong.timezoneOffset = moment().utcOffset();
          deviceLong.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          deviceLong.value = parseFloat(
            r.long_acting_insulin_units.replace(/["]/g, '').replace(/[,]/g, '.')
          );
          deviceLong.units = 'IU';

          devices.push(deviceLong);
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
        devices.push(device);
        break;
    }

    return devices;
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

    for (let i = 0; i < data.length; i++) {
      const _e = conversionFunction(data[i], options);
      r.push.apply(r, _e);
    }
    this.logger.info('IMPORTED INTERMEDIATE.\n' + JSON.stringify(r));
    return r;
  }

  // Convert records to intermediate format
  exportRecords(input, options) {
    this.logger.info(
      'EXPORTING NOT IMPLEMENT FOR LIBRE CSV.\n' +
        JSON.stringify(input) +
        '\n' +
        JSON.stringify(options)
    );
    return [];
  }
}