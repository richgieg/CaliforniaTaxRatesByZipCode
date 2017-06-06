function getCaliforniaTaxRateByZipCode(zipCode, callback) {
	var result = {
		zipCode: zipCode,
		geocodeData: null,
		identificationRecords: null,
		error: null,
		errorType: null
	};

	var address = '&postalCode=' + zipCode;

	function identificationCallback(data) {
		var identificationResults = data[1];

		if (identificationResults.features.length < 1) {
			result.error = 'Identification failure.';
			result.errorType = 'identification';
		} else {
			result.identificationRecords = [];

			for (var i = 0; i < data[1].features.length; i++) {
				result.identificationRecords.push(data[1].features[i].attributes);
			}
		}

		if (callback) {
			callback(result);
		}
	}

	function geocodeCallback(data) {
		result.geocodeData = data;
		var error = null;

		if ((data === null) || (data[0] == '')) {
			error = 'No geocode data returned.';
		} else {
			var parts = data[0].split(',');

			if (parts.length != 2) {
				error = 'Returned data, "' + data[0] + '", contains the wrong number of elements.';
			} else if (parts[0].trim() != zipCode) {
				error = 'Zip code in returned data, "' + data[0] + '", does not match zipCode argument ' + zipCode + '.';
			} else if (parts[1].trim() != 'CA') {
				error = 'State value in returned data, "' + data[0] + '", is not CA.';
			}
		}

		if (error && callback) {
			result.error = 'Geocode failure: ' + error;
			result.errorType = 'geocode';
			callback(result);
		} else {
			WebApplication5.IdentifyScriptService.BufferAndIdentify(data[1], data[2], data[4], '4326', identificationCallback);
		}
	}

	WebApplication5.IdentifyScriptService.GeocodeAddress(address, geocodeCallback);
}

function getCaliforniaZipCodeTaxRatesByBruteForce(callback) {
	var validZipCodes = [];
	var invalidZipCodes = [];
	var start = 90000;
	var end = 100000;
	var msDelay = 250;
	var quantity = end - start;
	var current = start;
	var interval = setInterval(doZipCodeQuery, msDelay);

	function doZipCodeQuery() {
		getCaliforniaTaxRateByZipCode(current, function(result) {
			var error = '';

			if (result.error) {
				invalidZipCodes.push(result);
				error = ' [' + result.error + ']';
			} else {
				validZipCodes.push(result);
			}

			var completed = validZipCodes.length + invalidZipCodes.length;
			var status = completed + ' of ' + quantity + ' [' + result.zipCode + ']' + error;
			console.log(status);

			if (completed === quantity) {
				console.log('Done!');
				if (callback) {
					validZipCodes.sort(function(a, b) {return a.zipCode - b.zipCode})
					invalidZipCodes.sort(function(a, b) {return a.zipCode - b.zipCode})

					var zipCodesWithSingleTaxRate = [];
					var zipCodesWithMultipleTaxRates = [];

					for (var i = 0; i < validZipCodes.length; i++) {
						var hasMultipleRates = (validZipCodes[i].identificationRecords.length > 1) &&
							(validZipCodes[i].identificationRecords[0].RATE !== validZipCodes[i].identificationRecords[1].RATE);

						if (hasMultipleRates) {
							var rateA = validZipCodes[i].identificationRecords[0].RATE;
							var rateB = validZipCodes[i].identificationRecords[1].RATE;

							zipCodesWithMultipleTaxRates.push({
								zipCode: validZipCodes[i].zipCode,
								lowRate: Math.min(rateA, rateB),
								highRate: Math.max(rateA, rateB)
							});
						} else {
							zipCodesWithSingleTaxRate.push({
								zipCode: validZipCodes[i].zipCode,
								taxRate: validZipCodes[i].identificationRecords[0].RATE
							});
						}
					}

					var zipCodesWithSingleTaxRateCSV = zipCodesWithSingleTaxRate.map(function(e) {
						return e.zipCode + ',' + e.taxRate;
					}).join('\n');

					var zipCodesWithMultipleTaxRatesCSV = zipCodesWithMultipleTaxRates.map(function(e) {
						return e.zipCode + ',' + e.lowRate + ',' + e.highRate;
					}).join('\n');

					var data = {
						rawResults: {
							validZipCodes: validZipCodes,
							invalidZipCodes: invalidZipCodes
						},
						zipCodesWithSingleTaxRate: zipCodesWithSingleTaxRate,
						zipCodesWithMultipleTaxRates: zipCodesWithMultipleTaxRates,
						zipCodesWithSingleTaxRateCSV: zipCodesWithSingleTaxRateCSV,
						zipCodesWithMultipleTaxRatesCSV: zipCodesWithMultipleTaxRatesCSV
					};

					callback(data);
				}
			}
		});

		current++;

		if (current === end) {
			clearInterval(interval);
		}
	}
}

var zipCodeTaxRateData;

getCaliforniaZipCodeTaxRatesByBruteForce(function(data) {
	zipCodeTaxRateData = data;
});
