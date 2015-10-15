app.directive('score', function () {
	return {
		restrict: 'E',
		templateUrl: 'js/common/directives/score/score.html',
		scope: {
			player: "=",
		}
	};
});