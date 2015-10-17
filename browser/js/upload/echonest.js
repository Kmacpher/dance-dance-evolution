app.config(function($stateProvider) {
	$stateProvider.state('echonest', {
		url: '/echonest',
		templateUrl: 'js/upload/echonest.html',
		controller: 'echonestCtrl'
	});
});

app.controller('echonestCtrl', function($scope, SongFactory) {


});