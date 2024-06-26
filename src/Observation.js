import {
  defaultLanguage,
  fixedUnit,
  kantaR4Restrictions,
  kantaRestrictions,
} from './config.js';
import {
  adjustTime,
  formatPeriod,
  formatTime,
  generateIdentifier,
  getTidepoolIdentifier,
  getTime,
  l10n as l10nCore,
  mgdl2mmoll,
  mmoll2mgdl,
} from './utils.js';

export const [cbg, mgdl, mmoll, smbg, wizard] = ['cbg', 'mg/dL', 'mmol/L', 'smbg', 'wizard'];

const l10n = {
  ...l10nCore,
  [wizard]: {
    de: 'Geschätzte Kohlenhydrataufnahme',
    en: 'Carbohydrate intake Estimated',
    fi: 'Arvioitu hiilihydraattimäärä',
    sv: 'Beräknad mängd kolhydratintag',
  },
  [cbg]: {
    de: 'Gewebezucker',
    en: 'Glucose [Moles/volume] in Body fluid',
    fi: 'Kudossokeri',
    sv: 'Vävnadssocker',
  },
  glucose: {
    de: 'Blutzucker',
    en: 'Glucose [Moles/volume] in Blood',
    fi: 'Verensokeri',
    sv: 'Blodsocker',
  },
  [smbg]: {
    de: 'Blutzucker mit Blutzuckermessgerät',
    en: 'Glucose [Moles/volume] in Capillary blood by Glucometer',
    fi: 'Verensokeri verensokerimittarilla',
    sv: 'Blodsocker med blodsockermätare',
  },
  result: {
    de: 'Resultat',
    en: 'Result',
    fi: 'Tulos',
    sv: 'Resultat',
  },
  nutritionCategory: {
    de: 'Ernährung',
    en: 'Nutrition',
    fi: 'Ravitsemus',
    sv: 'Näringstillstånd',
  },
};

function getCoding(language) {
  return {
    [wizard]: [
      {
        system: 'http://loinc.org',
        code: '9059-7',
        display: (kantaRestrictions || kantaR4Restrictions)
          ? l10n.wizard[language]
          : 'Carbohydrate intake Estimated',
      },
    ],
    [cbg]: {
      [mgdl]: [
        {
          system: 'http://loinc.org',
          code: '2344-0',
          display: (kantaRestrictions || kantaR4Restrictions)
            ? l10n.cbg[language]
            : 'Glucose [Mass/volume] in Body fluid',
        },
      ],
      [mmoll]: [
        {
          system: 'http://loinc.org',
          code: '14745-4',
          display: (kantaRestrictions || kantaR4Restrictions)
            ? l10n.cbg[language]
            : 'Glucose [Moles/volume] in Body fluid',
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
          display: (kantaRestrictions || kantaR4Restrictions)
            ? l10n.smbg[language]
            : 'Glucose [Moles/volume] in Capillary blood by Glucometer',
        },
        {
          system: 'http://loinc.org',
          code: '15074-8',
          displaydisplay: (kantaRestrictions || kantaR4Restrictions)
            ? l10n.glucose[language]
            : 'Glucose [Moles/volume] in Blood',
        },
      ],
    },
  };
}

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

function fixValue(value, units) {
  if ((fixedUnit === mmoll) && (units === mgdl)) {
    return mgdl2mmoll(value);
  }
  if ((fixedUnit === mgdl) && (units === mmoll)) {
    return mmoll2mgdl(value);
  }
  return value;
}

export default class Observation {
  constructor(patient, entry, language) {
    const {
      carbInput,
      deviceId,
      guid,
      subtype,
      timezoneOffset,
      type,
      units,
      value,
    } = entry;

    const time = getTime(entry);

    this.resourceType = 'Observation';
    this.meta = {};
    this.language = language || defaultLanguage;

    switch (type) {
      case wizard:
        if (kantaR4Restrictions) {
          // Kanta R4 supports several profiles, but only Kanta PHR ones...
          this.meta.profile = [
            'http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake',
          ];
        } else {
          this.meta.profile = kantaRestrictions
            ? [
              'http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake-stu3',
            ]
            : [
              'http://roche.com/fhir/rdc/StructureDefinition/observation-carbs',
            ];
        }
        if (kantaRestrictions) {
          // A Kanta PHR specific category definition
          this.category = [
            {
              coding: [
                {
                  system: 'http://phr.kanta.fi/CodeSystem/fiphr-cs-observationcategory',
                  code: 'nutrition',
                  display: l10n.nutritionCategory[this.language],
                },
              ],
            },
          ];
        }
        this.code = {
          coding: getCoding(this.language)[wizard],
          text: l10n[type][this.language],
        };
        this.valueQuantity = {
          value: carbInput,
          ...unit.g,
        };
        break;
      case smbg:
        if (subtype !== 'scanned') {
          // Tidepool reports Freestyle Libre scans as SMBG,
          // we treat them as cbg
          this.code = {
            coding: getCoding(this.language)[smbg][fixedUnit || units],
            text: l10n[type][this.language],
          };
        }
        // falls through
      case cbg:
        this.code = this.code || {
          coding: getCoding(this.language)[cbg][fixedUnit || units],
          text: l10n[type][this.language],
        };
        this.valueQuantity = {
          value: fixValue(value, units),
          ...unit[fixedUnit || units],
        };
        if (kantaR4Restrictions) {
          // Support several profiles, but only Kanta PHR ones...
          this.meta.profile = [
            'http://phr.kanta.fi/StructureDefinition/fiphr-sd-bloodglucose',
          ];
        } else {
          this.meta.profile = kantaRestrictions
            ? [
              'http://phr.kanta.fi/StructureDefinition/fiphr-bloodglucose-stu3',
            ]
            : [
              'http://roche.com/fhir/rdc/StructureDefinition/bg-observation',
            ];
        }
        if (kantaRestrictions) {
          // Glucose measurements are not really vitals, But KantaPHR insists they are...
          this.category = this.category || [
            {
              coding: [
                {
                  system: (!kantaR4Restrictions)
                    ? 'http://hl7.org/fhir/observation-category'
                    : 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                },
              ],
            },
          ];
        }
        break;
      default:
    }
    this.effectiveDateTime = adjustTime(time, timezoneOffset);
    this.issued = adjustTime(new Date().toISOString(), timezoneOffset);

    this.subject = {
      reference: `Patient/${patient}`,
    };
    this.performer = [
      {
        reference: `Patient/${patient}`,
      },
    ];
    if (!kantaRestrictions && deviceId) {
      this.device = { display: deviceId };
    }
    this.identifier = [generateIdentifier(this)];
    if (guid) {
      this.identifier.push(getTidepoolIdentifier(guid));
    }
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
          ? `<br />${l10n.time[this.language]}${formatPeriod(this.effectivePeriod, this.language)}`
          : ''
      }${
        this.effectiveDateTime
          ? `<br />${l10n.time[this.language]}${formatTime(this.effectiveDateTime, this.language)}`
          : ''
      }${
        this.valueQuantity
          ? `<br />${
            this.code.text || l10n.result[this.language]
          }: ${
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
      identifier,
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

    return kantaRestrictions
      ? {
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
        status,
        category,
        code,
        subject,
        effectiveDateTime,
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
        referenceRange,
        component,
      }
      : {
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
        basedOn,
        partOf,
        status,
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
        bodySite,
        method,
        specimen,
        device,
        related,
        referenceRange,
        hasMember,
        derivedFrom,
        component,
      };
  }
}
