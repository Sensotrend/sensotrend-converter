export const exportCbgGroup = {
  cbg: function () {
    return {
      _id: `${this.guid}`,
      device: `${this.deviceId}`,
      date: `${this._timestamp}`,
      dateString: `${this.time}`,
      sgv: `${this._valuemgdl}`,
      delta: 1000,
      direction: 'FortyFiveUp',
      type: 'sgv',
      sysTime: `${this.time}`,
    };
  },
};
