import _ConversionService from './ConversionService.mjs';
import { NightscoutDataProcessor } from './templates/nightscout/index.mjs';
import { FIPHRDataProcessor } from './templates/fiphr/index.mjs';
import { TidepoolDataProcessor } from './templates/tidepool/index.mjs';
import { LibreCsvDataProcessor } from './templates/librecsv/index.mjs';

import fhirTemplateMotor from './templates/fiphr/templateMotor.mjs';
import nightScoutTemplateMotor from './templates/nightscout/templateMotor.mjs';

const __ConversionService = _ConversionService;

export { __ConversionService as ConversionService };

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
 * Instantiate the data converted with the default converters supplied with the
 * library.
 *
 * @param {Logger} [logger] Used for logging. If not supplied, logging is output to the Javascript console
 */
export function DefaultConversionService(logger) {
  const DataConverter = new __ConversionService(logger);
  DataConverter.registerFormatProcessor(
    'nightscout',
    NightscoutDataProcessor,
    nightScoutTemplateMotor
  );
  DataConverter.registerFormatProcessor('fiphr', FIPHRDataProcessor, fhirTemplateMotor);
  DataConverter.registerFormatProcessor('tidepool', TidepoolDataProcessor, undefined);
  DataConverter.registerFormatProcessor('libreCsv', LibreCsvDataProcessor, undefined);
  return DataConverter;
}
