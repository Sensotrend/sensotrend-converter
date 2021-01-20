import DataFormatConverter from '../../DataFormatConverter.mjs';

export class LibreCsvDataProcessor extends DataFormatConverter {
  constructor(logger) {
    super(logger);
  }

  convertRecordToIntermediate(r, options) {
    data = {
      time: '',
      timezoneOffset: '',
      type: '',
      deviceId: '',
      normal: '',
      value: '',
      units: '',
      scanOrHistoricInfo: '',
    };

    const device = Object.create(data);
    const devices = [];

    switch (r.record_type) {
      case '0': //History of glucose measurement
        device.type = 'sgv';
        device.scanOrHistoricInfo = 'historic';
        device.time = r.device_timestamp;
        device.timezoneOffset = '';
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = r.historic_glucose_mmol_l;
        device.units = 'mmol/l';
        devices.push(device);
        break;
      case '1': //Read glucose measurement
        device.type = 'sgv';
        device.measurementReadOrHistoryInfo = 'scan';
        device.time = r.device_timestamp;
        device.timezoneOffset = '';
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = r.scan_glucose_mmol_l;
        device.units = 'mmol/l';
        devices.push(device);
        break;
      case '2': //Measurement tape (Diabetes)
        device.type = 'smbg';
        device.time = r.device_timestamp;
        device.timezoneOffset = '';
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = r.strip_glucose_mmol_l;
        device.units = 'mmol/l';
        devices.push(device);
        break;
      case '4': //Fast and  long insulin
        if (r.rapid_acting_insulin_units != '') {
          const deviceRapid = Object.create(data);
          deviceRapid.type = 'bolus';
          deviceRapid.time = r.device_timestamp;
          deviceRapid.timezoneOffset = '';
          deviceRapid.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          deviceRapid.value = r.rapid_acting_insulin_units;
          deviceRapid.units = 'IU';

          devices.push(deviceRapid);
        }
        if (r.long_acting_insulin_units != '') {
          const deviceLong = Object.create(data);
          deviceLong.type = 'long';
          deviceLong.time = r.device_timestamp;
          deviceLong.timezoneOffset = '';
          deviceLong.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
          deviceLong.value = r.long_acting_insulin_units;
          deviceLong.units = 'IU';

          devices.push(deviceLong);
        }
        break;
      case '5': //Carbohydrates
        device.type = 'carbs';
        device.measurementReadOrHistoryInfo = 'scan';
        device.time = r.device_timestamp;
        device.timezoneOffset = '';
        device.deviceId = `AbbottFreeStyleLibre${r.serial_number}`;
        device.value = r.carbohydrates_grams;
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
