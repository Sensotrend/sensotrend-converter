import * as _ConversionService from './ConversionService.js';
import { NightscoutDataProcessor } from './templates/nightscout/index.js';
import { FIPHRDataProcessor } from './templates/fiphr/index.js';
import { TidepoolDataProcessor } from './templates/tidepool/index.js';

const __ConversionService = _ConversionService.ConversionService;

export {__ConversionService as ConversionService};

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
 * Instantiate the data converted with the detaulf converters supplied with the
 * library.
 * 
 * @param {Logger} [logger] Used for logging. If not supplied, logging is output to the Javascript console
 */
export function DefaultConversionService (logger) {
  const DataConverter = new __ConversionService(logger);
  DataConverter.registerFormatProcessor('nightscout', NightscoutDataProcessor);
  DataConverter.registerFormatProcessor('fiphr', FIPHRDataProcessor);
  DataConverter.registerFormatProcessor('tidepool', TidepoolDataProcessor);
  return DataConverter;
}
