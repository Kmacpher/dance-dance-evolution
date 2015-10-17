var path = require('path'),
	fs = require('fs'),
	template = require('./sm.json');


function buildSM(songInfo) {

	/**
		template: JSON containing the fields for the stepchart file
		songInfo: information provided by the user
	*/

	var metadata = template.metadata,
		charts = template.charts;

	metadata["#TITLE"] = songInfo.title,
	metadata["#ARTIST"] = songInfo.artist;

	["#OFFSET", "#SAMPLESTART", "#SAMPLELENGTH"].forEach(function(key) {
		metadata[key] = metadata[key].toFixed(3);
	});

	["Beginner", "Easy", "Medium"].forEach(function(difficulty) {
		// e.g. charts["dance-single"]["Easy"] = 5;
		charts["dance-single"][difficulty] = songInfo[difficulty];	
	});

	var fakeGroove = [0,0,0,0,0];
	var fakeStepchart = "0000\r\n0000\r\n0000\r\n0000\r\n,\r\n0000\r\n0000\r\n0000\r\n0000\r\n";


	var metadataSection = Object.keys(metadata).reduce(function(result, line) {
		return result + line+':'+metadata[line]+';\r\n';
	}, '');


	var chartsSection = "";
	chartsSection += Object.keys(charts["dance-single"]).reduce(function(result, level) {
		var section = "\r\n//---------------dance-single - ----------------\r\n";
		section += "#NOTES:\r\n     dance-single:\r\n     :\r\n     ";
		section += level + ":\r\n     ";
		section += charts["dance-single"][level] + ":\r\n     ";
		section += fakeGroove.map(function(num) {return num.toFixed(3)}).join(',') + ":\r\n";
		section += fakeStepchart + ";\r\n";
		return result + section;
	}, '');


	var data = metadataSection + chartsSection;

	var filePath = path.join(__dirname, '..', 'browser', 'sm', songInfo.title+'.sm')
	fs.writeFile(filePath, data, 'utf8', function(err) {
		if (err) {
			return console.error('Error writing to file',songInfo.title+'.sm', err);
		}
		console.log('File', songInfo.title+'.sm', 'successfully saved to', filePath);
	})
}


function testBuild(title, someText) {
	buildSM({
		title: title
	}, someText);
}


module.exports = {
	buildSM: buildSM
};


// for running as bash script
//testBuild.apply(null, process.argv.slice(2));