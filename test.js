import { createRequire } from 'module';
import fs from 'fs';
import http from 'http';

import InsulinAdministration from './src/InsulinAdministration.js';
import Observation from './src/Observation.js';
import { stringify } from 'querystring';

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
      console.error(`Unhandled type ${d.type}`, d);
  }
});

try {
  fs.writeFileSync('./bundle.json', JSON.stringify(bundle, null, 2));
} catch (err) {
  console.error(err)
}

// console.log(JSON.stringify(bundle, null, 2));

/*
const hapiUISafeBundle = {
  ...bundle,
  entry: [],
};

for (let i = 0; i < bundle.entry.length; i += 1) {
  const e = bundle.entry[i];
  if ((JSON.stringify(hapiUISafeBundle).length + JSON.stringify(e).length) > 5000) {
    // HAPI UI has a limit of 200000 bytes for form data length
    // We leave some space for other form data and encoding
    break;
  }
  hapiUISafeBundle.entry.push(e);
}

console.log(JSON.stringify(hapiUISafeBundle));
*/

const hapiSafeBundle = {
  ...bundle,
  entry: [],
};

for (let i = 0; i < bundle.entry.length; i += 1) {
  const e = bundle.entry[i];
  if ((JSON.stringify(hapiSafeBundle).length + JSON.stringify(e).length) > 150000) {
    // HAPI UI has a limit of 200000 bytes for form data length
    // We leave some space for other form data and encoding
    break;
  }
  hapiSafeBundle.entry.push(JSON.parse(JSON.stringify(e)));
}

const postOptions = {
  host: 'hapi.fhir.org',
  port: '80',
  path: '/baseR4',
  method: 'POST',
  headers: {
    'Content-Type': 'application/fhir+json',
  },
};

function postEntry(e) {
  let responseChunks = [];
  const request = http.request({
    ...postOptions,
    path: `${postOptions.path}/${e.resourceType}`,
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      responseChunks.push(chunk);
    });
    res.on('error', function(chunk) {
      console.error('Error: ' + chunk);
    });
    res.on('end', function() {
      const resBody = responseChunks.join('');
      const contentType = res.headers['content-type'];
      const mimeType = contentType.substring(0, contentType.indexOf(';'));
      switch(mimeType) {
        case 'application/json':
        case 'application/fhir+json':
            const stored = JSON.parse(resBody);
            const jsonied = JSON.parse(JSON.stringify(e));
            Object.keys(jsonied).forEach((k) => {
              if (stored[k] === undefined) {
                console.error('Not stored', { [k]: e[k] }, mimeType);
              }
            });
          break;
        default:
          console.error('Not parsing', contentType, resBody);
      }
    });
  });
  // post the data
  request.write(JSON.stringify(e));
  request.on('error', function(error) {
    console.error('Request error', error);
  });
  request.end();
}

const postedKeys = {};

// bundle.entry.forEach(postEntry);

bundle.entry.forEach((e) => {
  const keys = [
    ...Object.keys(e),
    ...(e.code?.coding || []).map(c => `code ${c.code || c.display || JSON.stringify(c)}`),
    ...Object.keys(e.dosage || {})
  ].join();
  if (!postedKeys[keys]) {
    postEntry(e);
    postedKeys[keys] = true;
  }
});

console.error('Posted keys', postedKeys);
