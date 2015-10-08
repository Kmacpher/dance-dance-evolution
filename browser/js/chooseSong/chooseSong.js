app.config(function ($stateProvider) {

    $stateProvider.state('chooseSong', {
        url: '/chooseSong',
        templateUrl: 'js/chooseSong/chooseSong.html',
        resolve: {
            songs: function(SongFactory) {
                return SongFactory.getSongs();
            }
        },
        controller: 'ChooseSongCtrl'
    });

});

app.controller('ChooseSongCtrl', function ($scope, CarouselFactory, $state, songs, $timeout) {

	$scope.songs = songs;
	$scope.choice = {};


    $scope.loadSong = function(level) {
      $scope.loading = true;
      setTimeout(function(){
        $state.go('animation', {songId: $scope.choice.song._id, chosenLevel: level});
      }, 5000);
    };

    $(document).ready(
    	$timeout ( function () {
    		CarouselFactory.init();
    		window.addEventListener("keydown", CarouselFactory.carouselMove, false);
    		// window.addEventListener("click", CarouselFactory.freezeCarousel);

    	})
    );

    $scope.getDifficulties = function(song) {
        $('.choose-level').css("visibility", "visible");
        $timeout(function() {
            $('#level0').addClass("selected");   
        });
        
    	$scope.choice.song = song;
        $scope.choice.levels = [];
        // var currentSong = JSON.parse($scope.choice.song);
        var charts = song.Charts;
        for(var key in charts) {
            $scope.choice.levels.push(key);
        }
        $scope.choice.levels.reverse();
        window.removeEventListener("keydown", CarouselFactory.carouselMove, false);
        window.addEventListener("keydown", CarouselFactory.chooseLevel, false);
    };

});
