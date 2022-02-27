import InsulinAdministration, { shortActing, longActing } from './src/InsulinAdministration.js';
import Observation, {
  carbsEst, sgvMgdl, sgvMmol, smbgMgdl, smbgMmol,
} from './src/Observation.js';

const dose1 = new InsulinAdministration('FooPatient', new Date().toISOString(), shortActing, 5.0);

const dose2 = new InsulinAdministration('FooPatient', new Date().toISOString(), longActing, 6);
dose2.language = 'de';
dose2.device = {
  display: 'Manufacturer InsulinPump 1234456774 (via Sensotrend Connect)',
};

const dose3 = new InsulinAdministration('FooPatient', [new Date(2022, 1, 26, 20, 0, 0).toISOString(), new Date(2022, 1, 26, 22, 0, 0).toISOString()], shortActing, 1.37);
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

console.log(JSON.stringify({ dose1, dose2, dose3 }));

const carbs = new Observation('BooFatient', new Date(), carbsEst, 60);

const cgm1 = new Observation('BooFatient', new Date(), sgvMgdl, 121);

const cgm2 = new Observation('BooFatient', new Date(), sgvMmol, 5.6);

const smbg1 = new Observation('BooFatient', new Date(), smbgMgdl, 85);

const smbg2 = new Observation('BooFatient', new Date(), smbgMmol, 8.1);

console.log(JSON.stringify({
  carbs, cgm1, cgm2, smbg1, smbg2,
}));
