/* eslint-disable no-case-declarations */
import moment from 'moment';
import _ from 'lodash';
import { v5 } from 'uuid';
import DataFormatConverter from '../../DataFormatConverter.mjs';

import { importFiphrGroups } from './import_fiphr_groups.mjs';
import { exportFiphrGroups } from './export_fiphr_groups.mjs';
import changeObjectKeyToLowerCase from '../../tools/changeObjectKeyToLowerCase.mjs';
import { LogWithCounter } from '../../../env.mjs';

const uuidv5 = v5;

const UUID_NAMESPACE = 'd040ecfe-2dd1-11e9-9178-f7b0f1a319bd';

const descriptionIllegalStrings = [' (via Sensotrend Connect)', ' (via Nightscout Connect)'];

const exportFiphrGroupsSmallKey = changeObjectKeyToLowerCase(exportFiphrGroups);
const importFiphrGroupsSmallKey = changeObjectKeyToLowerCase(importFiphrGroups);

const alertResourceTypeLogWithCounter = new LogWithCounter({
  firstTimeLog: true,
  launchTimeCounter: 100,
});
const alertRecordTypeLogWithCounter = new LogWithCounter({
  firstTimeLog: true,
  launchTimeCounter: 5000,
});

const alertLogWithCounter = new LogWithCounter({
  firstTimeLog: true,
  launchTimeCounter: 100,
});

function toTimezone(minutes) {
  const h = Math.floor(Math.abs(minutes / 60)).toString();
  const m = (minutes % 60).toString();
  return `${
    minutes < 0 ? '-' : '+'
  }${
    h.length < 2 ? '0' : ''
  }${
    h
  }:${
    m.length < 2 ? '0' : ''
  }${
    m
  }`
}

/**
 * Class to convert FIPHR input data into intermediate Tidepool-like format & back
 */
export class FIPHRDataProcessor extends DataFormatConverter {
  constructor(logger) {
    super(logger);
  }

  /**
   * Returns a Date object representing the record date
   * @param {Object} record Tidepool format record
   */
  getRecordTime(record) {
    return new Date(record.effectiveDateTime);
  }

  enrichFHIRObject(sourceData) {
    let entry = sourceData; //_.cloneDeep(sourceData);

    if (sourceData.valueQuantity && sourceData.valueQuantity.unit) {
      if (sourceData.valueQuantity.unit == 'mmol/l') {
        entry._valuemgdl = (sourceData.valueQuantity.value * 18.0156).toFixed(0);
      }
    }

    entry.deviceId = 'Device Unknown';

    if (sourceData.text && sourceData.text.div) {
      let desc = sourceData.text.div;

      descriptionIllegalStrings.forEach(function (s) {
        desc.replace(s, '');
      });

      const split = desc
        .replace('</div>', '')
        .replace(/<br\s*\/>/g, '|||')
        .split('|||');

      split.forEach(function (e) {
        const keyValue = e.split(': ');
        switch (keyValue[0]) {
          case 'Laite':
          case 'Device':
            entry.deviceId = keyValue[1]
              .replace(' (via Sensotrend Connect)', '')
              .replace(' (via Nightscout Connect)', '');
            break;
          case 'Muutos':
            const deltaSplit = keyValue[1].split(' ');
            const delta = Number(deltaSplit[0]);
            // eslint-disable-next-line no-unused-vars
            const units = deltaSplit[1];
            entry._deltammol = delta;
            break;
          case 'Suunta':
            entry.direction = keyValue[1];
            break;
          case 'Mittauslaatu':
            entry.noise = Number(keyValue[1]);
            break;
        }
      });
    }

    const d = moment.parseZone(sourceData.effectiveDateTime);
    entry._timestamp = d.valueOf();
    entry._timezoneOffset = d.utcOffset();
    entry._ISODate = d.toISOString();

    return entry;
  }

  removeDash(text) {
    return text.replace(/-/g, '');
  }

