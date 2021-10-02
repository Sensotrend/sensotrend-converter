export const medicationAdministrationinsShortFastGroup = {
  medicationAdministrationInsShortFast: function () {
    return {
      time: `${this._ISODate}`,
      timezoneOffset: `${this._timezoneOffset}`,
      deviceTime: `${this._ISODate}`,
      deviceId: `${this.deviceId}`,
      type: 'bolus',
      subType: 'normal',
      insulin: this.dosage.dose.value,
      normal: this.dosage.dose.value,
      guid: `${this.id}`,
    };
  },
};
