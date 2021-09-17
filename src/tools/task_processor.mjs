import { parentPort } from 'worker_threads';
import FiphrConvert from './fiphr_convert.mjs';

const fiphrConvert = new FiphrConvert();

parentPort.on('message', async (task) => {
  console.log(`This is workerData from : ${task}`);

  const record = task.splitRecord.map(async (record) => {
    await fiphrConvert.convertRecord(record, task.FHIR_userid);
  });

  //const result = '324234';
  parentPort.postMessage(record);
});
