import moment from 'moment';

// Class to convert Nightscout input data into intermediate Tidepool-like format

export class NightscoutDataProcessor {

   constructor(logger) {
      this.logger = logger;
   }

   getRecordTime(record) {
      var time;

      if (record.created_at) {
         time = new Date(record.created_at);
      } else {
         time = record.dateString ? new Date(record.dateString) : new Date(record.date);
      }
      return time;
   };

   convertNSRecordToIntermediate(record, options) {

      var time;

      if (record.created_at) {
         time = moment.parseZone(record.created_at);
      } else {
         time = record.dateString ? moment.parseZone(record.dateString) : moment(record.date);
      }

      let type = "";

      let device = record.device ? record.device : record.enteredBy;
      if (!device) { device = 'Unknown device or manual entry'; }

      let e = {
         time: time.toISOString() // format('YYYY-MM-DDTHH:mm:ssZ')
         , timezoneOffset: time.utcOffset()
         , deviceId: device
         , guid: '<blank>'
         , _converter: options.converter ? options.converter : 'Nightscout Connect'
      };

      switch (options.datatypehint) {

         case 'treatments':
            if (record.carbs && !isNaN(record.carbs)) {
               e.carbInput = record.carbs;
               e.type = 'wizard';
            }
            if (record.insulin && !isNaN(record.insulin)) {
               e.insulin = record.insulin;
               e.type = 'wizard';
               e.subType = "normal";
               e.normal = record.insulin;
            }
            break;

         case 'entries':
            if (record.sgv) e.type = 'cbg';
            if (record.mbg) e.type = 'smbg';
            e.units = 'mg/dL';
            e.value = record.sgv ? Number(record.sgv) : Number(record.mbg);
            if (record.delta) { e.delta = record.delta; }
            if (record.noise) { e.noise = record.noise; }
            if (record.direction) { e.direction = record.direction; }
            break;
      }

      if (e.type) {
         return e;
      } else {
         return false;
      }
   }

   convertIntermediateToNS(e, options) {
      if (e.value && e.units) {
         if (e.units == 'mmol/l') {
            e._valuemgdl = Math.round(e.value * 18.0156);
            e._deltamgdl = Math.round(e.delta * 18.0156);
         } else {
            e._valuemgdl = e.value;
            e._deltamgdl = e.delta;
         }
      }

      const time = moment(e.time).utcOffset(e.timezoneOffset);
      const timeString = time.format('YYYY-MM-DDTHH:mm:ssZ'); // toISOString(true);

      let _e;

      switch (e.type) {

         case "cbg":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "date": time.valueOf()
               , "dateString": timeString
               , "sgv": e._valuemgdl
               , "type": "sgv"
               , "sysTime": timeString
            };
            if (e._deltamgdl) _e.delta = e._deltamgdl;
            if (e.direction) _e.direction = e.direction; 
            if (e.noise) _e.noise = e.noise;
            break;
         case "smbg":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "date": time.valueOf()
               , "dateString": timeString
               , "sgv": e._valuemgdl
               , "type": "mbg"
               , "sysTime": timeString
            };
            break;
         case "wizard":
         case "bolus":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "created_at": timeString
               , "date": time.valueOf()
               , "type": "Meal Bolus"
            };

            if (e.carbInput) { _e.carbs = e.carbInput; }
            if (e.normal) {
               _e.insulin = e.normal;
            }

            break;
      }
      return _e;
   }

   // Convert records to intermediate format
   importRecords(input, options) {

      let r = [];
      const conversionFunction = this.convertNSRecordToIntermediate;
      input.forEach(function (e) {
         r.push(conversionFunction(e, options));
      });

      return r;
   };

   // Convert records to intermediate format
   exportRecords(input, options) {

      let r = [];
      const conversionFunction = this.convertIntermediateToNS;
      input.forEach(function (e) {
         r.push(conversionFunction(e, options));
      });
      return r;
   };

}
