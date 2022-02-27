import {
  formatPeriod,
  formatTime,
  generateIdentifier,
  l10n as l10nCore,
  mgdl2mmoll,
} from './utils.js';

export const [
  carbsEst,
  sgvMgdl,
  sgvMmol,
  smbgMgdl,
  smbgMmol,
] = ['carbsEst', 'sgvMgdl', 'sgvMmol', 'smbgMgdl', 'smbgMmol'];

const l10n = {
  ...l10nCore,
  [carbsEst]: {
    de: 'Geschätzte Kohlenhydrataufnahme: ',
    en: 'Estimated carbohydrate intake: ',
    fi: 'Arvioitu hiilihydraattimäärä: ',
    sv: 'Beräknad mängd kolhydratintag: ',
  },
  [sgvMgdl]: {
    de: 'Gewebezucker: ',
    en: 'Glucose in body fluid: ',
    fi: 'Kudossokeri: ',
    sv: 'Vävnadssocker: ',
  },
  [sgvMmol]: {
    de: 'Gewebezucker: ',
    en: 'Glucose in body fluid: ',
    fi: 'Kudossokeri: ',
    sv: 'Vävnadssocker: ',
  },
  [smbgMgdl]: {
    de: 'Blutzucker: ',
    en: 'Blood glucose: ',
    fi: 'Verensokeri: ',
    sv: 'Blodsocker: ',
  },
  [smbgMmol]: {
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
  [carbsEst]: [
    {
      system: 'http://loinc.org',
      code: '9059-7',
      display: 'Carbohydrate intake Estimated',
    },
  ],
  [sgvMgdl]: [
    {
      system: 'http://loinc.org',
      code: '2344-0',
      display: 'Glucose [Mass/volume] in Body fluid',
    },
  ],
  [sgvMmol]: [
    {
      system: 'http://loinc.org',
      code: '14745-4',
      display: 'Glucose [Moles/volume] in Body fluid',
    },
  ],
  [smbgMgdl]: [
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
  [smbgMmol]: [
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
};

const units = {
  [carbsEst]: {
    unit: 'g',
    system: 'http://unitsofmeasure.org',
    code: 'g',
  },
  [sgvMgdl]: {
    unit: 'mg/dL',
    system: 'http://unitsofmeasure.org',
    code: 'mg/dL',
  },
  [sgvMmol]: {
    unit: 'mmol/l',
    system: 'http://unitsofmeasure.org',
    code: 'mmol/L',
  },
  [smbgMgdl]: {
    unit: 'mg/dL',
    system: 'http://unitsofmeasure.org',
    code: 'mg/dL',
  },
  [smbgMmol]: {
    unit: 'mmol/l',
    system: 'http://unitsofmeasure.org',
    code: 'mmol/L',
  },
};

export default class Observation {
  constructor(patient, time, type, amount) {
    this.resourceType = 'Observation',
    this.meta = {};
    this.type = type;
    // For Kanta PHR
    switch (type) {
      case carbsEst:
        this.meta.profiles = ['http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake'];
        break;
      case sgvMgdl:
      case smbgMgdl:
        // convert
        amount = mgdl2mmoll(amount);
        // Flow to next
      case sgvMmol:
      case smbgMmol:
        this.meta.profiles = ['http://phr.kanta.fi/StructureDefinition/fiphr-bloodglucose-stu3'];
        break;
    }
    if (type === sgvMgdl) {
      type = sgvMmol;
    } else if (type == smbgMgdl) {
      type = smbgMmol;
    }
    this.patient = patient;
    this.effectiveDateTime = time;
    this.valueQuantity = {
      value: amount,
      ...units[type],
    };
    this.subject = {
      reference: `Patient/${patient}`,
    };
    this.performer = [
      {
        reference: `Patient/${patient}`,
      },
    ];
    this.language = 'fi';
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
          coding[this.type].map((c) => `${
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
          : this.effectiveDateTime
            ? `<br />${l10n.time[this.language]}${formatTime(this.effectiveDateTime)}`
            : ''
      }${
        this.valueQuantity
          ? `<br />${
            l10n[this.type][this.language] || l10n.result[this.language]
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
      identifier = generateIdentifier(this),
      basedOn,
      partOf,
      status = 'final',
      category,
      code,
      subject,
      context,
      focus,
      encounter,
      effectiveDateTime,
      effectivePeriod,
      effectiveTiming,
      effectiveInstant,
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
      bodySite,
      method,
      specimen,
      device,
      referenceRange,
      related,
      hasMember,
      derivedFrom,
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
