import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import getLocallyJSONFile from '../../tools/readJSONFileLocally.mjs';

//Fhir export and import template
class FhirTemplateMotor {
  constructor() {
    if (!FhirTemplateMotor.instance) {
      this.templates = new Map();
      this.templates.set(
        'export_MedicationAdministrationA10AC',
        getLocallyJSONFile(path.join(__dirname, '/export_MedicationAdministrationA10AC.json'))
      );
      this.templates.set(
        'export_MedicationAdministrationins-short-fast',
        getLocallyJSONFile(
          path.join(__dirname, '/export_MedicationAdministrationins-short-fast.json')
        )
      );
      this.templates.set(
        'export_MedicationAdministrations-intermediate-long',
        getLocallyJSONFile(
          path.join(__dirname, '/export_MedicationAdministrations-intermediate-long.json')
        )
      );
      this.templates.set(
        'export_Observation14743-9',
        getLocallyJSONFile(path.join(__dirname, '/export_Observation14743-9.json'))
      );
      this.templates.set(
        'export_Observation14745-4',
        getLocallyJSONFile(path.join(__dirname, '/export_Observation14745-4.json'))
      );
      this.templates.set(
        'export_Observation9059-7',
        getLocallyJSONFile(path.join(__dirname, '/export_Observation9059-7.json'))
      );
      this.templates.set(
        'import_bolus',
        getLocallyJSONFile(path.join(__dirname, '/import_bolus.json'))
      );
      this.templates.set(
        'import_carbs',
        getLocallyJSONFile(path.join(__dirname, '/import_carbs.json'))
      );
      this.templates.set(
        'import_cbg',
        getLocallyJSONFile(path.join(__dirname, '/import_cbg.json'))
      );
      this.templates.set(
        'import_long',
        getLocallyJSONFile(path.join(__dirname, '/import_long.json'))
      );
      this.templates.set(
        'import_smbg',
        getLocallyJSONFile(path.join(__dirname, '/import_smbg.json'))
      );

      FhirTemplateMotor.instance = this;
    }

    return FhirTemplateMotor.instance;
  }

  getDefaultTemplate(type) {
    return this.templates.get(type);
  }
}

const fhirTemplateMotor = new FhirTemplateMotor();

Object.freeze(fhirTemplateMotor);

export default fhirTemplateMotor;
