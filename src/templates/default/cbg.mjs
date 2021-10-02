export const cbgDefault = {
  cbg: function () {
    return {
      resourceType: 'Observation',
      meta: {
        profile: [
          'http://phr.kanta.fi/StructureDefinition/fiphr-bloodglucose-stu3-modified20190128',
        ],
      },
      language: 'en',
      text: {
        status: 'extensions',
        div: `<div xmlns="http://www.w3.org/1999/xhtml">Code: Home glucose sensor reading<br />Time: ${this.time_fhir} <br />Device: ${this.deviceId} (via Sensotrend Connect)<br />Result: ${this.valueMmol} mmol/l</div>`,
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
            display: '14745-4 Glucose [Moles/volume] in Body fluid',
          },
        ],
      },
      subject: {
        reference: `Patient/${this.patientId}`,
      },
      effectiveDateTime: `${this.time_fhir}`,
      issued: `${this.time_fhir}`,
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
