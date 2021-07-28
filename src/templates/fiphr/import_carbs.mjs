export const carbsGroup = {
  carbs: function () {
    return {
      resourceType: 'Observation',
      meta: {
        profile: ['http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake-stu3'],
      },
      language: 'fi',
      text: {
        status: 'generated',
        div: `<div xmlns="http://www.w3.org/1999/xhtml">Koodi: Arvioitu hiilihydraattimäärä (LOINC 9059-7)<br />Aika: ${this.formattedDate}<br />Arvioitu hiilihydraattimäärä: ${this.carbInput} g<br />Laite: ${this.deviceId} (via ${this._converter})</div>`,
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
              system: 'http://phr.kanta.fi/CodeSystem/fiphr-cs-observationcategory',
              code: 'nutrition',
              display: 'Ravitsemus',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '9059-7',
            display: 'Arvioitu hiilihydraattimäärä',
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
        value: this.carbInput,
        unit: 'g',
        system: 'http://unitsofmeasure.org',
        code: 'g',
      },
    };
  },
};
