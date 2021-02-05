/* eslint-disable no-unused-vars */

import moment from 'moment';

import DataFormatConverter from '../../DataFormatConverter.mjs';

export class LibreCsvDataProcessor extends DataFormatConverter {
  constructor(logger) {
    super(logger);

    this.data = {
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
  }

  convertRecordToIntermediate(r, options) {
    this.device = Object.create(this.data);
    this.devices = [];
    moment.defaultFormat = 'MM-DD-YYYY HH:mm';

    switch (r.record_type) {
      case '0': //History of glucose measurement
        this.device.type = 'cbg';
        this.device.scanOrHistoricInfo = 'historic';
        this.device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        this.device.timezoneOffset = moment().utcOffset();
        this.device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        this.device.value = parseFloat(r.historic_glucose_mmol_l.replace(/["]/g, ''));
        this.device.units = 'mmol/l';
        this.devices.push(device);
        break;
      case '1': //Read glucose measurement
        this.device.type = 'cbg';
        this.device.measurementReadOrHistoryInfo = 'scan';
        this.device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        this.device.timezoneOffset = moment().utcOffset();
        this.device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        this.device.value = parseFloat(
          r.scan_glucose_mmol_l.replace(/["]/g, '').replace(/[,]/g, '.')
        );
        this.device.units = 'mmol/l';
        this.devices.push(this.device);
        break;
      case '2': //Measurement tape (Diabetes)
        this.device.type = 'smbg';
        this.device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        this.device.timezoneOffset = moment().utcOffset();
        this.device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        this.device.value = parseFloat(
          r.strip_glucose_mmol_l.replace(/["]/g, '').replace(/[,]/g, '.')
        );
        this.device.units = 'mmol/l';
        this.devices.push(this.device);
        break;
      case '4': //Fast and  long insulin
        if (r.rapid_acting_insulin_units != '') {
          this.deviceRapid = Object.create(this.data);
          this.deviceRapid.type = 'bolus';
          this.deviceRapid.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
          this.deviceRapid.timezoneOffset = moment().utcOffset();
          this.deviceRapid.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          this.deviceRapid.value = parseFloat(
            r.rapid_acting_insulin_units.replace(/["]/g, '').replace(/[,]/g, '.')
          );
          this.deviceRapid.units = 'IU';

          this.devices.push(this.deviceRapid);
        }
        if (r.long_acting_insulin_units != '') {
          this.deviceLong = Object.create(this.data);
          this.deviceLong.type = 'long';
          this.deviceLong.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
          this.deviceLong.timezoneOffset = moment().utcOffset();
          this.deviceLong.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          this.deviceLong.value = parseFloat(
            r.long_acting_insulin_units.replace(/["]/g, '').replace(/[,]/g, '.')
          );
          this.deviceLong.units = 'IU';

          this.devices.push(this.deviceLong);
        }
        break;
      case '5': //Carbohydrates
        this.device.type = 'carbs';
        this.device.measurementReadOrHistoryInfo = 'scan';
        this.device.time = moment(r.device_timestamp, moment.defaultFormat).toDate();
        this.device.timezoneOffset = moment().utcOffset();
        this.device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        this.device.value = parseFloat(
          r.carbohydrates_grams.replace(/["]/g, '').replace(/[,]/g, '.')
        );
        this.device.units = 'g';
        this.devices.push(this.device);
        break;
    }

    return this.devices;
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
      _e.forEach((data) => {
        r.push(data);
      });
    });
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
