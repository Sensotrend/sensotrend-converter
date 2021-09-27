import { readFile } from 'fs/promises';

export default async function getLocallyJSONFile(fileNameAndPath) {
  try {
    return await readFile(fileNameAndPath);
  } catch (err) {
    throw new Error(`Can't reading file: ${fileNameAndPath}`);
  }
}
