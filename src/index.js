import * as _DataFormatConverter from './DataFormatConverter';
import { NightscoutDataProcessor } from './templates/nightscout';
import { FIPHRDataProcessor } from './templates/fiphr';
import { TidepoolDataProcessor } from './templates/tidepool';

const __DataFormatConverter = _DataFormatConverter.DataFormatConverter;

export {__DataFormatConverter as DataFormatConverter};

export function DefaultConverter (logger) {
  const DataConverter = new __DataFormatConverter(logger);
  DataConverter.registerFormatProcessor('nightscout', NightscoutDataProcessor);
  DataConverter.registerFormatProcessor('fiphr', FIPHRDataProcessor);
  DataConverter.registerFormatProcessor('tidepool', TidepoolDataProcessor);
  return DataConverter;
}
