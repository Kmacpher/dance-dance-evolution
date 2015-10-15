app.config(function ($stateProvider) {
    $stateProvider.state('keybinding', {
        url: '/keybinding',
        templateUrl: 'js/keybinding/keybinding.html',
        controller: 'keyBindingCtrl'
    });
});

app.controller('keyBindingCtrl', function ($scope, keyIdentity, keyConfigFactory, $state) {

    $scope.keys = {
        left: {},
        down: {},
        up: {},
        right: {},
        back: {},
        enter: {},
        escape: {}
    };

    var pointer = 0;

    var keyKeys = Object.keys($scope.keys);

    $scope.currKey = keyKeys[pointer];

    var detectKey = function (e) {
        if (pointer >= keyKeys.length) {
            document.removeEventListener('keydown', detectKey);
            return;
        }
        e.preventDefault();
        console.log('pressing key', e);
        $scope.keys[$scope.currKey].keyCode = e.keyCode;
        $scope.keys[$scope.currKey].name = keyIdentity(e.keyCode);
        pointer++;
        $scope.currKey = keyKeys[pointer];
        $scope.$digest();
    }

    var detectPad = function (e) {
        if (pointer >= keyKeys.length) {
            window.removeEventListener('gamepadbuttondown', detectPad);
            return;
        }
        e.preventDefault();
        console.log('pressing pad', e);
        $scope.keys[$scope.currKey].padCode = e.button;
        $scope.keys[$scope.currKey].padIndex = e.gamepad.index;
        $scope.keys[$scope.currKey].button = _.findKey(e.gamepad.indices, function (button) {
            return button === e.button;
        });
        $scope.keys[$scope.currKey].name = `${$scope.keys[$scope.currKey].button}, Gamepad ${e.gamepad.index}.`
        pointer++;
        $scope.currKey = keyKeys[pointer];
        $scope.$digest();
    }

    window.addEventListener('keydown', detectKey);

    window.addEventListener('gamepadbuttondown', detectPad);


    $scope.restart = function () {
        pointer = 0;
        $scope.currKey = keyKeys[pointer];
        window.addEventListener('keydown', detectKey);
        window.addEventListener('gamepadbuttondown', detectPad);
    }

    $scope.player = 1;

    $scope.resetToDefault = function () {
        keyConfigFactory.setDefaultConfig();
    }

    $scope.save = function () {
        $scope.keys.index = $scope.player - 1;
        keyConfigFactory.setConfig($scope.player - 1, $scope.keys)
        keyConfigFactory.saveConfig($scope.player - 1, $scope.keys)
    }

    $scope.goBack = function () {
        $state.go('mainMenu');
    }


});
