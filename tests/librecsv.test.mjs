import fs from 'fs';
import readline from 'readline';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'chai/register-should.js';
import { v4 as uuidv4 } from 'uuid';

import makeLogger from '../env.mjs';
import { DefaultConversionService } from '../src/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = makeLogger();
const DataFormatConverter = DefaultConversionService(logger);

async function* openCsvTestFile() {
  const unzipFile = path.join(__dirname, 'testTemplates', 'UnzipDemoMaterial.json');
  if (!fs.existsSync(unzipFile)) {
    throw new Error('File is not exists');
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(unzipFile),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    switch (line) {
      case '[':
        break;
      case ']':
        break;
      default:
        yield JSON.parse(line.replace(/[,]$/g, ''));
    }
  }
}

describe('Convert libreCsv to fiphr ', function () {
  const options = {
    source: 'libreCsv',
    target: 'fiphr',
    FHIR_userid: uuidv4(),
    csvGenerator: true,
  };

  let generator;
  let calculate = 0;

  before(async () => {
    try {
      generator = await openCsvTestFile();
    } catch (err) {
      console.log(err);
    }
  });

  it('Start first test', async () => {
    for await (const payloads of generator) {
      if (payloads.length > 0) {
        const records = await DataFormatConverter.convert(payloads, options);
        calculate += records.length;
        logger.info(`Calculated how many records handled: ${calculate.toString()}\r\n`);
        for (const recordValidation of records) {
          logger.info(`Record from converter: ${JSON.stringify(recordValidation)}\r\n`);
          recordValidation.should.to.have.any.keys(
            'dosage',
            'resourceType',
            'meta',
            'language',
            'text',
            'identifier',
            'status',
            'category',
            'code',
            'subject',
            'effectiveDateTime',
            'issued',
            'performer',
            'valueQuantity',
            'medicationCodeableConcept'
          );
        }
      }
    }
  });
});
