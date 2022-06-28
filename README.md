# Sensotred Converter

Sensotrend Converter is a simple library that converts data from different formats into the
[HL7 FHIR®](https://www.hl7.org/fhir/) format.

Recognized input formats are
1. [Tidepool](https://www.tidepool.org/)
   (see [docs](http://developer.tidepool.org/docs/) and
   [source](https://github.com/tidepool-org/data-model))
2. [Nightscout](http://www.nightscout.info/)
   (see [source](https://github.com/nightscout/cgm-remote-monitor))
   on a separate [nightscout](https://github.com/Sensotrend/sensotrend-converter/tree/nightscout)
   branch, with a more complicated, two-way architecture.

Supported information is
1. Blood glucose information from glucometers and continuous glucose monitors (CGM)
2. Estimated carbohydrate intake from bolus calculators
3. Insulin dosing information from insulin pumps and smart pens

The HL7 FHIR data format is published in Simplifier, see both the
[STU3](https://simplifier.net/finnishphr) and [R4](https://simplifier.net/finnishphrr4)
versions.

The converter is also compatible with the
[Roche Diabetes Care](https://simplifier.net/rdcemrintegrations-v2) platform.

See the [bundle.json](./bundle.json) file for an example of produced data, a
[batch](https://hl7.org/fhir/codesystem-bundle-type.html#bundle-type-batch)
[Bundle](https://hl7.org/fhir/bundle.html) resource in HL7 FHIR format.