import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import unzipper from 'unzipper';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function unzipFile() {
  const zippedPathFile = path.join(__dirname, '..', 'tests', 'testTemplates', 'demoMaterial.zip');
  const zipToUnzipFile = path.join(
    __dirname,
    '..',
    'tests',
    'testTemplates',
    'UnzipDemoMaterial.json'
  );

  async function openCsvTestFile() {
    if (!fs.existsSync(zippedPathFile)) {
      throw new Error('File is not exists');
    }
    const directory = await unzipper.Open.file(zippedPathFile);
    return new Promise((resolve, reject) => {
      directory.files[0]
        .stream()
        .pipe(
          fs.createWriteStream(zipToUnzipFile, {
            encoding: 'utf8',
            flags: 'w',
          })
        )
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    openCsvTestFile()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function main() {
  try {
    await unzipFile();
  } catch (err) {
    console.error(`Error when try to unzip file: ${err}`);
  }
  process.exit(0);
}

main();
