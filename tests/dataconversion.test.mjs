import ConversionService from '../src/ConversionService.mjs';
import { NightscoutDataProcessor } from '../src/templates/nightscout/index.mjs';
import { FIPHRDataProcessor } from '../src/templates/fiphr/index.mjs';
import { TidepoolDataProcessor } from '../src/templates/tidepool/index.mjs';
import 'chai/register-should.js';

const logger = {};
logger.info = console.log;
logger.error = console.error;
logger.debug = console.log;

const DataConverter = new ConversionService(logger);

DataConverter.registerFormatProcessor('nightscout', NightscoutDataProcessor);
DataConverter.registerFormatProcessor('fiphr', FIPHRDataProcessor);
DataConverter.registerFormatProcessor('tidepool', TidepoolDataProcessor);

describe('Data conversion service', function () {
  it('should convert Tidepool bolus record to FIPHR and back', async function () {
    let tidepool_sample = [
      {
        time: '2019-01-26T18:49:35.000Z',
        timezoneOffset: 120,
        clockDriftOffset: -3000,
        conversionOffset: 0,
        deviceTime: '2019-01-26T20:49:35',
        deviceId: 'MedT-554-450960',
        type: 'bolus',
        subType: 'normal',
        normal: 0.1,
        payload: {
          logIndices: [1541],
        },
      },
    ];

    console.log('Converting tidepool to FHIR');

    let options = {
      source: 'tidepool',
      target: 'fiphr',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(tidepool_sample, options);

    records[0].effectiveDateTime.should.equal('2019-01-26T20:49:35.000+02:00');
    records[0].resourceType.should.equal('MedicationAdministration');
    console.log('Got FHIR resource', records[0]);

    options = {
      source: 'fiphr',
      target: 'tidepool',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);

    records2[0].normal.should.equal(0.1);
    records2[0].deviceId.should.equal('MedT-554-450960');
    records2[0].time.should.equal('2019-01-26T18:49:35.000Z');
    records2[0].type.should.equal('bolus');
    // records2[0].subtype.should.equal("normal");
  });

  it('should convert Tidepool bolus wizard record to FIPHR and back', async function () {
    let tidepool_sample = [
      {
        time: '2019-02-22T16:43:53.000Z',
        timezoneOffset: 180,
        clockDriftOffset: -2000,
        conversionOffset: -518761000,
        deviceTime: '2019-02-16T19:37:52',
        deviceId: 'MMT-1711:NG1112288H',
        type: 'wizard',
        recommended: {
          carb: 0.4,
          correction: 0,
          net: 0.4,
        },
        carbInput: 5,
        insulinOnBoard: 0,
        insulinCarbRatio: 12,
        insulinSensitivity: 2.3,
        bgTarget: {
          low: 5.7,
          high: 5.7,
        },
        bolus: {
          time: '2019-02-22T16:43:56.000Z',
          timezoneOffset: 180,
          clockDriftOffset: -2000,
          conversionOffset: -518761000,
          deviceTime: '2019-02-16T19:37:55',
          deviceId: 'MMT-1711:NG1112288H',
          type: 'bolus',
          subType: 'normal',
          normal: 0.4,
          payload: {
            logIndices: [2185299645],
          },
        },
        units: 'mmol/L',
        payload: {
          logIndices: [2185299642],
        },
        carbUnits: 'grams',
      },
    ];

    let options = {
      source: 'tidepool',
      target: 'fiphr',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(tidepool_sample, options);

    console.log('Intermediate wizard entry', records);

    options = {
      source: 'fiphr',
      target: 'tidepool',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);

    records2[0].type.should.equal('wizard');
    records2[0].deviceId.should.equal('MMT-1711:NG1112288H');
    records2[0].time.should.equal('2019-02-22T16:43:53.000Z');
  });

  it('should skip old records when requested', async function () {
    let tidepool_sample = [
      {
        time: '2017-01-26T18:49:35.000Z',
        timezoneOffset: 120,
        clockDriftOffset: -3000,
        conversionOffset: 0,
        deviceTime: '2017-01-26T20:49:35',
        deviceId: 'MedT-554-450960',
        type: 'bolus',
        subType: 'normal',
        normal: 0.1,
        payload: {
          logIndices: [1541],
        },
      },
      {
        time: '2019-01-26T18:49:35.000Z',
        timezoneOffset: 120,
        clockDriftOffset: -3000,
        conversionOffset: 0,
        deviceTime: '2017-01-26T20:49:35',
        deviceId: 'MedT-554-450960',
        type: 'bolus',
        subType: 'normal',
        normal: 0.1,
        payload: {
          logIndices: [1541],
        },
      },
    ];

    let skipData = {
      'MedT-554-450960': new Date('2018-05-03T05:09:15.000+00:00'),
    };

    let options = {
      source: 'tidepool',
      target: 'fiphr',
      skipRecordsUsingDates: skipData,
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(tidepool_sample, options);
    records.length.should.equal(1);
  });

  it('should know record formats and time', async function () {
    let tidepool_sample = [
      {
        time: '2017-01-26T18:49:35.000Z',
        timezoneOffset: 120,
        clockDriftOffset: -3000,
        conversionOffset: 0,
        deviceTime: '2017-01-26T20:49:35',
        deviceId: 'MedT-554-450960',
        type: 'bolus',
        subType: 'normal',
        normal: 0.1,
        payload: {
          logIndices: [1541],
        },
      },
    ];

    let options = {
      source: 'tidepool',
      target: 'fiphr',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(tidepool_sample, options);
    const r1 = records[0];
    DataConverter.getRecordFormat(r1).should.equal('fiphr');
    DataConverter.getRecordSourceFormat(r1).should.equal('tidepool');
    DataConverter.getRecordTime(r1)
      .getTime()
      .should.equal(new Date(tidepool_sample[0].time).getTime());

    r1.effectiveDateTime.should.equal('2017-01-26T20:49:35.000+02:00');
  });

  it('should convert Nightscout CGM record to FIPHR and back', async function () {
    let ns_sample = [
      {
        _id: '5c655105763fe276981ff0c2',
        device: 'xDrip-DexcomG5',
        date: 1550143850509,
        dateString: '2019-02-14T13:30:50.509+0200',
        sgv: 177,
        delta: 15,
        direction: 'FortyFiveUp',
        type: 'sgv',
        filtered: 195071.0394182456,
        unfiltered: 196842.65552921052,
        rssi: 100,
        noise: 1,
        sysTime: '2019-02-14T13:30:50.509+0200',
      },
    ];

    let options = {
      source: 'nightscout',
      target: 'fiphr',
      datatypehint: 'entries',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(ns_sample, options);

    options = {
      source: 'fiphr',
      target: 'nightscout',
      datatypehint: 'entries',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);

    records2[0].sgv.should.equal(177);
    records2[0].type.should.equal('sgv');
    // records2[0].delta.should.equal(15);
    // records2[0].direction.should.equal('FortyFiveUp');
    // records2[0].noise.should.equal(1);
    records2[0].date.should.equal(ns_sample[0].date);
  });

  it('should convert Nightscout CGM record to FIPHR and back without a data type hint', async function () {
    let ns_sample = [
      {
        _id: '5c655105763fe276981ff0c2',
        device: 'xDrip-DexcomG5',
        date: 1550143850509,
        dateString: '2019-02-14T13:30:50.509+0200',
        sgv: 177,
        delta: 15,
        direction: 'FortyFiveUp',
        type: 'sgv',
        filtered: 195071.0394182456,
        unfiltered: 196842.65552921052,
        rssi: 100,
        noise: 1,
        sysTime: '2019-02-14T13:30:50.509+0200',
      },
    ];

    let options = {
      source: 'nightscout',
      target: 'fiphr',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(ns_sample, options);

    options = {
      source: 'fiphr',
      target: 'nightscout',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);

    records2[0].sgv.should.equal(177);
    records2[0].type.should.equal('sgv');
    // records2[0].delta.should.equal(15);
    // records2[0].direction.should.equal('FortyFiveUp');
    // records2[0].noise.should.equal(1);
    records2[0].date.should.equal(ns_sample[0].date);
  });

  it('should convert Nightscout CGM record to FIPHR and back and not add fields', async function () {
    let ns_sample = [
      {
        _id: '5c655105763fe276981ff0c2',
        device: 'xDrip-DexcomG5',
        date: 1550143850509,
        dateString: '2019-02-14T13:30:50.509+0200',
        sgv: 177,
        type: 'sgv',
        sysTime: '2019-02-14T13:30:50.509+0200',
      },
    ];

    let options = {
      source: 'nightscout',
      target: 'fiphr',
      datatypehint: 'entries',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(ns_sample, options);

    options = {
      source: 'fiphr',
      target: 'nightscout',
      datatypehint: 'entries',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);

    records2[0].should.not.have.property('delta');
    records2[0].should.not.have.property('direction');
    records2[0].should.not.have.property('noise');
  });

  it('should convert Nightscout bolus wizard record to FIPHR and back', async function () {
    let ns_sample = [
      {
        device: 'MDT-554',
        carbs: 15,
        insulin: 1.3,
        created_at: '2019-04-01T10:26:23+03:00',
        eventType: 'Meal Bolus',
      },
      {
        timestamp: 1563525782180,
        eventType: '<none>',
        enteredBy: 'xdrip',
        uuid: '93038829-06da-4413-96ac-6b879be99973',
        carbs: 15,
        insulin: 1.3,
        created_at: '2019-07-19T08:43:02Z',
        sysTime: '2019-07-19T11:43:02.180+0300',
        _id: '9303882906da441396ac6b87',
      },
    ];

    let options = {
      source: 'nightscout',
      target: 'fiphr',
      datatypehint: 'treatments',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(ns_sample, options);

    options = {
      source: 'fiphr',
      target: 'nightscout',
      datatypehint: 'treatments',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);

    console.log('records2', records2);

    records2[0].carbs.should.equal(15);
    records2[1].insulin.should.equal(1.3);
    records2[0].created_at.should.equal(ns_sample[0].created_at);
  });

  it('should convert FIPHR carb data to Tidepool and back', async function () {
    let FHIRCarbEntry = {
      resourceType: 'Observation',
      id: '1710920',
      meta: {
        versionId: '1',
        lastUpdated: '2019-04-03T13:28:03.727+00:00',
        profile: ['http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake-stu3'],
      },
      language: 'fi',
      text: {
        status: 'generated',
        div:
          '<div xmlns="http://www.w3.org/1999/xhtml">Arvioitu hiilihydraattimäärä: 15 g<br/>Laite: MDT-554 (via Sensotrend Connect)</div>',
      },
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:uuid:60f706c8-f821-56e5-9980-44dfd40c14e8',
        },
      ],
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://phr.kanta.fi/CodeSystem/fiphr-cs-observationcategory',
              code: 'nutrition',
              display: 'Ravintosisältö',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '9059-7',
            display: 'Arvioitu hiilihydraattimäärä',
          },
        ],
      },
      subject: {
        reference: 'Patient/1710136',
      },
      effectiveDateTime: '2019-04-01T11:21:28.000+03:00',
      issued: '2019-04-01T11:21:28.000+03:00',
      performer: [
        {
          reference: 'Patient/1710136',
        },
      ],
      valueQuantity: {
        value: 15,
        unit: 'g',
        system: 'http://unitsofmeasure.org',
        code: 'g',
      },
    };

    let options = {
      source: 'fiphr',
      target: 'tidepool',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(FHIRCarbEntry, options);

    options = {
      source: 'tidepool',
      target: 'fiphr',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);

    records2[0].valueQuantity.value.should.equal(FHIRCarbEntry.valueQuantity.value);
    records2[0].effectiveDateTime.should.equal(FHIRCarbEntry.effectiveDateTime);
    records2[0].code.coding[0].code.should.equal('9059-7');
  });

  it('should convert Libre scan data from Tidepool to a CGM entry', async function () {
    const tidepoolLibreScanEntry = {
      time: '2018-01-09T21:42:10.000Z',
      timezoneOffset: -60,
      clockDriftOffset: -638000,
      conversionOffset: 0,
      deviceTime: '2018-01-09T20:42:10',
      deviceId: 'AbbottFreeStyleLibre-JCMX144-K3442',
      type: 'smbg',
      value: 161,
      units: 'mg/dL',
      subType: 'scanned',
      payload: {
        logIndices: [8066],
      },
    };

    const options = {
      source: 'tidepool',
      target: 'fiphr',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    const records = await DataConverter.convert(tidepoolLibreScanEntry, options);

    records[0].code.coding[0].code.should.equal('14745-4');
    records[0].effectiveDateTime.should.equal('2018-01-09T20:42:10.000-01:00');
  });

  it('should convert Nightscout data to Tidepool and back', async function () {
    let ns_sample = [
      {
        _id: '5c655105763fe276981ff0c2',
        device: 'xDrip-DexcomG5',
        date: 1550143850509,
        dateString: '2019-02-14T13:30:50.509+0200',
        sgv: 177,
        delta: 1.5,
        direction: 'Flat',
        type: 'sgv',
        filtered: 195071.0394182456,
        unfiltered: 196842.65552921052,
        rssi: 100,
        noise: 1,
        sysTime: '2019-02-14T13:30:50.509+0200',
      },
    ];

    let options = {
      source: 'nightscout',
      target: 'tidepool',
      datatypehint: 'entries',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records = await DataConverter.convert(ns_sample, options);

    console.log('records', records);

    options = {
      source: 'tidepool',
      target: 'nightscout',
      datatypehint: 'entries',
      FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d', // Needed for FHIR conversion
    };

    let records2 = await DataConverter.convert(records, options);
    records2[0].sgv.should.equal(177);
    records2[0].delta.should.equal(1.5);
    records2[0].noise.should.equal(1);
    records2[0].direction.should.equal('Flat');
    records2[0].device.should.equal('xDrip-DexcomG5');
  });
});
