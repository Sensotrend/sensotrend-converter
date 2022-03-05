import { createRequire } from 'module';
import fs from 'fs';
import http from 'http';

import InsulinAdministration from './src/InsulinAdministration.js';
import Observation from './src/Observation.js';

/*
 * RUN THIS TEST AS: 
 * > node test.js > resultBundle.json
 */

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
  let resource;
  switch(d.type) {
    case 'basal':
    case 'bolus':
      // Todo: handle more complex bolus types like extended and square wave
      resource = new InsulinAdministration(patient, d);
      break;
    case 'cbg':
    case 'smbg':
    case 'wizard':
      resource = new Observation(patient, d);
      break;
    case 'deviceEvent':
      // ignore for now...
      return;
    default:
      console.error(`Unhandled type ${d.type}`, d);
      return;
  }
  bundle.entry.push({
    resource,
    request: {
      url: `${resource.resourceType}/`,
      method: 'POST',
      ifNoneExist: 'identifier=' + resource.identifier[0]?.value,
    },
  });
});

try {
  fs.writeFileSync('./bundle.json', JSON.stringify(bundle, null, 2));
} catch (err) {
  console.error(err)
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
  const isBatchBundle = (e.resourceType === 'Bundle') && (e.type === 'batch');
  const request = http.request({
    ...postOptions,
    path: `${postOptions.path}/${
      isBatchBundle
      ? '' // Post batch Bundles to the root.
      : e.resourceType
    }`,
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
            if (isBatchBundle) {
              // TODO: diff with the sent bundle
              console.log(JSON.stringify(stored, null, 2));
            } else {
              const jsonied = JSON.parse(JSON.stringify(e));
              Object.keys(jsonied).forEach((k) => {
                if (stored[k] === undefined) {
                  console.error('Not stored', { [k]: e[k] }, mimeType);
                }
              });
            }
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

postEntry(bundle);

// bundle.entry.forEach((e) => postEntry(e.resource));

bundle.entry.forEach((e) => {
  const { resource } = e;
  const keys = [
    ...Object.keys(resource),
    ...(resource.code?.coding || []).map(c => `code ${c.code || c.display || JSON.stringify(c)}`),
    ...Object.keys(e.dosage || {})
  ].join();
  if (!postedKeys[keys]) {
    postEntry(resource);
    postedKeys[keys] = true;
  }
});

console.error('Posted keys', postedKeys);
