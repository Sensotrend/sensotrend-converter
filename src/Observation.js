import {
  adjustTime,
  formatPeriod,
  formatTime,
  generateIdentifier,
  l10n as l10nCore,
  mgdl2mmoll,
} from './utils.js';

export const [cbg, mgdl, mmoll, smbg, wizard] = ['cbg', 'mg/dL', 'mmol/L', 'smbg', 'wizard'];

const l10n = {
  ...l10nCore,
  [wizard]: {
    de: 'Geschätzte Kohlenhydrataufnahme: ',
    en: 'Estimated carbohydrate intake: ',
    fi: 'Arvioitu hiilihydraattimäärä: ',
    sv: 'Beräknad mängd kolhydratintag: ',
  },
  [cbg]: {
    de: 'Gewebezucker: ',
    en: 'Glucose in body fluid: ',
    fi: 'Kudossokeri: ',
    sv: 'Vävnadssocker: ',
  },
  [smbg]: {
    de: 'Blutzucker: ',
    en: 'Blood glucose: ',
    fi: 'Verensokeri: ',
    sv: 'Blodsocker: ',
  },
  result: {
    de: 'Resultat: ',
    en: 'Result: ',
    fi: 'Tulos: ',
    sv: 'Resultat: ',
  },
};

const coding = {
  [wizard]: [
    {
      system: 'http://loinc.org',
      code: '9059-7',
      display: 'Carbohydrate intake Estimated',
    },
  ],
  [cbg]: {
    [mgdl]: [
      {
        system: 'http://loinc.org',
        code: '2344-0',
        display: 'Glucose [Mass/volume] in Body fluid',
      },
    ],
    [mmoll]: [
      {
        system: 'http://loinc.org',
        code: '14745-4',
        display: 'Glucose [Moles/volume] in Body fluid',
      },
    ],
  },
  [smbg]: {
    [mgdl]: [
      {
        system: 'http://loinc.org',
        code: '41653-7',
        display: 'Glucose [Mass/volume] in Capillary blood by Glucometer',
      },
      {
        system: 'http://loinc.org',
        code: '2339-0',
        display: 'Glucose [Mass/volume] in Blood',
      },
    ],
    [mmoll]: [
      {
        system: 'http://loinc.org',
        code: '14743-9',
        display: 'Glucose [Moles/volume] in Capillary blood by Glucometer',
      },
      {
        system: 'http://loinc.org',
        code: '15074-8',
        display: 'Glucose [Moles/volume] in Blood',
      },
    ],
  },
};

const unit = {
  g: {
    unit: 'g',
    system: 'http://unitsofmeasure.org',
    code: 'g',
  },
  [mgdl]: {
    unit: 'mg/dL',
    system: 'http://unitsofmeasure.org',
    code: 'mg/dL',
  },
  [mmoll]: {
    unit: 'mmol/l',
    system: 'http://unitsofmeasure.org',
    code: 'mmol/L',
  },
};

export default class Observation {
  constructor(patient, entry, language) {
    const {
      time,
      timezoneOffset,
      type,
      value,
      carbInput,
      device,
      units,
    } = entry;

    this.resourceType = 'Observation';
    this.meta = {};

    switch (type) {
      case wizard:
        this.meta.profile = ['http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake'];
        this.code = {
          coding: coding[wizard],
          text: l10n[type][this.language],
        };
        this.valueQuantity = {
          value: carbInput,
          ...unit.g,
        };
        break;
      case cbg:
        this.code = {
          // coding: coding[cbg][units],
          coding: coding[cbg][mmoll],
          text: l10n[type][this.language],
        };
        // falls through
      case smbg:
        this.code = this.code || {
          // coding: coding[smbg][units],
          coding: coding[smbg][mmoll],
          text: l10n[type][this.language],
        };
        this.valueQuantity = {
          // value,
          value: (units === mgdl) ? mgdl2mmoll(value) : value,
          // ...unit[units],
          ...unit[mmoll],
        };
        this.meta.profile = ['http://phr.kanta.fi/StructureDefinition/fiphr-bloodglucose-stu3'];
        break;
      default:
        this.code = { coding: [{ code: '??', display: type }] };
    }
    this.patient = patient;
    this.effectiveDateTime = adjustTime(time, timezoneOffset);

    this.subject = {
      reference: `Patient/${patient}`,
    };
    this.performer = [
      {
        reference: `Patient/${patient}`,
      },
    ];
    this.device = device;
    this.language = language || 'fi';
  }

  toString() {
    return {
      status: 'generated',
      div: `<div lang="${
        this.language
      }" xml:lang="${
        this.language
      }" xmlns="http://www.w3.org/1999/xhtml">${
        `${
          l10n.code[this.language]
        }${
          this.code.coding.map((c) => `${
            c.system === 'http://loinc.org' ? 'LOINC ' : ''
          }${
            c.code
          } (${
            c.display
          })`).join(', ')
        }`
      }${
        this.effectivePeriod
          ? `<br />${l10n.time[this.language]}${formatPeriod(this.effectivePeriod)}`
          : ''
      }${
        this.effectiveDateTime
          ? `<br />${l10n.time[this.language]}${formatTime(this.effectiveDateTime)}`
          : ''
      }${
        this.valueQuantity
          ? `<br />${
            this.code.text || l10n.result[this.language]
          }${
            this.valueQuantity.comparator || ''
          }${
            this.valueQuantity.value
          }${
            this.valueQuantity.unit
              ? ` ${this.valueQuantity.unit}`
              : ''
          }`
          : ''
      }${
        this.device
          ? `<br />${l10n.device[this.language]}${this.device.display}`
          : ''
      }</div>`,
    };
  }

  toJSON() {
    const {
      resourceType,
      id,
      meta,
      implicitRules,
      language,
      text = this.toString(),
      contained,
      extension,
      modifierExtension,
      identifier = [generateIdentifier(this)],
      // basedOn,
      // partOf,
      status = 'final',
      category,
      code,
      subject,
      // context,
      // focus,
      // encounter,
      effectiveDateTime,
      // effectivePeriod,
      // effectiveTiming,
      // effectiveInstant,
      issued = new Date().toISOString(),
      performer,
      valueQuantity,
      valueCodeableConcept,
      valueString,
      valueBoolean,
      valueRange,
      valueSampledData,
      valueAttachment,
      valueTime,
      valueDateTime,
      valuePeriod,
      dataAbsentReason,
      interpretation,
      note,
      comment,
      // bodySite,
      // method,
      // specimen,
      // device,
      referenceRange,
      // related,
      // hasMember,
      // derivedFrom,
      component,
    } = this;

    return {
      // Comment out properties that need to be stripped off for restrictive profile (Kanta PHR)
      resourceType,
      id,
      meta,
      implicitRules,
      language,
      text,
      contained,
      extension,
      modifierExtension,
      identifier,
      // basedOn,
      // partOf,
      status,
      category,
      code,
      subject,
      // context,
      // focus,
      // encounter,
      effectiveDateTime,
      // effectivePeriod,
      // effectiveTiming,
      // effectiveInstant,
      issued,
      performer,
      valueQuantity,
      valueCodeableConcept,
      valueString,
      valueBoolean,
      valueRange,
      valueSampledData,
      valueAttachment,
      valueTime,
      valueDateTime,
      valuePeriod,
      dataAbsentReason,
      interpretation,
      note,
      comment,
      // bodySite,
      // method,
      // specimen,
      // device,
      // related
      referenceRange,
      // hasMember,
      // derivedFrom,
      component,
    };
  }
}