  async _convertRecordFromFHIR(sourceData, context) {
    if (!sourceData.resourceType) {
      return false;
    }

    try {
      let code;
      let type = sourceData.resourceType;
      let exportFiphrFunction;

      if (sourceData.code) {
        code = sourceData.code.coding[0].code;
      }

      if (sourceData.medicationCodeableConcept) {
        code = sourceData.medicationCodeableConcept.coding[0].code;
      }

      const codeWithOutDash = this.removeDash(code);

      exportFiphrFunction = exportFiphrGroupsSmallKey[`${type}${codeWithOutDash}`.toLowerCase()];

      if (!exportFiphrFunction) {
        alertResourceTypeLogWithCounter.error(
          'ALERT! FHIR resource type ' + sourceData.type + ' not handled'
        );
        this.logger.debug(JSON.stringify(sourceData));
        return;
      }
      let data = this.enrichFHIRObject(sourceData);
      return exportFiphrFunction.call(data);
    } catch (error) {
      this.logger.info(
        'Problem converting data on context: ' +
          context +
          ' ' +
          JSON.stringify(sourceData, null, 2) +
          ' ' +
          JSON.stringify(error)
      );
    }
  }

  // Convert records to intermediate format
  async importRecords(input, options) {
    this.logger.info(
      'IMPORTING INTERMEDIATE.\n' + JSON.stringify(input) + '\n' + JSON.stringify(options)
    );
    const data = input.constructor == Array ? input : [input];
    let convertedRecords = await Promise.all(
      data.map(async (record) => {
        let r = record;
        if (r.resource) r = r.resource;
        return this._convertRecordFromFHIR(r, options);
      })
    );
    const filtered = convertedRecords.filter(Boolean);
    this.logger.info('IMPORTED INTERMEDIATE.\n' + JSON.stringify(filtered));
    return filtered;
  }

  // Enrich the object with data needed by the templates
  enrichObject(sourceData, patientReference) {
    let entry = sourceData; //_.cloneDeep(sourceData);

    entry.patientId = patientReference;
    // This does not set the correct UTC offset, rather the local timezone.
    // See https://momentjs.com/guides/#/parsing/
    const parsedTime = moment.utc(sourceData.time);
    const adjustedTime = parsedTime.clone().add(sourceData.timezoneOffset, 'minutes');
    const timeString = adjustedTime.toISOString().replace('Z', toTimezone(sourceData.timezoneOffset));
    const time = moment.parseZone(timeString);

    entry.time_fhir = time.toISOString(true);

    entry.issued = new Date().toISOString();

    entry.scanOrHistoricInfo = sourceData.scanOrHistoricInfo || '';

    let id = entry.type + ':' + entry.patientId + ':' + entry.deviceId + ':' + entry.time_fhir;

    if (entry.value) {
      id = id + ':' + entry.value; // It is possible for a device to have multuple records with the same timestamp
    }

    entry.guid = uuidv5(id, UUID_NAMESPACE);

    // TODO: Handle records with invalid date string

    if (sourceData.normal) {
      entry.insulin = sourceData.normal;
    }

    const textArray = [];

    entry.formattedDate = time.format('D.M.YYYY H:mm:ss');
    textArray.push('Aika: ' + entry.formattedDate);
    textArray.push('Laite: ' + entry.deviceId + ' (via ' + entry._converter + ')');

    // ensure records with a BG value have mmol values available
    if (entry.value && entry.units) {
      if (entry.units == 'mg/dL') {
        entry.valueMmol = Math.round((entry.value / 18.0156) * 100) / 100;
        textArray.push(
          'Tulos: ' + (entry.valueMmol ? entry.valueMmol.toFixed(2) : '?') + ' mmol/l'
        );
        /*
            if (entry.delta) {
               entry.deltaMmol = Math.round((entry.delta / 18.0156) * 100) / 100;
               textArray.push("Muutos: " + (entry.deltaMmol ? entry.deltaMmol.toFixed(2) : "?") + " mmol/l");
            }
            */
      } else {
        entry.valueMmol = entry.value;
        textArray.push(
          'Tulos: ' + (entry.valueMmol ? entry.valueMmol.toFixed(1) : '?') + ' mmol/l'
        );
        /*
            if (entry.delta) {
               entry.deltaMmol = entry.delta;
               textArray.push("Muutos: " + (entry.deltaMmol ? entry.deltaMmol.toFixed(2) : "?") + " mmol/l");
            }
            */
      }
    }
    /*
      if (entry.direction) {
         textArray.push("Suunta: " + entry.direction);
      }

      if (entry.noise) {
         textArray.push("Mittauslaatu: " + entry.noise);
      }
      */

    entry._statusMessage = textArray.join('<br />');

    return entry;
  }

