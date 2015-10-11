app.config(function($stateProvider) {

    $stateProvider.state('selectGame', {
        url: '/selectGame',
        templateUrl: 'js/selectGame/selectGame.html',
        controller: 'SelectGameCtrl'
    });

});

app.controller('SelectGameCtrl', function($scope, $state, ToneFactory) {
    $('.activeChoice').removeClass("activeChoice");
    $('#option1').addClass("activeChoice");

    function play(fx) {
      ToneFactory.play(fx);
    };

    var menuLength = $('.menuXParent').children().length;
    console.log(menuLength);

    window.addEventListener('keydown', onArrowKey);

    function onArrowKey(event) {
        var active = $('.activeChoice');
        var activeNumber = parseInt(active[0].id.slice(-1));

        if (event.which === 40) {
            play('blop');
            activeNumber = activeNumber === menuLength ? 1 : activeNumber + 1;
            active.removeClass("activeChoice");
            $('#option' + activeNumber).addClass("activeChoice");
        } else if (event.which === 38) {
            play('blop');
            activeNumber = activeNumber === 1 ? menuLength : activeNumber - 1;
            active.removeClass("activeChoice");
            $('#option' + activeNumber).addClass("activeChoice");
        } else if (event.keyCode === 13) {
            play('start');
            var uiState = active[0].outerHTML.split('"');
            console.log(uiState);
            window.removeEventListener('keydown', onArrowKey);
            $state.go(uiState[5]);
        } else if (event.keyCode === 27) {
            play('back');
            window.removeEventListener('keydown', onArrowKey);
            $state.go('home');
        };
    };
});