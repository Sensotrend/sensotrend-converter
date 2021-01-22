import { Writable } from 'stream';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import unzipper from 'unzipper';
import 'chai/register-should.js';
import { v4 as uuidv4 } from 'uuid';

import makeLogger from '../env.mjs';
import { DefaultConversionService } from '../src/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
let data = '';

const logger = makeLogger();
const DataFormatConverter = DefaultConversionService(logger);

const testStream = new Writable({
  writableObjectMode: true,

  write(chunk, encoding, callback) {
    data += chunk.toString('utf8');
    callback();
  },
});

async function openCsvTestFile() {
  const directory = await unzipper.Open.file(
    path.join(__dirname, 'testTemplates', 'demoMaterial.zip')
  );
  return new Promise((resolve, reject) => {
    directory.files[0].stream().pipe(testStream).on('error', reject).on('finish', resolve);
  });
}

describe('Convert libreCsv to fiphr ', function () {
  const options = {
    source: 'libreCsv',
    target: 'fiphr',
    FHIR_userid: uuidv4(),
    csvGenerator: true,
  };

  before(async () => {
    await openCsvTestFile();
  });

  it('Start first test', async () => {
    const payloads = JSON.parse(data);

    const records = await DataFormatConverter.convert(payloads, options);

    console.log(records);
  });
});
