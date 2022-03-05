import { createRequire } from 'module';

import InsulinAdministration from './src/InsulinAdministration.js';
import Observation from './src/Observation.js';

const require = createRequire(import.meta.url);
const data = require('./data.json');

// const patient = 'fd1cc196-7fe5-42eb-ab7c-b4b1225a33db'; // KantaPHR sandbox
const patient = '2821934'; // HAPI FHIR

const bundle = {
  resourceType: "Bundle",
  type: "batch",
  entry: [],
};

data.forEach((d) => {
  switch(d.type) {
    case 'basal':
    case 'bolus':
      // Todo: handle more complex bolus types like extended and square wave
      bundle.entry.push(new InsulinAdministration(patient, d));
      break;
    case 'cbg':
    case 'smbg':
    case 'wizard':
      bundle.entry.push(new Observation(patient, d));
      break;
    case 'deviceEvent':
      // ignore for now...
      break;
    default:
      console.log(`Unhandled type ${d.type}`, d);
  }
});

console.log(JSON.stringify(bundle, null, 2));


