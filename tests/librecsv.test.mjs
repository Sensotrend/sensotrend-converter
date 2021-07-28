import fs from 'fs';
import readline from 'readline';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'chai/register-should.js';
import { v4 as uuidv4 } from 'uuid';
import unzipper from 'unzipper';

import makeLogger from '../env.mjs';
import { DefaultConversionService } from '../src/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = makeLogger();
const DataFormatConverter = DefaultConversionService(logger);

async function openCSVTestFile2() {
  let lineArray = [];
  const unzipFile = path.join(__dirname, 'testTemplates', 'demoMaterial.zip');
  if (!fs.existsSync(unzipFile)) {
    throw new Error('File is not exists');
  }

  const directory = await unzipper.Open.file(unzipFile);

  const rl = readline.createInterface({
    input: directory.files[0].stream(),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    switch (line) {
      case '[':
        break;
      case ']':
        break;
      default:
        lineArray.push(JSON.parse(line.replace(/[,]$/g, '')));
    }
  }

  return lineArray;
}

async function convertFiphr(input, options) {
  return DataFormatConverter.convert(input, options);
}

async function recordShouldHaveKeys(records) {
  for (let index = 0; index < records.length; index++) {
    records[index].should.to.have.any.keys(
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

async function recordsShouldHandler(records) {
  let spliceShould = [];
  while (records.length !== 0) {
    spliceShould.push(records.splice(0, 1000).map((data) => recordShouldHaveKeys(data)));
  }
  return await Promise.all(spliceShould);
}

describe('Convert libreCsv to fiphr ', function () {
  const options = {
    source: 'libreCsv',
    target: 'fiphr',
    FHIR_userid: uuidv4(),
    csvGenerator: true,
  };

  before(async () => {});

  it('Start first test', async () => {
    logger.info('Start');
    const linesFromTestFiles = await openCSVTestFile2();
    logger.info('Ready');

    logger.info('Create convert function');
    const convertRecords = linesFromTestFiles.map((record) => convertFiphr(record, options));

    logger.info('End Create convert function');

    logger.info('Start convert!');
    const convertFiphrResults = await Promise.all(convertRecords);
    logger.info('End convert!');

    logger.info('Add test function');
    const testData = convertFiphrResults.map((element) => recordsShouldHandler(element));
    logger.info('End add test function');

    logger.info('start testing!');
    await Promise.all(testData);
    logger.info('start testing2!');
  });
});
