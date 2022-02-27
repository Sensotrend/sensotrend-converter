import { v5 as uuidv5 } from 'uuid';

const GLUCOSE_MOLAR_MASS = 18.0156;

const NAMESPACE = uuidv5('https://www.hl7.org/fhir/', uuidv5.URL);

export function generateIdentifier(resource) {
  const {
    resourceType,
    effectiveDateTime,
    effectivePeriod,
    device,
    subject,
    dosage,
    valueQuantity,
    valueCodeableConcept,
    valueString,
    valueBoolean,
    valueInteger,
    valueRange,
    valueRatio,
    valueSampledData,
    valueTime,
    valueDateTime,
    valuePeriod,
  } = resource;
  const string = `${
    resourceType
  } ${
    device?.display || device?.reference || subject?.reference || subject?.display
  } ${
    effectiveDateTime || effectivePeriod?.start
  } ${
    JSON.stringify(dosage || valueQuantity || valueCodeableConcept || valueString || valueBoolean
      || valueInteger || valueRange || valueRatio || valueSampledData || valueTime || valueDateTime
      || valuePeriod)
  }`;
  return uuidv5(string, NAMESPACE);  
};

export const l10n = Object.freeze({
  code: Object.freeze({
    de: 'Code: ',
    en: 'Code: ',
    fi: 'Koodi: ',
    sv: 'Kod: ',
  }),
  time: Object.freeze({
    de: 'Zeit: ',
    en: 'Time: ',
    fi: 'Aika: ',
    sv: 'Tid: ',
  }),
  device: Object.freeze({
    de: 'Gerät: ',
    en: 'Device: ',
    fi: 'Laite: ',
    sv: 'Apparat: ',
  }),
  via: Object.freeze({
    de: 'via ',
    en: 'via ',
    fi: 'via ',
    sv: 'via ',
  }),
});

function pad(i) {
  return `${i < 10 ? '0' : ''}${i}`;
}

export function formatTime(time) {
  const date = new Date(time);
  return `${
    date.getDate()
  }.${
    date.getMonth() + 1
  }.${
    date.getFullYear()
  } ${
    date.getHours()
  }:${
    pad(date.getMinutes())
  }`;
}

export function formatPeriod(period) {
  return `${formatTime(period.start)} - ${formatTime(period.end)}`;
}

export function mgdl2mmoll(value) {
  return Math.round((value / 18.0156) * 100) / 100;
}

/*
export class value {
  constructor(value, precision = 2) {
    this.value = value;
    this.precision = precision;
  }
  toJSON() {
    return this.toString();
  }
  toString() {
    return this.value?.toFixed(this.precision);
  }
}
*/



