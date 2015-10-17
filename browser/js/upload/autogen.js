app.config(function($stateProvider) {
	$stateProvider.state('autogen', {
		url: '/autogen',
		templateUrl: 'js/upload/autogen.html',
		controller: 'autogenCtrl'
	});
});

app.controller('autogenCtrl', function($scope, SongFactory) {
	$scope.sm = {};

	$scope.submit = function() {
		console.log('calling the generate method');
		generate($scope.sm);
	}

	function generate(songInfo) {
		SongFactory.generateChart(songInfo);
	}

});