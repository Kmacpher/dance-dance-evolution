app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeController'
    });
});

app.controller('HomeController', function($rootScope, $scope, $state, AuthService, AUTH_EVENTS, ToneFactory, VizFactory) {
  $scope.user = null;
  var menu = [1, 2, 3, 4, 5];

  var setUser = function () {
      AuthService.getLoggedInUser().then(function (user) {
          $scope.user = user;
          if(user) {
            menu = [1, 2, 5];
          } else {
            menu = [1, 2, 3, 4];
          }
      });
  };

  var removeUser = function () {
      $scope.user = null;
  };

  setUser();

  $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
  $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);

  if(!ToneFactory.sandstormAudio) {
    ToneFactory.sandstorm();
  } else {
    ToneFactory.sandstormAudio.play();
  }

  VizFactory.getAnalyzerNode();

  function play(fx) {
    ToneFactory.play(fx);
  };

  var $document = $(document);
  $document.on('keydown', onArrowKey);

  function onArrowKey(event) {
  	var active = $('.activeHome') || $('#option1');
   	var activeNumber = parseInt(active[0].id.slice(-1));

  	if(event.which === 39) {
  		//right arrow
  		play('blop');
  		activeNumber = activeNumber === menu[menu.length - 1]? 1 : menu[menu.indexOf(activeNumber) + 1];
  		active.removeClass("activeHome");
  		$('#option' + activeNumber).addClass("activeHome");
  	} else if(event.which === 37) {
  		//left arrow
  		play('blop');
  		activeNumber = activeNumber === 1? menu[menu.length - 1] : menu[menu.indexOf(activeNumber) - 1];
  		active.removeClass("activeHome");
  		$('#option' + activeNumber).addClass("activeHome");
  	} else if(event.keyCode === 13) {
      play('start');
  		var uiState = active[0].outerHTML.split('"');
  		$document.off('keydown', onArrowKey);
      if(uiState[5] === "user") {
        logout();
        $state.reload();
      } else {
        ToneFactory.sandstormAudio.pause();
        $state.go(uiState[5]);
      }
  	};
  };

  function logout() {
      AuthService.logout().then(function () {
        setUser();
      });
  };

});
