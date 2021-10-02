export const smbgGroup = {
  smbg: function () {
    return {
      resourceType: 'Observation',
      meta: {
        profile: ['http://phr.kanta.fi/StructureDefinition/fiphr-bloodglucose-stu3'],
      },
      language: 'fi',
      text: {
        status: 'extensions',
        div: `<div xmlns="http://www.w3.org/1999/xhtml">Koodi: Verensokeri verensokerimittarilla (LOINC 14743-9)<br />Verensokeri (LOINC 15074-8)<br />Laite: ${this.deviceId} (via ${this._converter})<br />Aika: ${this.formattedDate}<br />Tulos: ${this.valueMmol} mmol/l</div>`,
      },
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: `urn:uuid:${this.guid}`,
        },
      ],
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/observation-category',
              code: 'vital-signs',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '14743-9',
            display: 'Verensokeri verensokerimittarilla',
          },
          {
            system: 'http://loinc.org',
            code: '15074-8',
            display: 'Verensokeri',
          },
        ],
      },
      subject: {
        reference: `Patient/${this.patientId}`,
      },
      effectiveDateTime: `${this.time_fhir}`,
      issued: `${this.issued}`,
      performer: [
        {
          reference: `Patient/${this.patientId}`,
        },
      ],
      valueQuantity: {
        value: this.valueMmol,
        unit: 'mmol/l',
        system: 'http://unitsofmeasure.org',
        code: 'mmol/L',
      },
    };
  },
};
