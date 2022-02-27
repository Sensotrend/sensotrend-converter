import {
  formatPeriod, formatTime, generateIdentifier, l10n as l10nCore,
} from './utils.js';

export const [shortActing, longActing] = ['shortActing', 'longActing'];

const l10n = {
  ...l10nCore,
  typeOfInsulin: {
    de: 'Art des Insulins: ',
    en: 'Type of insulin: ',
    fi: 'Insuliinin tyyppi: ',
    sv: 'Typ av insulin: ',
  },
  [shortActing]: {
    de: 'Kurzwirkendes Insulin',
    en: 'Fast-acting insulin',
    fi: 'Lyhytvaikutteinen insuliini',
    sv: 'Direktverkande insulin',
  },
  [longActing]: {
    de: 'Langwirkendes Insulin',
    en: 'Long-acting insulin',
    fi: 'Pitkävaikutteinen insuliini',
    sv: 'Långverkande insulin',
  },
  dose: {
    de: 'Dosis: ',
    en: 'Dose: ',
    fi: 'Annos: ',
    sv: 'Dos: ',
  },
};

const coding = {
  [longActing]: [
    {
      system: 'http://snomed.info/sct',
      code: '25305005',
      display: 'Long-acting insulin (substance)',
    },
    {
      system: 'http://phr.kanta.fi/CodeSystem/fiphr-cs-insulincode',
      code: 'ins-intermediate-long',
      display: 'Pitkävaikutteinen insuliini',
    },
    {
      system: 'http://snomed.info/sct',
      code: '67866001',
      display: 'Insulin (substance)',
    },
  ],
  [shortActing]: [
    {
      system: 'http://snomed.info/sct',
      code: '411531001',
      display: 'Short-acting insulin (substance)',
    },
    {
      system: 'http://phr.kanta.fi/CodeSystem/fiphr-cs-insulincode',
      code: 'ins-short-fast',
      display: 'Lyhytvaikutteinen insuliini',
    },
    {
      system: 'http://snomed.info/sct',
      code: '67866001',
      display: 'Insulin (substance)',
    },
  ],
};

export default class InsulinAdministration {
  constructor(patient, time, type, amount) {
    this.resourceType = 'MedicationAdministration',
    this.patient = patient;
    if (Array.isArray(time)) {
      this.effectivePeriod = {
        start: time[0],
        end: time[time.length - 1],
      };
    } else {
      this.effectiveDateTime = time;
    }
    this.type = type;
    this.dosage = {
      dose: {
        value: amount,
        unit: 'IU',
        system: 'http://unitsofmeasure.org',
        code: '[iU]',
      },
    };
    this.subject = {
      reference: `Patient/${patient}`,
    };
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
          l10n.typeOfInsulin[this.language]
        }${
          l10n[this.type][this.language]
        }<br />${
          l10n.code[this.language]
        }${
          coding[this.type].map((c) => `${
            c.system === 'http://snomed.info/sct' ? 'SNOMED ' : ''
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
        this.dosage
          ? `<br />${
            l10n.dose[this.language]
          }${
            this.dosage.dose.value
          } ${
            this.dosage.dose.unit
          }${
            this.dosage.rateRatio
              ? ` (${
                this.dosage.rateRatio.numerator.comparator || ''
              }${
                this.dosage.rateRatio.numerator.value || ''
              } ${
                this.dosage.rateRatio.numerator.unit || ''
              }/${
                this.dosage.rateRatio.denominator.comparator || ''
              }${
                (this.dosage.rateRatio.denominator.value
                && (this.dosage.rateRatio.denominator.value !== 1))
                  ? `${this.dosage.rateRatio.denominator.value} `
                  : ''
              }${
                this.dosage.rateRatio.denominator.unit || ''
              })`
              : ''
          }${this.dosage.rateQuantity
            ? ` (${
              this.dosage.rateQuantity.comparator || ''
            }${
              this.dosage.rateQuantity.value
            }${
              this.dosage.rateQuantity.unit
                ? ` ${this.dosage.rateQuantity.unit}`
                : ''
            })`
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
      // Comment out properties that need to be stripped off for restrictive profile (Kanta PHR)
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
      // definition,
      // instantiates
      // partOf,
      status = 'completed',
      // statusReason,
      // category,
      medicationCodeableConcept,
      medicationReference,
      subject,
      // context,
      // supportingInformation,
      effectiveDateTime,
      effectivePeriod,
      performer,
      // notGiven,
      // reasonNotGiven,
      // reasonCode,
      // reasonReference,
      // prescription,
      // request,
      // device,
      note,
      dosage,
      // eventHistory,
    } = this;

    return {
      resourceType,
      id,
      meta: {
        profile: ['http://phr.kanta.fi/StructureDefinition/fiphr-sd-insulindosing-stu3'],
        ...meta,
      },
      implicitRules,
      language,
      text,
      contained,
      extension,
      modifierExtension,
      identifier,
      // definition,
      // instantiates
      // partOf,
      status,
      // statusReason,
      // category,
      medicationCodeableConcept,
      medicationReference,
      subject,
      // context,
      // supportingInformation,
      effectiveDateTime,
      effectivePeriod,
      performer,
      // notGiven,
      // reasonNotGiven,
      // reasonCode,
      // reasonReference,
      // prescription,
      // request,
      // device,
      note,
      dosage: {
        text: `${l10n[this.type][language]} ${dosage.dose.value} ${dosage.dose.unit}`,
        ...dosage,
      },
      // eventHistory,
    };
  }
}
