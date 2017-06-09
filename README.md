# California Tax Rates By Zip Code

The JavaScript code contained in [`inject.js`](inject.js) is intended to be injected into the California
State Board of Equalization's [Find a Sales and Use Tax Rate](https://maps.gis.ca.gov/boe/TaxRates/) page,
by copying and then pasting it into your browser's developer tools console. Once pasted, press the `ENTER`
key to launch the code. It may take a few hours to complete. Once it has finished, the `zipCodeTaxRateData`
variable will reference the results object. See below for info about the data it contains.

----

## Results Object

Contains the following members:

1. `rawResults`
2. `zipCodesWithSingleTaxRate`
3. `zipCodesWithSingleTaxRateCSV`
4. `zipCodesWithMultipleTaxRates`
5. `zipCodesWithMultipleTaxRatesCSV`

----

### `rawResults`

Contains the following members:

1. `validZipCodes`
2. `invalidZipCodes`

----

#### `validZipCodes`

An array of raw objects corresponding to valid California ZIP codes. This data is used internally.

----

#### `invalidZipCodes`

An array of raw objects corresponding to numbers between 90000 (inclusive) and
100000 (exclusive) that are not valid California ZIP codes. This data is used internally.

----

### `zipCodesWithSingleTaxRate`

An array of objects, where each object contains a ZIP code and tax rate. These correspond to ZIP codes in which
all contained areas have the same tax rate (most common).

----

### `zipCodesWithSingleTaxRateCSV`

A CSV string containing the data in `zipCodesWithSingleTaxRate`.

----

### `zipCodesWithMultipleTaxRates`

An array of objects, where each object contains a ZIP code and two tax rates. These correspond to ZIP codes in which
there are two tax rates (uncommon).

----

### `zipCodesWithMultipleTaxRatesCSV`

A CSV string containing the data in `zipCodesWithMultipleTaxRates`.
