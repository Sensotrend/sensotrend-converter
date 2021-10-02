export const exportSmbgGroup = {
  smbg: function () {
    return {
      _id: `${this.id}`,
      device: `${this.deviceId}`,
      date: `${this._timestamp}`,
      dateString: `${this.effectiveDateTime}`,
      sgv: `${this._valuemgdl}`,
      delta: 1000,
      direction: 'FortyFiveUp',
      type: 'mbg',
      sysTime: `${this.effectiveDateTime}`,
    };
  },
};
