/* eslint-disable no-unused-vars */

/**
 * Deep freeze an object
 * @param {Object} o Object to be deepfrozen
 */
function deepFreeze(o) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (
      // eslint-disable-next-line no-prototype-builtins
      o.hasOwnProperty(prop) &&
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });

  return o;
}

/**
 * Converter class that supports some specific data format
 */
export default class DataFormatConverter {
  /**
   * Logger class for the converter. If provided, the logger must provide the following
   * functions.
   *
   * @typedef {Object} Logger
   * @property {function} debug Called for debug-level logging
   * @property {function} info Called for info-level logging
   * @property {function} error Called for error-level logging
   */

  /**
   *
   * @param {Logger} [logger] Optional, used for logging. If not provided, the Javascript
   * console will be used instead.
   */
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Returns a Date object representing the record date
   * Classes that implement a DataFormatConverter MUST implement this method
   * @param {Object} record record
   */
  getRecordTime(record) {
    throw new Error('Implementation for getRecordTime() is missing');
  }

  /**
   * Import records from the format this conveter supports and output in the intermediate
   * Tidepool wire format
   * @param {Array} input Array of input objects
   * @param {Object} options Options for converting the data
   */
  async importRecords(input, options) {
    throw new Error('Implementation for importRecords() is missing');
  }

  /**
   * Export records from the intermediate Tidepool format to the format supported by
   * this converter
   * @param {Array} input Array of input objects
   * @param {Object} options Options for converting the data
   */
  async exportRecords(input, options) {
    throw new Error('Implementation for exportRecords() is missing');
  }
}
