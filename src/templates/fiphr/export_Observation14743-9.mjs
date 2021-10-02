export const observation147439Group = {
  observation147439: function () {
    return {
      time: `${this._ISODate}`,
      timezoneOffset: `${this._timezoneOffset}`,
      conversionOffset: 0,
      deviceTime: `${this._ISODate}`,
      deviceId: `${this.deviceId}`,
      type: 'smbg',
      value: this.valueQuantity.value,
      units: `${this.valueQuantity.unit}`,
      guid: `${this.id}`,
    };
  },
};
