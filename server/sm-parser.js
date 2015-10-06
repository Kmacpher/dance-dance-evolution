var path = require('path');
var fs = require('fs');

var startSteps = /^\d{4}$/,
	sectionSplit = /\/\/(?:\-*)dance\-[a-z]+\s\-\s(?:\-*)/,
	metadataRegex = /\#([A-Z0-9]*)\:([^;]*)/,
	singleRegex = /dance\-([a-z]+)/,
	difficultyRegex = /(Beginner|Easy|Medium|Hard|Challenge)/,
	numberIdRegex = /(\d\.\d{3})/,
	measureRegex = /\s+\/\/\smeasure\s\d+/g,
	grooveRegex = /\d{1}\.\d{3}\:/,
	linebreakRegex = /^\\r\\n/;


function readSM(title) {
	var filePath = path.join(__dirname, '..', 'browser', 'sm', title);
	var data = fs.readFileSync(filePath, 'utf8');

		var sections = data.split(sectionSplit);

		var metadataStr = sections[0].split('\r\n').filter(function(line) {
			return line.trim().charAt(0) === '#';
		});

		console.log(metadataStr);
		var metadata = {};
		metadataStr.forEach(function(line) {
			var lineParse = metadataRegex.exec(line);
			var key = lineParse[1], value = lineParse[2];
			metadata[key] = value;
		})

		// var stepCharts = {};

		var charts = {};
		for (var i=1; i<sections.length; i++) {
			// only use single charts for now
			var section = sections[i];
			if (singleRegex.exec(section)[1] === 'single') {
				// var difficulty = difficultyRegex.exec(section)[1];
				// console.log('difficulty:',difficulty);
				var chartData = getChartData(section);
				charts[chartData.difficulty] = chartData;
			}
		}

		return {
			charts: charts,
			metadata: metadata
		//return charts;
		}

}


function getChartData(section) {
	var data = {};
	var lastgroove = grooveRegex.exec(section)[0];
	var splitSection = section.split(grooveRegex);
	var chartInfo = splitSection[0].concat(lastgroove);
	var stepchart = splitSection[1];
	var measures = stepchart.replace(measureRegex, '').split(',\r\n');

	measures[0] = measures[0].replace(linebreakRegex,'');
	var beats = measures.map(function(measure) {
		return measure.split('\r\n').filter(function(beat) {
			return !!beat;
		}).map(function(line) {
			return line.split('');
		});
	})
	data.stepchart = beats;

	chartInfo = chartInfo.trim().split('\r\n');

	for (var j=0; j<chartInfo.length; j++) {
		var line = chartInfo[j].trim().replace(':', '');
		var diff = difficultyRegex.exec(line);
		if (diff) data.difficulty = diff[1];
		else if (!isNaN(line)) data.level = Number(line);
		else {
			var attrs = line.split(',');
			if (attrs.length === 5) {
				attrs = attrs.map(function(num) {
					return Number(numberIdRegex.exec(num)[1]);
				});
				data.grooveRadar = {
					stream: attrs[0],
					voltage: attrs[1],
					air: attrs[2],
					freeze: attrs[3],
					chaos: attrs[4]
				}
			}
		}
	}
	return data;
}

module.exports = {
	readSM: readSM
};

// readSM(process.argv[2]);



