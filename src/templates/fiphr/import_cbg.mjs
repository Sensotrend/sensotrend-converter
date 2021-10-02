export const cbgGroup = {
  cbg: function () {
    return {
      resourceType: 'Observation',
      meta: {
        profile: ['http://phr.kanta.fi/StructureDefinition/fiphr-bloodglucose-stu3'],
      },
      language: 'fi',
      text: {
        status: 'extensions',
        div: `<div xmlns="http://www.w3.org/1999/xhtml">Koodi: Kudossokeri (LOINC 14745-4)<br />${this._statusMessage}<br /><br />MeasurementStyle: ${this.scanOrHistoricInfo}</div>`,
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
            code: '14745-4',
            display: 'Kudossokeri',
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
