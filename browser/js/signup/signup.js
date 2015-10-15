app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });

});

app.controller('SignupCtrl', function ($scope, AuthService, $state, keyConfigFactory) {

    $scope.signup = {};
    $scope.error = null;

    $scope.sendSigup = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

    function onArrowKey(event) {
        var button = keyConfigFactory(event);
        if (!button) return;
        if (button.name === 'escape') {
            $(document).off('keydown');
            window.removeEventListener('gamepadbuttondown', onArrowKey);
            $state.go('home');
        };
    };

    $(document).on('keydown', onArrowKey);
    window.addEventListener('gamepadbuttondown', onArrowKey);
});
