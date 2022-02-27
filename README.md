# Sensotred Converter

This repository contains a package that converts data related to type 1 between
different formats. The package is _not_ intended to retain the exact same data structures
when data is converted to another format and then back - the conversion process aims to
retain the specific data fields related to diabetes care. The fields that are retained
across the conversion are

1. Blood glucose information from CGM and glucometer devices
2. Carbohydrate treatment information
3. Insulin dosing information

The package uses ES8 Javascript features, so Node 12 or newer is required to use this package.

