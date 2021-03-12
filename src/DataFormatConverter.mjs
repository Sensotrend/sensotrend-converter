/* eslint-disable no-unused-vars */
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import NodeCache from 'node-cache';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    this.cache = new NodeCache();
    this.templateDirectory = __dirname;
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
  importRecords(input, options) {
    throw new Error('Implementation for importRecords() is missing');
  }

  /**
   * Export records from the intermediate Tidepool format to the format supported by
   * this converter
   * @param {Array} input Array of input objects
   * @param {Object} options Options for converting the data
   */
  exportRecords(input, options) {
    throw new Error('Implementation for exportRecords() is missing');
  }

  /**
   * Implementations of a DataFormatConverter that use loadTemplate() MUST
   * implement this function and return the directory that contains the
   * template files as a result (possibly __dirname)
   */
  templatePath() {
    return path.resolve(this.templateDirectory);
  }

  /**
   * Load a stjs template file from current directory
   *
   * @param {String} objectType String identifier for data type
   */
  async loadTemplate(objectType) {
    const cached = this.cache.get(objectType);
    if (cached) {
      return cached;
    }

    let filePath = path.resolve(this.templatePath(), objectType + '.json');
    this.logger.debug('Loading template from: ' + filePath);
    let template;

    try {
      const result = fs.ensureFileSync(filePath); // will fail if file does not exist
      if (fs.pathExistsSync(filePath)) {
        template = fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      this.logger.error(
        'Data conversion error: template for object type "' + objectType + '" not found'
      );
      return false;
    }

    try {
      template = JSON.parse(template);
    } catch (error) {
      this.logger.error('Invalid template for object type "' + objectType + '":');
      this.logger.error(template);
      return false;
    }

    const parsed = deepFreeze(template); // Freeze the object given it's cached
    this.cache.set(objectType, parsed);

    return parsed;
  }
}
