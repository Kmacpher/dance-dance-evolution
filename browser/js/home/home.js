app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeController'
    });
});

app.controller('HomeController', function ($rootScope, $scope, $state, AuthService, AUTH_EVENTS, ToneFactory, keyConfigFactory) {
  $scope.user = null;
  var menu = [1, 2, 3, 4, 5];

  $('.homeMenu').click( function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
  });

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

  function play(fx) {
    ToneFactory.play(fx);
  };

  var $document = $(document);
  $document.on('keydown', onArrowKey);
  window.addEventListener('gamepadbuttondown', onArrowKey);
  $document.on('keydown', moveArrows);
  window.addEventListener('gamepadbuttondown', moveArrows);
  $document.on('keyup', replaceArrows);
  window.addEventListener('gamepadbuttonup', replaceArrows);


// .up img {
//     // position: absolute;
//     transition: transform 0.2s;
//     width: 100%;
//     // left: calc((100vw / 10));
//   }
//   .right img {
//     width: 100%;
//     transform: translateY(90px) rotate(90deg);
//     transition: transform 0.2s;
//     // transform: rotate(90deg);
//     // position: absolute;
//     // left: calc(100vw / 10);
//   }
//   .down img {
//     width: 100%;
//     transform: translateY(90px) rotate(180deg);
//     transition: transform 0.2s;
//     // position: absolute;
//   }
//   .left img {
//     width: 100%;
//     transform: translateY(90px) rotate(-90deg);
//     transition: transform 0.2s;
//     // position: absolute;

//   }

  var arrows = {
    left: {
      el: $('.arrow-keys .left img')[0],
      dir: "left",
      start: "0",
      end: "-20px"
    },
    right: {
      el: $('.arrow-keys .right img')[0],
      dir: "left",
      start: "0",
      end: "20px"
    },
    down: {
      el: $('.arrow-keys .down img')[0],
      dir: "top",
      start: "0",
      end: "20px"
    },
    up: {
      el: $('.arrow-keys .up img')[0],
      dir: "top",
      start: "0",
      end: "-20px"
    },
  };

  function moveArrows (e) {
    var button = keyConfigFactory.getButton(e);
    if (!button) return;

    var a = arrows[button.name];

    a.el.style[a.dir] = a.end;
    a.el.style['-webkit-filter'] = "grayscale(1) brightness(200%)";
  }
  function replaceArrows (e) {
    var button = keyConfigFactory.getButton(e);
    if (!button) return;

    var a = arrows[button.name];

    a.el.style[a.dir] = a.start;
    a.el.style['-webkit-filter'] = "";
  }

  function onArrowKey(event) {
    var button = keyConfigFactory.getButton(event);
    if (!button) return;

  	var active = $('.activeHome') || $('#option1');
   	var activeNumber = parseInt(active[0].id.slice(-1));



  	if (button.name === 'right') {
  		//right arrow
  		play('blop');
  		activeNumber = activeNumber === menu[menu.length - 1]? 1 : menu[menu.indexOf(activeNumber) + 1];
  		active.removeClass("activeHome");
  		$('#option' + activeNumber).addClass("activeHome");
  	} else if (button.name === 'left') {
  		//left arrow
  		play('blop');
  		activeNumber = activeNumber === 1? menu[menu.length - 1] : menu[menu.indexOf(activeNumber) - 1];
  		active.removeClass("activeHome");
  		$('#option' + activeNumber).addClass("activeHome");
  	} else if (button.name === 'enter') {
      play('start');
  		var uiState = active[0].outerHTML.split('"');
      $document.off('keydown', onArrowKey);
      window.removeEventListener('gamepadbuttondown', onArrowKey);

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