  async convertRecord(sourceData, patientReference) {
    if (!sourceData.type || !sourceData.time || !sourceData.deviceId) {
      alertRecordTypeLogWithCounter.error(
        'ALERT! Record type, time or device missing, cannot convert data'
      );
      this.logger.debug(JSON.stringify(sourceData));
      return;
    }

    let fiphrConvertFunction;
    // TODO: It does not make sense to load the templates each time, for each record!
    // These should be memoized!
    try {
      fiphrConvertFunction = importFiphrGroupsSmallKey[sourceData.type.toLowerCase()];
    } catch (e) {
      alertLogWithCounter.error(
        'ALERT! Unable to find fiphrConvertFunction to type: ' +
          sourceData.type +
          '. ' +
          JSON.stringify(e)
      );
    }
    if (!fiphrConvertFunction) {
      alertLogWithCounter.error('ALERT! Record type ' + sourceData.type + ' not handled');
      this.logger.debug(JSON.stringify(sourceData));
      return;
    }
    let data = this.enrichObject(sourceData, patientReference);
    return fiphrConvertFunction.call(data);
  }

  // Convert records to FHIR format
  async exportRecords(input, options) {
    if (process.env.SHOW_LOG) {
      this.logger.info(
        'EXPORTING INTERMEDIATE.\n' + JSON.stringify(input) + '\n' + JSON.stringify(options)
      );
    }
    if (!options.FHIR_userid) {
      this.logger.info('options.FHIR_userid needed for FHIR exporting');
      return false;
    }
    const data = input.constructor == Array ? input : [input];
    var d = [];
    data.map((record) => {
      if (record.type == 'wizard') {
        if (record.carbInput) {
          let entry = _.cloneDeep(record);
          entry.type = 'carbs';
          d.push(entry);
        }
        if (record.normal) {
          let entry = _.cloneDeep(record);
          entry.type = 'bolus';
          d.push(entry);
        }
        if (record.long) {
          let entry = _.cloneDeep(record);
          entry.type = 'long';
          d.push(entry);
        }
        if (record.bolus) {
          if (record.bolus.type) {
            let entry = _.cloneDeep(record.bolus);
            entry._converter = record._converter;
            d.push(entry);
          }
        }
      } else {
        d.push(record);
      }
    });
    // eslint-disable-next-line no-prototype-builtins
    if (!options.hasOwnProperty('csvGenerator')) {
      let convertedRecords = await Promise.all(
        d.map(async (record) => {
          return this.convertRecord(record, options.FHIR_userid);
        })
      );
      const filtered = convertedRecords.filter(Boolean);
      if (process.env.SHOW_LOG) {
        this.logger.info('EXPORTED INTERMEDIATE.\n' + JSON.stringify(filtered));
      }
      return filtered;
    } else {
      let convertedRecords = await Promise.all(
        d.map(async (record) => {
          return this.convertRecord(record, options.FHIR_userid);
        })
      );
      const filtered = convertedRecords.filter(Boolean);
      if (process.env.SHOW_LOG) {
        this.logger.info('EXPORTED INTERMEDIATE.\n' + JSON.stringify(filtered));
      }
      return filtered;
    }
  }
}
