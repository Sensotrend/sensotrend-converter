import InsulinAdministration, { shortActing, longActing } from './src/InsulinAdministration.js';
import Observation, {
  carbsEst, sgvMgdl, sgvMmol, smbgMgdl, smbgMmol,
} from './src/Observation.js';

// const patient = 'fd1cc196-7fe5-42eb-ab7c-b4b1225a33db'; // KantaPHR sandbox
const patient = '2821934'; // HAPI FHIR
const pump = {
  display: 'Medtronic 780G GA12345678 (via Sensotrend Connect)',
};
const cgm = {
  display: 'Abbott Freestyle Libre 34986735693 (via Sensotrend Connect)',
};
const glucometer = {
  display: 'Roche Accu-Chek Instant 098346365 (via Sensotrend Connect)',
};


const dose1 = new InsulinAdministration(patient, new Date().toISOString(), shortActing, 5.0);
dose1.device = pump;

const dose2 = new InsulinAdministration(patient, new Date().toISOString(), longActing, 6);
dose2.language = 'de';

const dose3 = new InsulinAdministration(patient, [new Date(2022, 1, 26, 20, 0, 0).toISOString(), new Date(2022, 1, 26, 22, 0, 0).toISOString()], shortActing, 1.37);
dose3.language = 'en';
dose3.dosage.rateRatio = {
  numerator: {
    value: 0.685,
    unit: 'IU',
    system: 'http://unitsofmeasure.org',
    code: '[iU]',
  },
  denominator: {
    // value: 1,
    unit: 'h',
    system: 'http://unitsofmeasure.org',
    code: 'h',
  },
};
dose3.device = pump;

const carbs = new Observation(patient, new Date(), carbsEst, 60);
carbs.device = pump;

const cgm1 = new Observation(patient, new Date(), sgvMgdl, 121);
cgm1.device = cgm;

const cgm2 = new Observation(patient, new Date(), sgvMmol, 5.6);
cgm2.device = cgm;

const smbg1 = new Observation(patient, new Date(), smbgMgdl, 85);
smbg1.device = glucometer;

const smbg2 = new Observation(patient, new Date(), smbgMmol, 8.1);
smbg2.device = glucometer;

console.log(JSON.stringify({
  dose1, dose2, dose3, carbs, cgm1, cgm2, smbg1, smbg2,
}));
