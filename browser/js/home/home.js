app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeController'
    });
});

app.controller('HomeController', function($rootScope, $scope, $state, AuthService, AUTH_EVENTS, ToneFactory) {
  $scope.user = null;

  var setUser = function () {
      AuthService.getLoggedInUser().then(function (user) {
          $scope.user = user;
      });
  };

  var removeUser = function () {
      $scope.user = null;
  };

  setUser();

  $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
  $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);

  function play(fx) {
    ToneFactory.play(fx);
  };

  window.addEventListener('keydown', onArrowKey);

  var menuLength = $('.homeMenu').children().length;

  function onArrowKey(event) {
  	var active = $('.activeHome') || $('#option1');
 	var activeNumber = parseInt(active[0].id.slice(-1));


	if(event.which === 39) { 
		//right arrow
		play('blop');
		activeNumber = activeNumber === menuLength? 1 : activeNumber + 1;
		active.removeClass("activeHome");
		$('#option' + activeNumber).addClass("activeHome");
	} else if(event.which === 37) { 
		//left arrow
		play('blop');
		activeNumber = activeNumber === 1? menuLength : activeNumber - 1;
		active.removeClass("activeHome");
		$('#option' + activeNumber).addClass("activeHome");
	} else if(event.keyCode === 13) {
    play('start');
		var uiState = active[0].outerHTML.split('"');
		window.removeEventListener('keydown', onArrowKey);
		$state.go(uiState[5]);
	};
  };

});
