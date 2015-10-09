app.config(function ($stateProvider) {

    $stateProvider.state('mainMenu', {
        url: '/mainMenu',
        templateUrl: 'js/mainMenu/mainMenu.html',
        controller: 'MainMenuCtrl'
    });

});

app.controller('MainMenuCtrl', function ($scope, $state) {
  console.log("Controller is loaded");
  $('.activeChoice').removeClass("activeChoice");
  $('#option1').addClass("activeChoice");

  function play() {
    var audio = document.getElementById("blop");
    audio.play();
  };

  var menuLength = $('.menuXParent').children().length;

  window.addEventListener('keydown', onArrowKey)
  function onArrowKey(event) {
      var active = $('.activeChoice');
      var activeNumber = parseInt(active[0].id.slice(-1));

    if(event.which === 40) {
      play();
      activeNumber = activeNumber === menuLength? 1 : activeNumber + 1;
      active.removeClass("activeChoice");
      $('#option' + activeNumber).addClass("activeChoice");
    } else if(event.which === 38) {
      play();
      activeNumber = activeNumber === 1? menuLength : activeNumber - 1;
      active.removeClass("activeChoice");
      $('#option' + activeNumber).addClass("activeChoice");
    } else if(event.keyCode === 13) {
      var uiState = active[0].outerHTML.split('"');
      window.removeEventListener('keydown', onArrowKey);
      $state.go(uiState[menuLength]);
    } else if(event.keyCode === 27) {
      window.removeEventListener('keydown', onArrowKey);
      $state.go('home');
    };
  };
});
