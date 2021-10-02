export const observation147454Group = {
  observation147454: function () {
    return {
      time: `${this._ISODate}`,
      timezoneOffset: `${this._timezoneOffset}`,
      conversionOffset: 0,
      deviceTime: `${this._ISODate}`,
      deviceId: `${this.deviceId}`,
      type: 'cbg',
      value: `${this.valueQuantity.value}`,
      units: `${this.valueQuantity.unit}`,
      guid: `${this.id}`,

      delta: this._deltammol ? `${this._deltammol}` : undefined,
      direction: this.direction ? `${this.direction}` : undefined,
      noise: this.noise ? `${this.noise}` : undefined,
    };
  },
};
