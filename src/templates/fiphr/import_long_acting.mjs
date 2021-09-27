export const longActingGroup = {
  long_acting: function () {
    return {
      resourceType: 'MedicationAdministration',
      meta: {
        profile: ['http://phr.kanta.fi/StructureDefinition/fiphr-sd-insulindosing-stu3'],
      },
      language: 'fi',
      text: {
        status: 'generated',
        div: `<div xmlns="http://www.w3.org/1999/xhtml">Koodi: Pitkävaikutteinen insuliini (ins-short-fast)<br />Aika: ${this.formattedDate}<br />Annos: ${this.insulin} IU<br />Laite: ${this.deviceId} (via ${this._converter})</div>`,
      },
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: `urn:uuid:${this.guid}`,
        },
      ],
      status: 'completed',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://phr.kanta.fi/CodeSystem/fiphr-cs-insulincode',
            code: 'ins-intermediate-long',
            display: 'Pitkävaikutteinen insuliini',
          },
        ],
        text: 'Pitkävaikutteinen insuliini',
      },
      subject: {
        reference: `Patient/${this.patientId}`,
      },
      effectiveDateTime: `${this.time_fhir}`,
      performer: [
        {
          actor: {
            reference: `Patient/${this.patientId}`,
          },
        },
      ],
      dosage: {
        text: `Pitkävaikutteinen insuliini, ${this.insulin} yksikköä`,
        dose: {
          value: this.insulin,
          unit: 'IU',
          system: 'http://unitsofmeasure.org',
          code: '[iU]',
        },
      },
    };
  },
};
