import moment from 'moment';
import ST from 'stjs';
// eslint-disable-next-line no-unused-vars
import _ from 'lodash';
import { v5 } from 'uuid';

import makeLogger from '../../env.mjs';
import DataFormatConverter from '../DataFormatConverter.mjs';

const logger = makeLogger();

const uuidv5 = v5;

const UUID_NAMESPACE = 'd040ecfe-2dd1-11e9-9178-f7b0f1a319bd';

const dataFormatConverter = new DataFormatConverter(logger);

export default class FiphrConvert {
  constructor() {
    this.logger = logger;
  }
  // Enrich the object with data needed by the templates
  enrichObject(sourceData, patientReference) {
    let entry = sourceData; //_.cloneDeep(sourceData);

    entry.patientId = patientReference;
    const time = moment(sourceData.time).utcOffset(sourceData.timezoneOffset);
    entry.time_fhir = time.toISOString(true);

    entry.issued = new Date().toISOString();

    entry.scanOrHistoricInfo = sourceData.scanOrHistoricInfo || '';

    let id = entry.type + ':' + entry.patientId + ':' + entry.deviceId + ':' + entry.time_fhir;

    if (entry.value) {
      id = id + ':' + entry.value; // It is possible for a device to have multiple records with the same timestamp
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
      this.logger.error('ALERT! Record type, time or device missing, cannot convert data');
      this.logger.debug(JSON.stringify(sourceData));
      return;
    }

    var template = await dataFormatConverter.loadTemplate('import_' + sourceData.type);
    if (!template) {
      this.logger.error('ALERT! Record type ' + sourceData.type + ' not handled');
      this.logger.debug(JSON.stringify(sourceData));
      return;
    }
    let data = this.enrichObject(sourceData, patientReference);
    return ST.transform(template, data);
  }
}
