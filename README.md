# Sensotred Converter

Sensotrend Converter is a simple library that converts diabetes data from different formats into
the [HL7 FHIR®](https://www.hl7.org/fhir/) format.

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

## Acknowledgements

©2022 [Sensotrend Oy](https://www.sensotrend.com/).

The initial work has been supported by [HL7 Finland](https://www.hl7.fi/).

Parts of the code have been implemented as part of the Diabetes Data
Portability through Open Source Components (DiDaPOSC) project.

The project has received funding from the [Next Generation Internet
Initiative](https://www.ngi.eu/) (NGI) within the framework of the [DAPSI
Project](https://dapsi.ngi.eu).

European Union’s H2020 research and innovation programme under Grant Agreement no 871498.
