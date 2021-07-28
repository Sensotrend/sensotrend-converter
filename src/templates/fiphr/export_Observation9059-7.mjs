export const observation90597Group = {
  observation90597: function () {
    return {
      time: `${this._ISODate}`,
      timezoneOffset: `${this._timezoneOffset}`,
      deviceTime: `${this._ISODate}`,
      deviceId: `${this.deviceId}`,
      type: 'wizard',
      carbInput: this.valueQuantity.value,
      guid: `${this.id}`,
    };
  },
};
