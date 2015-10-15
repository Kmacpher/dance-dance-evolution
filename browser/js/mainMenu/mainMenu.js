app.config(function($stateProvider) {

    $stateProvider.state('mainMenu', {
        url: '/mainMenu',
        templateUrl: 'js/mainMenu/mainMenu.html',
        controller: 'MainMenuCtrl'
    });

});

app.controller('MainMenuCtrl', function ($scope, $state, ToneFactory, keyConfigFactory) {
    $('.activeChoice').removeClass("activeChoice");
    $('#option1').addClass("activeChoice");

    $('.menuXParent').click( function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
    });

    function play(fx) {
      ToneFactory.play(fx);
    };

    var menuLength = $('.menuXParent').children().length;
    var $document = $(document);
    $document.on('keydown', onArrowKey)
    window.addEventListener('gamepadbuttondown', onArrowKey);

    function onArrowKey(event) {
        var button = keyConfigFactory.getButton(event);
        if (!button) return;

        var active = $('.activeChoice');
        var activeNumber = parseInt(active[0].id.slice(-1));

        if (button.name === "down") {
            play('blop');
            activeNumber = activeNumber === menuLength ? 1 : activeNumber + 1;
            active.removeClass("activeChoice");
            $('#option' + activeNumber).addClass("activeChoice");
        } else if (button.name === "up") {
            play('blop');
            activeNumber = activeNumber === 1 ? menuLength : activeNumber - 1;
            active.removeClass("activeChoice");
            $('#option' + activeNumber).addClass("activeChoice");
        } else if (button.name === "enter") {
            play('start');
            var uiState = active[0].outerHTML.split('"');
            console.log(uiState);

            var arr2 = /(\w+)(?:\(\{\w+\:\s)?(\d)?/.exec(uiState[5]);
            console.log('arr2:',arr2);
            var state = arr2[1], playerNum = arr2[2] ? parseInt(arr2[2], 10) : 1;

            $document.off('keydown', onArrowKey);
            window.removeEventListener('gamepadbuttondown', onArrowKey);

            $state.go(state, {players: playerNum});
        } else if (button.name === "escape") {
            play('back');
            $document.off('keydown', onArrowKey);
            window.removeEventListener('gamepadbuttondown', onArrowKey);
            $state.go('home');
        };
    };
});
