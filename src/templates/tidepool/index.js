// Class to convert Tidepool input data into intermediate Tidepool-like format

export class TidepoolDataProcessor {

   constructor(logger) {
      this.logger = logger;
   }

   convertRecordToIntermediate (r, options) {
      if (!r._converter) {
         r._converter = options.converter ? options.converter : 'Sensotrend Connect';
      }
      return r;
   }

   /**
    * Returns a Date object representing the record date
    * @param {Object} record Tidepool format record
    */
   getRecordTime(record) {
      return new Date(record.time);
   }

   convertIntermediateToTidepool (r) {
      return r;
   }

   // Convert records to intermediate format
   importRecords(input, options) {

      this.logger.info('IMPORTING INTERMEDIATE');

      const data = input.constructor == Array ? input : [input];

      let r = [];
      let skipped = 0;

      const conversionFunction = this.convertRecordToIntermediate;
      data.forEach(function (e) {
         const _e = conversionFunction(e, options);
         if (_e) {
            r.push(_e);
         } else {
            skipped += 1;
         }
      });

      if (skipped > 0) {
         this.logger.info('Data converter skipped records: ' + skipped);
      }
      return r;
   }

   // Convert records to intermediate format
   exportRecords(input, options) {

      this.logger.info('EXPORTING INTERMEDIATE')

      const data = input.constructor == Array ? input : [input];

      const r = [];
      const conversionFunction = this.convertIntermediateToTidepool;
      data.forEach(function (e) {
         r.push(conversionFunction(e));
      });
      return r;
   }

}
