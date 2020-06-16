import {
   ConversionService
} from '../src/ConversionService';
import {
   NightscoutDataProcessor
} from '../src/templates/nightscout';
import {
   FIPHRDataProcessor
} from '../src/templates/fiphr';
import {
   TidepoolDataProcessor
} from '../src/templates/tidepool';

import should from 'should';

const logger = {};
logger.info = console.log;
logger.error = console.error;
logger.debug = console.log;

const DataConverter = new ConversionService(logger);

DataConverter.registerFormatProcessor('nightscout', NightscoutDataProcessor);
DataConverter.registerFormatProcessor('fiphr', FIPHRDataProcessor);
DataConverter.registerFormatProcessor('tidepool', TidepoolDataProcessor);

describe('Data conversion service', function () {
/*
   Content:   
   - Tidepool bolus record to FIPHR and back
   - skip old records when requested
   - know record formats and time
   - Nightscout CGM record to FIPHR and back
   - Nightscout CGM record to FIPHR and back without a data type hint
   - Nightscout CGM record to FIPHR and back and not add fields
   - Nightscout bolus wizard record (bolus + carbs) to FIPHR and back
   - FIPHR data (carbs) to Tidepool and back
   - Nightscout data (CGM) to Tidepool and back

   Missing(?):
   - CGM record from Tidebool to FHIR and back
   - Carbs from Tidebool to Nightscout and back
   - Bolus records
   - Insulin injections
   - Blood glucose measurements from fingerstick
   - Special cases, like Lo and Hi in CGM
*/

   let sample_logging = false;

   it('should convert Tidepool bolus record to FIPHR and back', async function () {

      let tidepool_sample = [{
         "time": "2019-01-26T18:49:35.000Z",
         "timezoneOffset": 120,
         "clockDriftOffset": -3000,
         "conversionOffset": 0,
         "deviceTime": "2019-01-26T20:49:35",
         "deviceId": "MedT-554-450960",
         "type": "bolus",
         "subType": "normal",
         "normal": 0.1,
         "payload": {
            "logIndices": [1541]
         }
      }];

      console.log('Converting tidepool to FHIR');

      let options = {
         source: 'tidepool',
         target: 'fiphr',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(tidepool_sample, options);

      records.length.should.equal(1);
      records[0].resourceType.should.equal("MedicationAdministration");
      records[0].language.should.equal("fi");
      records[0].status.should.equal("completed");
      records[0].medicationCodeableConcept.text.should.equal("Lyhytvaikutteinen insuliini")
      records[0].effectiveDateTime.should.equal("2019-01-26T20:49:35.000+02:00");
      records[0].dosage.text.should.equal("Lyhytvaikutteinen insuliini, 0.1 yksikköä");
      records[0].dosage.dose.value.should.equal(tidepool_sample[0].normal);
      records[0].dosage.dose.unit.should.equal("U");
      if (sample_logging) {
         console.log('Tidepool sample', tidepool_sample);
         console.log('Tidepool sample converted to FHIR resource', records);
      }

      options = {
         source: 'fiphr',
         target: 'tidepool',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2.length.should.equal(1);
      records2[0].time.should.equal(tidepool_sample[0].time);
      records2[0].timezoneOffset.should.equal(tidepool_sample[0].timezoneOffset);
      records2[0].deviceId.should.equal(tidepool_sample[0].deviceId);
      records2[0].type.should.equal(tidepool_sample[0].type);
      records2[0].subType.should.equal(tidepool_sample[0].subType);
      records2[0].insulin.should.equal(tidepool_sample[0].normal);
      records2[0].normal.should.equal(tidepool_sample[0].normal);
      if (sample_logging) {
         console.log('FHIR resource converted back to Tidepool', records2);
      }

   });

   it('should skip old records when requested', async function () {

      let tidepool_sample = [{
            "time": "2017-01-26T18:49:35.000Z",
            "timezoneOffset": 120,
            "clockDriftOffset": -3000,
            "conversionOffset": 0,
            "deviceTime": "2017-01-26T20:49:35",
            "deviceId": "MedT-554-450960",
            "type": "bolus",
            "subType": "normal",
            "normal": 0.1,
            "payload": {
               "logIndices": [1541]
            }
         },
         {
            "time": "2019-01-26T18:49:35.000Z",
            "timezoneOffset": 120,
            "clockDriftOffset": -3000,
            "conversionOffset": 0,
            "deviceTime": "2017-01-26T20:49:35",
            "deviceId": "MedT-554-450960",
            "type": "bolus",
            "subType": "normal",
            "normal": 0.1,
            "payload": {
               "logIndices": [1541]
            }
         }
      ];

      // 1st record should be skipped
      let skipData = {
         "MedT-554-450960": new Date('2018-05-03T05:09:15.000+00:00')
      };

      let options = {
         source: 'tidepool',
         target: 'fiphr',
         skipRecordsUsingDates: skipData,
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(tidepool_sample, options);
      records.length.should.equal(1);
      if (sample_logging) {
         console.log('Tidepool sample', tidepool_sample);
         console.log('Tidepool sample converted to FHIR resource (1st record should be skipped)', records);
      }

      // No records should be skipped
      let skipData2 = {
         "MedT-554-450960": new Date('2016-05-03T05:09:15.000+00:00')
      };

      let options2 = {
         source: 'tidepool',
         target: 'fiphr',
         skipRecordsUsingDates: skipData2,
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(tidepool_sample, options2);
      records2.length.should.equal(2);      
      if (sample_logging) {
         console.log('Tidepool sample converted to FHIR resource (No records should be skipped)', records2);
      }

      // Both records should be skipped
      let skipData3 = {
         "MedT-554-450960": new Date('2019-05-03T05:09:15.000+00:00')
      };

      let options3 = {
         source: 'tidepool',
         target: 'fiphr',
         skipRecordsUsingDates: skipData3,
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records3 = await DataConverter.convert(tidepool_sample, options3);
      records3.length.should.equal(0);     
      if (sample_logging) {
         console.log('Tidepool sample converted to FHIR resource (Both records should be skipped)', records3);
      }
   });


   it('know record formats and time', async function () {

      let tidepool_sample = [{
            "time": "2017-01-26T18:49:35.000Z",
            "timezoneOffset": 120,
            "clockDriftOffset": -3000,
            "conversionOffset": 0,
            "deviceTime": "2017-01-26T20:49:35",
            "deviceId": "MedT-554-450960",
            "type": "bolus",
            "subType": "normal",
            "normal": 0.1,
            "payload": {
               "logIndices": [1541]
            }
         }
      ];

      let options = {
         source: 'tidepool',
         target: 'fiphr',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(tidepool_sample, options);
      const r = records[0];
      DataConverter.getRecordFormat(r).should.equal('fiphr');
      DataConverter.getRecordSourceFormat(r).should.equal('tidepool');
      DataConverter.getRecordTime(r).getTime().should.equal(new Date(tidepool_sample[0].time).getTime());

      if (sample_logging) {
         console.log('Tidepool sample', tidepool_sample);
         console.log('Tidepool sample converted to FHIR resource', records);
      }
   });

   it('should convert Nightscout CGM record to FIPHR and back', async function () {

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2",
         "device": "xDrip-DexcomG5",
         "date": 1550143850509,
         "dateString": "2019-02-14T13:30:50.509+0200",
         "sgv": 177,
         "delta": 15,
         "direction": "FortyFiveUp",
         "type": "sgv",
         "filtered": 195071.0394182456,
         "unfiltered": 196842.65552921052,
         "rssi": 100,
         "noise": 1,
         "sysTime": "2019-02-14T13:30:50.509+0200"
      }];

      let options = {
         source: 'nightscout',
         target: 'fiphr',
         datatypehint: 'entries',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      records.length.should.equal(1);
      records[0].resourceType.should.equal("Observation");
      records[0].language.should.equal("fi");
      records[0].status.should.equal("final");
      records[0].effectiveDateTime.should.equal("2019-02-14T13:30:50.509+02:00");
      records[0].issued.should.equal("2019-02-14T13:30:50.509+02:00");
      records[0].valueQuantity.value.should.equal(9.82);
      records[0].valueQuantity.unit.should.equal("mmol/l");
      if (sample_logging) {
         console.log('Nightscout sample', ns_sample);
         console.log('Nightscout sample converted to FHIR resource', records);
      }

      options = {
         source: 'fiphr',
         target: 'nightscout',
         datatypehint: 'entries',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2.length.should.equal(1);
      records2[0].device.should.equal(ns_sample[0].device);
      records2[0].date.should.equal(ns_sample[0].date);
      records2[0].dateString.should.equal("2019-02-14T13:30:50+02:00");
      records2[0].sgv.should.equal(ns_sample[0].sgv);
      records2[0].type.should.equal(ns_sample[0].type);
      // records2[0].delta.should.equal(15);
      // records2[0].direction.should.equal('FortyFiveUp');
      // records2[0].noise.should.equal(1);
      records2[0].sysTime.should.equal("2019-02-14T13:30:50+02:00");
      if (sample_logging) {
         console.log('FHIR resource converted back to Nightscout', records2);
      }
   });

   it('should convert Nightscout CGM record to FIPHR and back without a data type hint', async function () {

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2",
         "device": "xDrip-DexcomG5",
         "date": 1550143850509,
         "dateString": "2019-02-14T13:30:50.509+0200",
         "sgv": 177,
         "delta": 15,
         "direction": "FortyFiveUp",
         "type": "sgv",
         "filtered": 195071.0394182456,
         "unfiltered": 196842.65552921052,
         "rssi": 100,
         "noise": 1,
         "sysTime": "2019-02-14T13:30:50.509+0200"
      }];

      let options = {
         source: 'nightscout',
         target: 'fiphr',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      records.length.should.equal(1);
      records[0].resourceType.should.equal("Observation");
      records[0].language.should.equal("fi");
      records[0].status.should.equal("final");
      records[0].effectiveDateTime.should.equal("2019-02-14T13:30:50.509+02:00");
      records[0].issued.should.equal("2019-02-14T13:30:50.509+02:00");
      records[0].valueQuantity.value.should.equal(9.82);
      records[0].valueQuantity.unit.should.equal("mmol/l");
      if (sample_logging) {
         console.log('Nightscout sample', ns_sample);
         console.log('Nightscout sample converted to FHIR resource', records);
      }

      options = {
         source: 'fiphr',
         target: 'nightscout',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2.length.should.equal(1);
      records2[0].device.should.equal(ns_sample[0].device);
      records2[0].date.should.equal(ns_sample[0].date);
      records2[0].dateString.should.equal("2019-02-14T13:30:50+02:00");
      records2[0].sgv.should.equal(ns_sample[0].sgv);
      records2[0].type.should.equal(ns_sample[0].type);
      // records2[0].delta.should.equal(15);
      // records2[0].direction.should.equal('FortyFiveUp');
      // records2[0].noise.should.equal(1);
      records2[0].sysTime.should.equal("2019-02-14T13:30:50+02:00");
      if (sample_logging) {
         console.log('FHIR resource converted back to Nightscout', records2);
      }
   });

   it('should convert Nightscout CGM record to FIPHR and back and not add fields', async function () {

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2",
         "device": "xDrip-DexcomG5",
         "date": 1550143850509,
         "dateString": "2019-02-14T13:30:50.509+0200",
         "sgv": 177,
         "type": "sgv",
         "sysTime": "2019-02-14T13:30:50.509+0200"
      }];

      let options = {
         source: 'nightscout',
         target: 'fiphr',
         datatypehint: 'entries',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      records.length.should.equal(1);
      records[0].resourceType.should.equal("Observation");
      records[0].language.should.equal("fi");
      records[0].status.should.equal("final");
      records[0].effectiveDateTime.should.equal("2019-02-14T13:30:50.509+02:00");
      records[0].issued.should.equal("2019-02-14T13:30:50.509+02:00");
      records[0].valueQuantity.value.should.equal(9.82);
      records[0].valueQuantity.unit.should.equal("mmol/l");
      if (sample_logging) {
         console.log('Nightscout sample', ns_sample);
         console.log('Nightscout sample converted to FHIR resource', records);
      }

      options = {
         source: 'fiphr',
         target: 'nightscout',
         datatypehint: 'entries',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2.length.should.equal(1);
      records2[0].device.should.equal(ns_sample[0].device);
      records2[0].date.should.equal(ns_sample[0].date);
      records2[0].dateString.should.equal("2019-02-14T13:30:50+02:00");
      records2[0].sgv.should.equal(ns_sample[0].sgv);
      records2[0].type.should.equal(ns_sample[0].type);
      should.not.exist(records2[0].delta);
      should.not.exist(records2[0].direction);
      should.not.exist(records2[0].noise);
      records2[0].sysTime.should.equal("2019-02-14T13:30:50+02:00");
      if (sample_logging) {
         console.log('FHIR resource converted back to Nightscout', records2);
      }
   });

   it('should convert Nightscout bolus wizard record to FIPHR and back', async function () {

      let ns_sample = [{
         "device": "MDT-554",
         "carbs": 15,
         "insulin": 1.3,
         "created_at": "2019-04-01T10:26:23+03:00",
         "eventType": "Meal Bolus"
      },{
         "timestamp": 1563525782180,
         "eventType": "<none>",
         "enteredBy": "xdrip",
         "uuid": "93038829-06da-4413-96ac-6b879be99973",
         "carbs": 15,
         "insulin": 1.3,
         "created_at": "2019-07-19T08:43:02Z",
         "sysTime": "2019-07-19T11:43:02.180+0300",
         "_id": "9303882906da441396ac6b87"
      }];

      let options = {
         source: 'nightscout',
         target: 'fiphr',
         datatypehint: 'treatments',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      records.length.should.equal(2);

      records[0].resourceType.should.equal("Observation");
      records[0].language.should.equal("fi");
      records[0].status.should.equal("final");
      records[0].effectiveDateTime.should.equal("2019-04-01T10:26:23.000+03:00");
      records[0].issued.should.equal("2019-04-01T10:26:23.000+03:00");
      records[0].valueQuantity.value.should.equal(ns_sample[0].carbs);
      records[0].valueQuantity.unit.should.equal("g");

      records[1].resourceType.should.equal("MedicationAdministration");
      records[1].language.should.equal("fi");
      records[1].status.should.equal("completed");
      records[1].effectiveDateTime.should.equal("2019-04-01T10:26:23.000+03:00");
      records[1].dosage.text.should.equal("Lyhytvaikutteinen insuliini, 1.3 yksikköä");
      if (sample_logging) {
         console.log('Nightscout sample', ns_sample);
         console.log('Nightscout sample converted to FHIR resource', records);
      }

      options = {
         source: 'fiphr',
         target: 'nightscout',
         datatypehint: 'treatments',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2.length.should.equal(2);

      records2[0].created_at.should.equal(ns_sample[0].created_at);
      records2[0].carbs.should.equal(ns_sample[0].carbs);
      records2[0].type.should.equal("Meal Bolus");

      records2[1].created_at.should.equal(ns_sample[0].created_at);
      records2[1].insulin.should.equal(ns_sample[0].insulin);
      records2[1].type.should.equal("Meal Bolus");
      if (sample_logging) {
         console.log('FHIR resource converted back to Nightscout', records2);
      }
   });

   it('should convert FIPHR data to Tidepool and back', async function () {

      let FHIRCarbEntry = {
         "resourceType": "Observation",
         "id": "1710920",
         "meta": {
            "versionId": "1",
            "lastUpdated": "2019-04-03T13:28:03.727+00:00",
            "profile": [
               "http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake-stu3"
            ]
         },
         "language": "fi",
         "text": {
            "status": "generated",
            "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Arvioitu hiilihydraattimäärä: 15 g<br/>Laite: MDT-554 (via Sensotrend Connect)</div>"
         },
         "identifier": [{
            "system": "urn:ietf:rfc:3986",
            "value": "urn:uuid:60f706c8-f821-56e5-9980-44dfd40c14e8"
         }],
         "status": "final",
         "category": [{
            "coding": [{
               "system": "http://phr.kanta.fi/CodeSystem/fiphr-cs-observationcategory",
               "code": "nutrition",
               "display": "Ravintosisältö"
            }]
         }],
         "code": {
            "coding": [{
               "system": "http://loinc.org",
               "code": "9059-7",
               "display": "Arvioitu hiilihydraattimäärä"
            }]
         },
         "subject": {
            "reference": "Patient/1710136"
         },
         "effectiveDateTime": "2019-04-01T11:21:28.000+03:00",
         "issued": "2019-04-01T11:21:28.000+03:00",
         "performer": [{
            "reference": "Patient/1710136"
         }],
         "valueQuantity": {
            "value": 15,
            "unit": "g",
            "system": "http://unitsofmeasure.org",
            "code": "g"
         }
      };


      let options = {
         source: 'fiphr',
         target: 'tidepool',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(FHIRCarbEntry, options);
 
      records.length.should.equal(1);
      records[0].time.should.equal("2019-04-01T08:21:28.000Z");
      records[0].timezoneOffset.should.equal(180);
      records[0].deviceTime.should.equal("2019-04-01T08:21:28.000Z");
      records[0].deviceId.should.equal("MDT-554");
      records[0].type.should.equal("wizard");
      records[0].carbInput.should.equal(FHIRCarbEntry.valueQuantity.value);
      if (sample_logging) {
         console.log('FHIR carb entry', FHIRCarbEntry);
         console.log('FHIR carb entry converted to Tidepool', records);
      }

      options = {
         source: 'tidepool',
         target: 'fiphr',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2.length.should.equal(1); 
      records2[0].resourceType.should.equal(FHIRCarbEntry.resourceType);
      records2[0].language.should.equal(FHIRCarbEntry.language);
      records2[0].effectiveDateTime.should.equal(FHIRCarbEntry.effectiveDateTime);
      records2[0].code.coding[0].code.should.equal("9059-7");
      records2[0].valueQuantity.value.should.equal(FHIRCarbEntry.valueQuantity.value);
      records2[0].valueQuantity.unit.should.equal(FHIRCarbEntry.valueQuantity.unit);
      if (sample_logging) {
         console.log('Tidepool record converted back to FHIR carb entry', records2);
      }

   });

   it('should convert Nightscout data to Tidepool and back', async function () {

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2",
         "device": "xDrip-DexcomG5",
         "date": 1550143850509,
         "dateString": "2019-02-14T13:30:50.509+0200",
         "sgv": 177,
         "delta": 1.5,
         "direction": "Flat",
         "type": "sgv",
         "filtered": 195071.0394182456,
         "unfiltered": 196842.65552921052,
         "rssi": 100,
         "noise": 1,
         "sysTime": "2019-02-14T13:30:50.509+0200"
      }];


      let options = {
         source: 'nightscout',
         target: 'tidepool',
         datatypehint: 'entries',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      records.length.should.equal(1);
      records[0].time.should.equal("2019-02-14T11:30:50.509Z");
      records[0].timezoneOffset.should.equal(120);
      records[0].deviceId.should.equal(ns_sample[0].device);
      records[0].type.should.equal("cbg");
      records[0].units.should.equal("mg/dL");
      records[0].value.should.equal(ns_sample[0].sgv);
      records[0].delta.should.equal(ns_sample[0].delta);
      records[0].noise.should.equal(ns_sample[0].noise);
      records[0].direction.should.equal(ns_sample[0].direction);
      if (sample_logging) {
         console.log('Nightscout sample', ns_sample);
         console.log('Nightscout sample converted to Tidepool', records);
      }

      options = {
         source: 'tidepool',
         target: 'nightscout',
         datatypehint: 'entries',
         FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);
      records2[0].device.should.equal(ns_sample[0].device);
      records2[0].date.should.equal(ns_sample[0].date);
      records2[0].sgv.should.equal(ns_sample[0].sgv);
      records2[0].delta.should.equal(ns_sample[0].delta);
      records2[0].direction.should.equal(ns_sample[0].direction);
      records2[0].noise.should.equal(ns_sample[0].noise);
      if (sample_logging) {
         console.log('Tidepool data converted back to Nightscout', records2);
      }

   });
});