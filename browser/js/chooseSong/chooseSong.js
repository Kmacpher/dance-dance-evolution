app.config(function ($stateProvider) {

    $stateProvider.state('chooseSong', {
        url: '/chooseSong',
        templateUrl: 'js/chooseSong/chooseSong.html',
        resolve: {
            songs: function(SongFactory) {
                return SongFactory.getSongs();
            }
        },
        params: {players: 1},
        controller: 'ChooseSongCtrl'
    });

});

app.controller('ChooseSongCtrl', function ($scope, CarouselFactory, $state, songs, $timeout, ToneFactory, $stateParams) {
	$scope.songs = songs;
	$scope.choice = {};
    // $scope.speedMod = ArrowFactory.speedModifier;
    // ArrowFactory.setSpeed($scope.speedMod);

    function viewSongInfo() {
        var $selected = $('.selected');
        if ($selected) $scope.selectedDifficulty = $selected[0].textContent.trim();
        console.log('selectedDifficulty:', $scope.selectedDifficulty);

        console.log('selected song:', $scope.choice.song);
        var {title, artist, displayBpm, music} = $scope.choice.song;

        $scope.selectedChart = $scope.choice.song.Charts[$scope.selectedDifficulty];
        var {level, grooveRadar} = $scope.selectedChart;

        // console.log(`Selected chart:`);
        // console.log($scope.selectedChart);
        console.log(`${title} - ${artist}`);
        console.log(`BPM: ${displayBpm}`);
        console.log(`Preview audio: ${music}`);
        console.log(`Difficulty: ${$scope.selectedDifficulty}; Feet: ${level}`);
        console.log(Object.keys(grooveRadar).reduce((output, category) => {
            return output.concat(`${category}: ${grooveRadar[category]}`);
        }, []).join(' | '));


    }

    function chooseLevel(e) {
        CarouselFactory.chooseLevel(e);
        if (e.keyCode === 38 || e.keyCode === 40) {
            ToneFactory.play('blop');
            viewSongInfo();          
        }
        if (e.keyCode === 27) {
            window.removeEventListener("keydown", chooseLevel, false);
        }
    }


    $scope.selectedDifficulty;
    $scope.selectedChart;



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
        $scope.charts = Object.keys(charts);
        //console.log('charts:', song.Charts);
        Object.keys(charts).forEach(function(key) { 
            $scope.choice.levels.push(key);
        });
        console.log('levels:', $scope.choice.levels);
        $scope.choice.levels.reverse();

        console.log('$scope.choice:', $scope.choice);

        window.removeEventListener("keydown", CarouselFactory.carouselMove, false);
        window.addEventListener("keydown", chooseLevel, false);
    };


    $scope.loadSong = function(level) {
        ToneFactory.play('start');
        window.removeEventListener("keydown", chooseLevel, false);
        $state.go('animation', {songId: $scope.choice.song._id, chosenLevel: level});
    };


});
