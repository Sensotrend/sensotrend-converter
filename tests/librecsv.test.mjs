import fs from 'fs';
import readline from 'readline';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import unzipper from 'unzipper';
import { should } from 'chai'; // Using Should style

import makeLogger from '../env.mjs';
import { DefaultConversionService } from '../src/index.mjs';

should();

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

function recordShouldHaveKeys(record) {
  record.should.include.any.keys(
    'category',
    'code',
    'dosage',
    'effectiveDateTime',
    'identifier',
    'issued',
    'language',
    'medicationCodeableConcept',
    'meta',
    'performer',
    'resourceType',
    'status',
    'subject',
    'text',
    'valueQuantity'
  );
}

describe('Convert libreCsv to fiphr ', function () {
  const options = {
    source: 'libreCsv',
    target: 'fiphr',
    FHIR_userid: uuidv4(),
    csvGenerator: true,
  };

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

    logger.info('Test keys');
    convertFiphrResults
      .flatMap((n) => n.flat())
      .forEach((element) => recordShouldHaveKeys(element));
    logger.info('End test keys');
  });
});
